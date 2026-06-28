export function supportsPinnedWindow() {
  return typeof window !== 'undefined' && 'documentPictureInPicture' in window
}

export async function requestPinnedWindow({ width = 420, height = 680 } = {}) {
  if (!supportsPinnedWindow()) {
    return null
  }

  const pipWindow = await window.documentPictureInPicture.requestWindow({ width, height })
  preparePinnedDocument(pipWindow.document)

  return pipWindow
}

function preparePinnedDocument(targetDocument) {
  targetDocument.title = 'K0rp_ware pinned'
  targetDocument.body.innerHTML = '<div id="k0rp-pinned-root"></div>'
  targetDocument.body.className = 'pinned-body'

  copyStyleSheets(targetDocument)
}

function copyStyleSheets(targetDocument) {
  Array.from(document.styleSheets).forEach((styleSheet) => {
    try {
      const cssText = Array.from(styleSheet.cssRules)
        .map((rule) => rule.cssText)
        .join('\n')
      const style = targetDocument.createElement('style')
      style.textContent = cssText
      targetDocument.head.appendChild(style)
    } catch {
      if (styleSheet.href) {
        const link = targetDocument.createElement('link')
        link.rel = 'stylesheet'
        link.href = styleSheet.href
        targetDocument.head.appendChild(link)
      }
    }
  })
}
