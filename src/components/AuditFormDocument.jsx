import {
  getAuditSubmitField,
  isAuditFormComplete,
  updateMultiCheckValue,
} from '../runtime/auditFormDraft'
import './AuditFormDocument.css'

function CheckboxField({ field, value, onChange }) {
  return (
    <label className="os-audit-checkbox">
      <input
        type="checkbox"
        checked={value === true}
        onChange={(event) => onChange(field, event.target.checked)}
      />
      <span aria-hidden="true" className="os-audit-checkbox-box" />
      <strong>{field.label}</strong>
    </label>
  )
}

function RadioField({ field, value, onChange, formId }) {
  return (
    <fieldset className="os-audit-choice-group">
      <legend>{field.label}</legend>
      {field.options?.map((option) => (
        <label key={option}>
          <input
            type="radio"
            name={formId + '-' + field.id}
            value={option}
            checked={value === option}
            onChange={() => onChange(field, option)}
          />
          <span>{option}</span>
        </label>
      ))}
    </fieldset>
  )
}

function MultiCheckField({ field, value, onChange }) {
  return (
    <fieldset className="os-audit-choice-group">
      <legend>{field.label}</legend>
      {field.options?.map((option) => {
        const checked = Array.isArray(value) && value.includes(option)

        return (
          <label key={option}>
            <input
              type="checkbox"
              checked={checked}
              onChange={(event) => onChange(
                field,
                updateMultiCheckValue(value, option, event.target.checked),
              )}
            />
            <span>{option}</span>
          </label>
        )
      })}
    </fieldset>
  )
}

function ScaleField({ field, value, onChange, formId }) {
  const labels = Array.isArray(field.labels) ? field.labels : []

  return (
    <fieldset className="os-audit-choice-group os-audit-scale-group">
      <legend>{field.label}</legend>
      {labels.map((label, index) => {
        const optionValue = Number(field.minimum ?? 0) + index

        return (
          <label key={label}>
            <input
              type="radio"
              name={formId + '-' + field.id}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(field, optionValue)}
            />
            <span>{label}</span>
          </label>
        )
      })}
    </fieldset>
  )
}

function AuditFieldControl(props) {
  const { field } = props

  switch (field.type) {
    case 'checkbox':
      return <CheckboxField {...props} />
    case 'radio':
      return <RadioField {...props} />
    case 'multiCheck':
      return <MultiCheckField {...props} />
    case 'scale':
      return <ScaleField {...props} />
    default:
      return (
        <p className="os-audit-unsupported-field">
          Pole {field.id} není v tomto sestavení procesně podporováno.
        </p>
      )
  }
}

export default function AuditFormDocument({
  form,
  values,
  submitted,
  headingId = 'audit-title',
  controlScopeId,
  documentLabel,
  introText = 'Vyplňte všechna povinná pole. Rozsah auditu byl omezen na minimum, které lze stále nazvat auditem.',
  pendingStatusText = 'ČEKÁ NA POTVRZENÍ PŘÍTOMNOSTI',
  readyStatusText = 'POVINNÁ POLE SPLNĚNA',
  completionHeadingLabel,
  completionTitle = 'PŘÍTOMNOST PŘIJATA',
  completionDetail = 'DOKUMENT SPLNĚN / MÍSTNĚ ULOŽENO',
  completionNote = 'Auditní stopa byla předána modulu ClickAudit. Odpověď již nelze zpětně učinit méně přítomnou.',
  onFieldChange,
  onSubmit,
}) {
  const fields = form?.fields?.filter((field) => field.type !== 'buttonConfirm') ?? []
  const submitField = getAuditSubmitField(form)
  const complete = isAuditFormComplete(form, values)
  const activeControlScopeId = controlScopeId ?? form?.id ?? 'audit-form'

  if (!form) {
    return (
      <div className="os-audit-document os-audit-document-error">
        Auditní dokument nebyl nalezen.
      </div>
    )
  }

  const activeDocumentLabel = documentLabel ?? `STARTUP PROCEDURA / FORMULÁŘ ${form.code}`
  const closedDocumentLabel = completionHeadingLabel ?? `FORMULÁŘ ${form.code} / UZAVŘENÝ ZÁZNAM`

  if (submitted) {
    return (
      <div className="os-audit-document is-submitted" data-clickaudit-profile="completed-audit-body">
        <div className="os-audit-document-heading">
          <p>{closedDocumentLabel}</p>
          <h1 id={headingId}>{form.title}</h1>
        </div>
        <div className="os-audit-completion-stamp">
          <span>✓</span>
          <strong>{completionTitle}</strong>
          <small>{completionDetail}</small>
        </div>
        <p className="os-audit-document-note">{completionNote}</p>
      </div>
    )
  }

  return (
    <form
      className="os-audit-document"
      data-clickaudit-profile="active-audit-field"
      onSubmit={(event) => {
        event.preventDefault()
        if (complete) onSubmit(submitField)
      }}
    >
      <div className="os-audit-document-heading">
        <p>{activeDocumentLabel}</p>
        <h1 id={headingId}>{form.title}</h1>
        <span>{introText}</span>
      </div>

      <div className="os-audit-fields">
        {fields.map((field) => (
          <AuditFieldControl
            key={field.id}
            formId={activeControlScopeId}
            field={field}
            value={values?.[field.id]}
            onChange={onFieldChange}
          />
        ))}
      </div>

      <div className="os-audit-submit-row">
        <span className="os-audit-form-status">
          {complete ? readyStatusText : pendingStatusText}
        </span>
        <button type="submit" className="os-audit-submit" disabled={!complete}>
          {submitField?.label ?? 'ODESLAT AUDIT'}
        </button>
      </div>
    </form>
  )
}
