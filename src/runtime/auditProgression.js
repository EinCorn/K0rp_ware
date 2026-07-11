const appendUnique = (ids, id) => (ids.includes(id) ? ids : [...ids, id])

export const createInitialAuditProgressionState = () => ({
  submittedFormIds: [],
  ownedUpgradeIds: [],
  unlockedMemoIds: [],
  unlockedModuleIds: [],
})

export const getAuditForm = (auditForms, formId) => (
  auditForms.find((form) => form.id === formId)
)

export function isAuditFormAvailable(form, korpState) {
  if (!form) return false
  if (form.availableAtStart === true) return true

  const requirement = form.requirements
  if (!requirement || requirement.kind !== 'eventCountAtLeast') return false
  if (
    typeof requirement.eventType !== 'string'
    || !Number.isFinite(requirement.count)
    || requirement.count < 0
  ) return false

  return (korpState.stats.eventsByType[requirement.eventType] ?? 0) >= requirement.count
}

export function applyAuditCompletionEffects(progressionState, completionEffects) {
  const effects = Array.isArray(completionEffects) ? completionEffects : []

  return effects.reduce((nextState, effect) => {
    if (effect.kind === 'unlockUpgrade' && typeof effect.upgradeId === 'string') {
      return {
        ...nextState,
        ownedUpgradeIds: appendUnique(nextState.ownedUpgradeIds, effect.upgradeId),
      }
    }

    if (effect.kind === 'unlockMemo' && typeof effect.memoId === 'string') {
      return {
        ...nextState,
        unlockedMemoIds: appendUnique(nextState.unlockedMemoIds, effect.memoId),
      }
    }

    if (effect.kind === 'unlockModule' && typeof effect.moduleId === 'string') {
      return {
        ...nextState,
        unlockedModuleIds: appendUnique(nextState.unlockedModuleIds, effect.moduleId),
      }
    }

    return nextState
  }, progressionState)
}

export function submitAuditForm({ form, korpState, progressionState }) {
  if (
    !form
    || !isAuditFormAvailable(form, korpState)
    || progressionState.submittedFormIds.includes(form.id)
  ) {
    return { didSubmit: false, progressionState }
  }

  return {
    didSubmit: true,
    progressionState: applyAuditCompletionEffects({
      ...progressionState,
      submittedFormIds: appendUnique(progressionState.submittedFormIds, form.id),
    }, form.completionEffects),
  }
}
