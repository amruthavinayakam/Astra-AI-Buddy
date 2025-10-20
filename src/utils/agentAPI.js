export async function triggerAgentLoop() {
  const url = import.meta.env.VITE_AGENT_LOOP_URL
  if (!url) return { ok: false, error: 'No VITE_AGENT_LOOP_URL set' }
  const res = await fetch(url, { method: 'POST' })
  return { ok: res.ok }
}


