export const calculateXP = (tasksDone, missed) => tasksDone * 10 - missed * 5
export const getLevel = (xp) => Math.floor(xp / 100)
export const getStage = (level) => level < 5 ? 'Baby' : level < 10 ? 'Explorer' : level < 20 ? 'Mentor' : 'Ascended'

export function applyDailyXP({ currentXp, tasksDone, missed }) {
  const delta = calculateXP(tasksDone, missed)
  const newXp = Math.max(0, currentXp + delta)
  return {
    newXp,
    newLevel: getLevel(newXp)
  }
}


