import assert from 'node:assert/strict'
import test from 'node:test'
import {
  AUTHORIZATION_FORM_WINDOW_ID,
  FIDGET_AUTHORIZED_PENDING_ITEM,
  getAuthorizedPendingDesktopItems,
  reconcileAuthorizationFormWindow,
} from '../authorizationPresentation.js'
import {
  closeWindowState,
  openWindowState,
} from '../windowManager.js'

const workspaceSize = { width: 1514, height: 776 }
const formWindowSize = { width: 470, height: 310 }
const formBasePosition = { x: 184, y: 58 }

const createBaseWindows = () => ({
  'form:audit-00-a': {
    id: 'form:audit-00-a',
    documentId: 'audit-00-a',
    kind: 'form',
    width: formWindowSize.width,
    height: formWindowSize.height,
    x: 184,
    y: 58,
    zIndex: 3,
    isOpen: true,
    isMinimized: false,
    hasOpened: true,
  },
  'form:audit-10-a:bootstrap': {
    id: 'form:audit-10-a:bootstrap',
    documentId: 'audit-10-a:bootstrap',
    kind: 'form',
    width: formWindowSize.width,
    height: formWindowSize.height,
    x: 700,
    y: 300,
    zIndex: 8,
    isOpen: true,
    isMinimized: false,
    hasOpened: true,
  },
  'daily-report': {
    id: 'daily-report',
    kind: 'memo',
    width: 392,
    height: 192,
    x: 500,
    y: 200,
    zIndex: 20,
    isOpen: true,
    isMinimized: false,
    hasOpened: true,
  },
})

const reconcile = (overrides = {}) => reconcileAuthorizationFormWindow({
  windows: createBaseWindows(),
  isAvailable: false,
  wasAvailable: false,
  windowSize: formWindowSize,
  workspaceSize,
  formBasePosition,
  ...overrides,
})

test('an unavailable authorization form has no window descriptor', () => {
  const windows = createBaseWindows()
  const absent = reconcile({ windows })

  assert.equal(absent.windows, windows)
  assert.equal(AUTHORIZATION_FORM_WINDOW_ID in absent.windows, false)
  assert.equal(absent.didAutoOpen, false)

  const registered = reconcile({
    windows,
    isAvailable: true,
    wasAvailable: true,
  })
  const unavailableAgain = reconcile({
    windows: registered.windows,
    isAvailable: false,
    wasAvailable: true,
  })

  assert.equal(AUTHORIZATION_FORM_WINDOW_ID in unavailableAgain.windows, true)
  assert.equal(unavailableAgain.windows[AUTHORIZATION_FORM_WINDOW_ID].isOpen, false)
  assert.equal(unavailableAgain.windows['daily-report'], windows['daily-report'])
})

test('initial load of an already available form registers it closed without focus steal', () => {
  const windows = createBaseWindows()
  const loaded = reconcile({
    windows,
    isAvailable: true,
    wasAvailable: undefined,
  })
  const descriptor = loaded.windows[AUTHORIZATION_FORM_WINDOW_ID]

  assert.equal(loaded.didAutoOpen, false)
  assert.equal(descriptor.isOpen, false)
  assert.equal(descriptor.isMinimized, false)
  assert.equal(descriptor.hasOpened, false)
  assert.equal(descriptor.zIndex, 0)
  assert.equal(loaded.windows['daily-report'], windows['daily-report'])
  assert.equal(loaded.windows['daily-report'].zIndex, 20)
})

test('a false-to-true transition auto-opens once from the moved frontmost form', () => {
  const windows = createBaseWindows()
  const available = reconcile({
    windows,
    isAvailable: true,
    wasAvailable: false,
  })
  const descriptor = available.windows[AUTHORIZATION_FORM_WINDOW_ID]

  assert.equal(available.didAutoOpen, true)
  assert.equal(descriptor.isOpen, true)
  assert.equal(descriptor.hasOpened, true)
  assert.deepEqual({ x: descriptor.x, y: descriptor.y }, { x: 718, y: 314 })
  assert.equal(descriptor.zIndex, 21)

  const sameUpdaterReplay = reconcile({
    windows,
    isAvailable: true,
    wasAvailable: false,
  })
  assert.deepEqual(sameUpdaterReplay, available)

  const reconciledAgain = reconcile({
    windows: available.windows,
    isAvailable: true,
    wasAvailable: false,
  })
  assert.equal(reconciledAgain.didAutoOpen, false)
  assert.equal(reconciledAgain.windows, available.windows)
  assert.equal(
    reconciledAgain.windows[AUTHORIZATION_FORM_WINDOW_ID].zIndex,
    descriptor.zIndex,
  )
})

test('losing and regaining Evidence cannot auto-open the form a second time', () => {
  const firstAvailable = reconcile({
    isAvailable: true,
    wasAvailable: false,
  })
  const moved = {
    ...firstAvailable.windows,
    [AUTHORIZATION_FORM_WINDOW_ID]: {
      ...firstAvailable.windows[AUTHORIZATION_FORM_WINDOW_ID],
      x: 812,
      y: 366,
    },
  }
  const unavailable = reconcile({
    windows: moved,
    isAvailable: false,
    wasAvailable: true,
  })
  const regained = reconcile({
    windows: unavailable.windows,
    isAvailable: true,
    wasAvailable: false,
  })

  assert.equal(unavailable.windows[AUTHORIZATION_FORM_WINDOW_ID].isOpen, false)
  assert.equal(unavailable.windows[AUTHORIZATION_FORM_WINDOW_ID].hasOpened, true)
  assert.equal(regained.didAutoOpen, false)
  assert.equal(regained.windows, unavailable.windows)
  assert.deepEqual(
    {
      x: regained.windows[AUTHORIZATION_FORM_WINDOW_ID].x,
      y: regained.windows[AUTHORIZATION_FORM_WINDOW_ID].y,
    },
    { x: 812, y: 366 },
  )
})

test('completed available form closes and reopens with one stable id and position', () => {
  const firstOpen = reconcile({
    isAvailable: true,
    wasAvailable: false,
  })
  const moved = {
    ...firstOpen.windows,
    [AUTHORIZATION_FORM_WINDOW_ID]: {
      ...firstOpen.windows[AUTHORIZATION_FORM_WINDOW_ID],
      x: 812,
      y: 366,
    },
  }
  const closed = closeWindowState(moved, AUTHORIZATION_FORM_WINDOW_ID)
  const completed = reconcile({
    windows: closed,
    isAvailable: true,
    wasAvailable: true,
  })

  assert.equal(completed.windows, closed)
  assert.equal(completed.windows[AUTHORIZATION_FORM_WINDOW_ID].isOpen, false)

  const reopened = openWindowState(
    completed.windows,
    AUTHORIZATION_FORM_WINDOW_ID,
    { workspaceSize, formBasePosition },
  )

  assert.equal(reopened[AUTHORIZATION_FORM_WINDOW_ID].isOpen, true)
  assert.deepEqual(
    {
      x: reopened[AUTHORIZATION_FORM_WINDOW_ID].x,
      y: reopened[AUTHORIZATION_FORM_WINDOW_ID].y,
    },
    { x: 812, y: 366 },
  )
  assert.equal(
    Object.keys(reopened).filter((id) => id === AUTHORIZATION_FORM_WINDOW_ID).length,
    1,
  )
})

test('Fidget pending desktop item appears once only after authorization', () => {
  assert.deepEqual(getAuthorizedPendingDesktopItems([]), [])
  assert.deepEqual(getAuthorizedPendingDesktopItems(undefined), [])

  const items = getAuthorizedPendingDesktopItems([
    { id: 'fidget', moduleId: 'fidget' },
    { id: 'fidget-duplicate', moduleId: 'fidget' },
  ])

  assert.deepEqual(items, [FIDGET_AUTHORIZED_PENDING_ITEM])
  assert.equal(items[0].title, 'Fidget')
  assert.equal(items[0].status, 'AUTORIZOVÁNO / NASAZENÍ ČEKÁ')
  assert.equal(items[0].glyph, 'generic-app')
  assert.equal(items[0].isInteractive, false)
  assert.equal('windowId' in items[0], false)
  assert.equal('openTarget' in items[0], false)
})
