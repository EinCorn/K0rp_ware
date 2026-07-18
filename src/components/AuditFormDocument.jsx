import {
  getAuditSubmitField,
  isAuditFormComplete,
  updateMultiCheckValue,
} from '../runtime/auditFormDraft'
import {
  getKorpV3AuditButtonAssetId,
  getKorpV3CheckboxAssetId,
} from '../runtime/korpV3WindowPresentation'
import { resolveKorpUiAsset } from '../ui/korpUiAssetCatalog.js'
import './AuditFormDocument.css'

const cssAssetUrl = (id) => {
  const runtimeUrl = resolveKorpUiAsset(id)?.runtimeUrl
  return runtimeUrl ? `url("${runtimeUrl}")` : 'none'
}

function CheckboxField({ field, value, onChange, visualVariant }) {
  const isV3 = visualVariant === 'v3-audit'
  const checkboxOff = isV3 ? resolveKorpUiAsset(getKorpV3CheckboxAssetId()) : null
  const checkboxOn = isV3
    ? resolveKorpUiAsset(getKorpV3CheckboxAssetId({ checked: true }))
    : null
  const checkboxDisabled = isV3
    ? resolveKorpUiAsset(getKorpV3CheckboxAssetId({ disabled: true }))
    : null
  const assetStyle = isV3 ? {
    '--korp-v3-checkbox-off': cssAssetUrl(checkboxOff?.id),
    '--korp-v3-checkbox-off-size': `${checkboxOff?.intrinsicWidth ?? 0}px ${checkboxOff?.intrinsicHeight ?? 0}px`,
    '--korp-v3-checkbox-on': cssAssetUrl(checkboxOn?.id),
    '--korp-v3-checkbox-on-size': `${checkboxOn?.intrinsicWidth ?? 0}px ${checkboxOn?.intrinsicHeight ?? 0}px`,
    '--korp-v3-checkbox-disabled': cssAssetUrl(checkboxDisabled?.id),
    '--korp-v3-checkbox-disabled-size': `${checkboxDisabled?.intrinsicWidth ?? 0}px ${checkboxDisabled?.intrinsicHeight ?? 0}px`,
  } : undefined

  return (
    <label className="os-audit-checkbox" style={assetStyle}>
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
  documentLabel,
  introText = 'Vyplňte všechna povinná pole. Rozsah auditu byl omezen na minimum, které lze stále nazvat auditem.',
  pendingStatusText = 'ČEKÁ NA POTVRZENÍ PŘÍTOMNOSTI',
  readyStatusText = 'POVINNÁ POLE SPLNĚNA',
  completionHeadingLabel,
  completionTitle = 'PŘÍTOMNOST PŘIJATA',
  completionDetail = 'DOKUMENT SPLNĚN / MÍSTNĚ ULOŽENO',
  completionNote = 'Auditní stopa byla předána modulu ClickAudit. Odpověď již nelze zpětně učinit méně přítomnou.',
  visualVariant = 'legacy',
  onFieldChange,
  onSubmit,
}) {
  const fields = form?.fields?.filter((field) => field.type !== 'buttonConfirm') ?? []
  const submitField = getAuditSubmitField(form)
  const complete = isAuditFormComplete(form, values)
  const isV3 = visualVariant === 'v3-audit'
  const documentClassName = `os-audit-document${isV3 ? ' is-v3-audit' : ''}`

  if (!form) {
    return (
      <div className={`${documentClassName} os-audit-document-error`}>
        Auditní dokument nebyl nalezen.
      </div>
    )
  }

  const activeDocumentLabel = documentLabel ?? `STARTUP PROCEDURA / FORMULÁŘ ${form.code}`
  const closedDocumentLabel = completionHeadingLabel ?? `FORMULÁŘ ${form.code} / UZAVŘENÝ ZÁZNAM`

  if (submitted) {
    return (
      <div className={`${documentClassName} is-submitted`} data-clickaudit-profile="completed-audit-body">
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
      className={documentClassName}
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
            formId={form.id}
            field={field}
            value={values?.[field.id]}
            onChange={onFieldChange}
            visualVariant={visualVariant}
          />
        ))}
      </div>

      <div className="os-audit-submit-row">
        <span className="os-audit-form-status">
          {complete ? readyStatusText : pendingStatusText}
        </span>
        <button
          type="submit"
          className="os-audit-submit"
          disabled={!complete}
          style={isV3 ? {
            '--korp-v3-audit-button-normal': cssAssetUrl(getKorpV3AuditButtonAssetId('normal')),
            '--korp-v3-audit-button-hover': cssAssetUrl(getKorpV3AuditButtonAssetId('hover')),
            '--korp-v3-audit-button-pressed': cssAssetUrl(getKorpV3AuditButtonAssetId('pressed')),
            '--korp-v3-audit-button-disabled': cssAssetUrl(getKorpV3AuditButtonAssetId('disabled')),
          } : undefined}
          data-korp-v3-control={isV3 ? 'button.audit' : undefined}
        >
          {submitField?.label ?? 'ODESLAT AUDIT'}
        </button>
      </div>
    </form>
  )
}
