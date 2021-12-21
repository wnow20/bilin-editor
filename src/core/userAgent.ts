export const isWin =
    navigator.platform === 'Win32' || navigator.platform === 'Windows'
export const isMac =
    navigator.platform === 'Mac68K' ||
    navigator.platform === 'MacPPC' ||
    navigator.platform === 'Macintosh' ||
    navigator.platform === 'MacIntel'

export const isUnix = navigator.platform === 'X11' && !isWin && !isMac
export const isLinux = String(navigator.platform).indexOf('Linux') > -1

