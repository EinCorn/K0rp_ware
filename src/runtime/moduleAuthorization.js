import { isAuditFormComplete } from './auditFormDraft.js'
import {
  EVIDENCE_AUTHORIZATION_RESOURCE_ID,
  submitAuditForm,
} from './auditProgression.js'

const appendUnique = (ids, id) => (ids.includes(id) ? ids : [...ids, id])

const failedAuthorization = (progressionState, moduleAuthorizations) => ({
  didAuthorize: false,
  progressionState,
  moduleAuthorizations,
  events: [],
  authorization: null,
  allocation: null,
})

export const isModuleAuthorized = (moduleAuthorizations, moduleId) => (
  typeof moduleId === 'string'
  && moduleId.length > 0
  && Array.isArray(moduleAuthorizations)
  && moduleAuthorizations.some((authorization) => authorization?.moduleId === moduleId)
)

export const canAllocateAuthorization = (korpState, authorization) => {
  if (
    !authorization
    || authorization.resourceId !== EVIDENCE_AUTHORIZATION_RESOURCE_ID
    || !Number.isSafeInteger(authorization.cost)
    || authorization.cost <= 0
  ) return false

  const balance = korpState?.resources?.[authorization.resourceId]
  return Number.isFinite(balance) && balance >= authorization.cost
}

export function resolveModuleAuthorizationSubmission({
  form,
  values,
  korpState,
  progressionState,
  moduleAuthorizations,
  timestamp,
}) {
  const currentAuthorizations = Array.isArray(moduleAuthorizations)
    ? moduleAuthorizations
    : []
  const failed = () => failedAuthorization(progressionState, currentAuthorizations)

  if (
    !form
    || typeof form.id !== 'string'
    || typeof form.submitEvent !== 'string'
    || form.submitEvent.length === 0
    || !Number.isFinite(timestamp)
    || timestamp < 0
    || !isAuditFormComplete(form, values)
  ) return failed()

  const progression = submitAuditForm({ form, korpState, progressionState })
  const declaration = progression.authorization

  if (
    !progression.didSubmit
    || !declaration
    || currentAuthorizations.some((authorization) => (
      authorization?.id === declaration.moduleId
      || authorization?.moduleId === declaration.moduleId
    ))
    || !canAllocateAuthorization(korpState, declaration)
  ) return failed()

  const authorization = {
    id: declaration.moduleId,
    moduleId: declaration.moduleId,
    sourceFormId: form.id,
    evidenceCost: declaration.cost,
    grantedAt: timestamp,
  }
  const eventMeta = {
    formId: form.id,
    moduleId: declaration.moduleId,
    resourceId: declaration.resourceId,
  }

  return {
    didAuthorize: true,
    authorization,
    allocation: {
      resourceId: declaration.resourceId,
      cost: declaration.cost,
    },
    moduleAuthorizations: [...currentAuthorizations, authorization],
    progressionState: {
      ...progression.progressionState,
      unlockedModuleIds: appendUnique(
        progression.progressionState.unlockedModuleIds,
        declaration.moduleId,
      ),
    },
    events: [
      {
        id: `k0rp-os-audit-form-submitted-${form.id}-${timestamp}`,
        timestamp,
        sourceModule: 'system',
        type: form.submitEvent,
        tags: ['k0rp-os', 'audit-form', form.id],
        meta: { formId: form.id },
      },
      {
        id: `k0rp-os-authorization-evidence-${declaration.moduleId}-${timestamp}`,
        timestamp,
        sourceModule: 'system',
        type: 'authorization.evidenceAllocated',
        value: declaration.cost,
        tags: ['k0rp-os', 'authorization', declaration.moduleId],
        meta: eventMeta,
      },
      {
        id: `k0rp-os-authorization-granted-${declaration.moduleId}-${timestamp}`,
        timestamp,
        sourceModule: 'system',
        type: 'authorization.granted',
        tags: ['k0rp-os', 'authorization', declaration.moduleId],
        meta: eventMeta,
      },
    ],
  }
}

export function applyModuleAuthorizationTransaction({
  runtime,
  form,
  values,
  timestamp,
  applyEvents,
}) {
  if (!runtime || typeof applyEvents !== 'function') {
    return { didAuthorize: false, runtimeState: runtime }
  }

  const resolution = resolveModuleAuthorizationSubmission({
    form,
    values,
    korpState: runtime.korpState,
    progressionState: runtime,
    moduleAuthorizations: runtime.moduleAuthorizations,
    timestamp,
  })

  if (
    !resolution.didAuthorize
    || resolution.allocation.resourceId !== EVIDENCE_AUTHORIZATION_RESOURCE_ID
  ) return { didAuthorize: false, runtimeState: runtime }

  const korpState = applyEvents(runtime.korpState, resolution.events)
  const expectedEvidence = runtime.korpState.resources.notionalWorkUnits
    - resolution.allocation.cost

  if (korpState?.resources?.notionalWorkUnits !== expectedEvidence) {
    return { didAuthorize: false, runtimeState: runtime }
  }

  return {
    didAuthorize: true,
    authorization: resolution.authorization,
    events: resolution.events,
    runtimeState: {
      ...runtime,
      ...resolution.progressionState,
      moduleAuthorizations: resolution.moduleAuthorizations,
      korpState,
      lifetimeStats: korpState.stats,
    },
  }
}
