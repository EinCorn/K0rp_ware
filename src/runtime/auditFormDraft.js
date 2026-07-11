const interactiveFields = (form) => (
  Array.isArray(form?.fields)
    ? form.fields.filter((field) => field.type !== 'buttonConfirm')
    : []
)

const initialValueForField = (field) => {
  switch (field.type) {
    case 'checkbox':
      return false
    case 'multiCheck':
      return []
    case 'radio':
    case 'scale':
      return null
    default:
      return null
  }
}

export const createAuditFormValues = (form) => Object.fromEntries(
  interactiveFields(form).map((field) => [field.id, initialValueForField(field)]),
)

export const getAuditSubmitField = (form) => (
  Array.isArray(form?.fields)
    ? form.fields.find((field) => field.type === 'buttonConfirm') ?? null
    : null
)

export const isAuditFieldComplete = (field, value) => {
  if (!field?.required) return true

  switch (field.type) {
    case 'checkbox':
      return value === true
    case 'radio':
      return typeof value === 'string' && value.length > 0
    case 'multiCheck': {
      const minimumSelections = Number.isInteger(field.minimumSelections)
        ? field.minimumSelections
        : 1
      return Array.isArray(value) && value.length >= minimumSelections
    }
    case 'scale':
      return Number.isFinite(value)
        && value >= field.minimum
        && value <= field.maximum
    case 'buttonConfirm':
      return true
    default:
      return false
  }
}

export const isAuditFormComplete = (form, values) => (
  interactiveFields(form).every((field) => isAuditFieldComplete(field, values?.[field.id]))
)

export const updateMultiCheckValue = (currentValue, option, checked) => {
  const values = Array.isArray(currentValue) ? currentValue : []

  if (checked) {
    return values.includes(option) ? values : [...values, option]
  }

  return values.filter((value) => value !== option)
}
