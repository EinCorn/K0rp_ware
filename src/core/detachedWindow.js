export function openDetachedWindow(appId) {
  const detachedUrl = `${window.location.origin}/?app=${appId}&mode=detached`
  const features = 'popup=yes,width=420,height=680,menubar=no,toolbar=no,location=no,status=no'

  window.open(detachedUrl, 'k0rp-ware-desk-parasite', features)
}
