import os
import datetime as dt
from typing import Dict, Any, List

import functions_framework
import firebase_admin
from firebase_admin import credentials, firestore, messaging as fcm

# Gemini
import google.generativeai as genai


# Initialize Firebase Admin (uses default credentials in Cloud; locally reads env var if provided)
if not firebase_admin._apps:
    cred_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if cred_path and os.path.exists(cred_path):
        firebase_admin.initialize_app(credentials.Certificate(cred_path))
    else:
        firebase_admin.initialize_app()

db = firestore.client()

genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
_model_name = os.getenv("GEMINI_MODEL", "gemini-2.0-flash")


def _now_utc() -> dt.datetime:
    return dt.datetime.utcnow()


def _get_user_habits(user_id: str) -> List[Dict[str, Any]]:
    habits = db.collection("habits").where("userId", "==", user_id).stream()
    return [dict(id=h.id, **h.to_dict()) for h in habits]


def _count_done_today(habits: List[Dict[str, Any]]) -> int:
    return sum(1 for h in habits if h.get("doneToday") is True)


def _build_prompt(xp: int, streak: int, last_active: str) -> str:
    return (
        "You are Astra, an AI life-RPG companion.\n"
        f"Given: XP={xp}, streak={streak}, lastActive={last_active}.\n"
        "Generate strictly in JSON with keys: quest, message, mood.\n"
        "Rules: quest <= 25 words, message <= 15 words, mood in [happy, neutral, sad]."
    )


def _call_gemini(prompt: str) -> Dict[str, Any]:
    model = genai.GenerativeModel(_model_name)
    res = model.generate_content(prompt)
    text = (res.text or "").strip()
    # Best-effort parse; if not valid JSON, fallback
    import json
    try:
        data = json.loads(text)
        return {
            "quest": data.get("quest", "Do one small productive action."),
            "message": data.get("message", "You've got this!"),
            "mood": data.get("mood", "neutral"),
        }
    except Exception:
        # Fallback simple parse by lines
        return {
            "quest": "Do one small productive action.",
            "message": "You've got this!",
            "mood": "neutral",
        }


def _apply_xp_rules(current_xp: int, tasks_done: int, missed: int) -> Dict[str, int]:
    delta = tasks_done * 10 - missed * 5
    new_xp = max(0, current_xp + delta)
    level = new_xp // 100
    return {"xp": new_xp, "level": level, "delta": delta}


def _append_memory(user_id: str, role: str, text: str) -> None:
    # short memory: store last 10 entries
    db.collection("users").document(user_id).collection("memory_short").add({
        "role": role,
        "text": text,
        "timestamp": firestore.SERVER_TIMESTAMP,
    })
    # Optionally could prune to 10 via a background job


def _update_long_memory(user_id: str, xp: int, streak: int, mood: str) -> None:
    ref = db.collection("users").document(user_id).collection("memory_long").document("summary")
    ref.set({
        "lastUpdate": firestore.SERVER_TIMESTAMP,
        "xp": xp,
        "streak": streak,
        "mood": mood,
    }, merge=True)


def _notify(user_id: str, title: str, body: str) -> None:
    # send to per-user topic; client should subscribe to "/topics/{userId}"
    try:
        message = fcm.Message(
            notification=fcm.Notification(title=title, body=body),
            topic=user_id,
        )
        fcm.send(message)
    except Exception:
        pass


@functions_framework.http
def agent_loop(request):
    # Authenticating Scheduler can add a header/token validation here
    users = db.collection("users").stream()
    now = _now_utc().isoformat()

    for user in users:
        uid = user.id
        u = user.to_dict() or {}
        xp = int(u.get("xp", 0))
        streak = int(u.get("streak", 0))
        last_active = u.get("lastActive") or now

        habits = _get_user_habits(uid)
        tasks_done = _count_done_today(habits)
        missed = 0  # optionally compute by comparing schedule

        plan = _call_gemini(_build_prompt(xp, streak, str(last_active)))

        # Update XP/level
        xp_res = _apply_xp_rules(xp, tasks_done, missed)
        mood = plan.get("mood", "neutral")

        user_ref = db.collection("users").document(uid)
        user_ref.set({
            "xp": xp_res["xp"],
            "level": xp_res["level"],
            "mood": mood,
            "lastActive": firestore.SERVER_TIMESTAMP,
        }, merge=True)

        # Write quest
        db.collection("quests").add({
            "userId": uid,
            "text": plan.get("quest"),
            "createdAt": firestore.SERVER_TIMESTAMP,
            "status": "new",
        })

        # Write message from Astra
        msg_text = plan.get("message", "You've got this!")
        db.collection("messages").add({
            "userId": uid,
            "sender": "astra",
            "text": msg_text,
            "timestamp": firestore.SERVER_TIMESTAMP,
        })

        _append_memory(uid, "system", f"Quest: {plan.get('quest')}")
        _append_memory(uid, "assistant", msg_text)
        _update_long_memory(uid, xp_res["xp"], streak, mood)

        _notify(uid, "Astra has a new quest!", msg_text)

    return ("ok", 200)


