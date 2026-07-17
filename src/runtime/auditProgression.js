const appendUnique = (ids, id) => (ids.includes(id) ? ids : [...ids, id])

export const EVIDENCE_AUTHORIZATION_RESOURCE_ID = 'notionalWorkUnits'

export const createInitialAuditProgressionState = () => ({
  submittedFormIds: [],
  ownedUpgradeIds: [],
  unlockedMemoIds: [],
  unlockedModuleIds: [],
})

export const getAuditForm = (auditForms, formId) => (
  auditForms.find((form) => form.id === formId)
)

const isRequirementSatisfied = (requirement, korpState) => {
  if (!requirement || typeof requirement !== 'object') return false

  if (requirement.kind === 'eventCountAtLeast') {
    if (
      typeof requirement.eventType !== 'string'
      || !Number.isFinite(requirement.count)
      || requirement.count < 0
    ) return false

    const eventCount = korpState?.stats?.eventsByType?.[requirement.eventType]
    return (Number.isFinite(eventCount) ? eventCount : 0) >= requirement.count
  }

  if (requirement.kind === 'resourceAtLeast') {
    if (
      typeof requirement.resourceId !== 'string'
      || !Number.isFinite(requirement.amount)
      || requirement.amount < 0
    ) return false

    const resourceAmount = korpState?.resources?.[requirement.resourceId]
    return Number.isFinite(resourceAmount) && resourceAmount >= requirement.amount
  }

  if (requirement.kind === 'all') {
    return Array.isArray(requirement.requirements)
      && requirement.requirements.length > 0
      && requirement.requirements.every((child) => (
        isRequirementSatisfied(child, korpState)
      ))
  }

  return false
}

export function isAuditFormAvailable(form, korpState, progressionState) {
  if (!form) return false
  if (
    typeof form.id === 'string'
    && Array.isArray(progressionState?.submittedFormIds)
    && progressionState.submittedFormIds.includes(form.id)
  ) return true
  if (form.availableAtStart === true) return true

  return isRequirementSatisfied(form.requirements, korpState)
}

export function getAuditAuthorization(form) {
  const authorization = form?.authorization
  if (
    !authorization
    || typeof authorization !== 'object'
    || typeof authorization.moduleId !== 'string'
    || authorization.moduleId.length === 0
    || authorization.resourceId !== EVIDENCE_AUTHORIZATION_RESOURCE_ID
    || !Number.isSafeInteger(authorization.cost)
    || authorization.cost <= 0
  ) return null

  return {
    moduleId: authorization.moduleId,
    resourceId: authorization.resourceId,
    cost: authorization.cost,
  }
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
  const authorization = getAuditAuthorization(form)
  if (
    !form
    || !isAuditFormAvailable(form, korpState, progressionState)
    || progressionState.submittedFormIds.includes(form.id)
    || ('authorization' in form && !authorization)
  ) {
    return { didSubmit: false, progressionState, authorization: null }
  }

  return {
    didSubmit: true,
    authorization,
    progressionState: applyAuditCompletionEffects({
      ...progressionState,
      submittedFormIds: appendUnique(progressionState.submittedFormIds, form.id),
    }, form.completionEffects),
  }
}
