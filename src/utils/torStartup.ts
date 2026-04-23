import { ipcRenderer } from 'electron'
import { eventConstants } from '@/utils/constants'

let torProxyPromise: Promise<any> | null = null
let lastTorProxyState: boolean | null = null
let resolvePrimaryApiReady: (() => void) | null = null

const primaryApiReadyPromise = new Promise<void>((resolve) => {
  resolvePrimaryApiReady = resolve
})

export const ensureTorProxyState = (activate: boolean) => {
  if (torProxyPromise && lastTorProxyState === activate) {
    return torProxyPromise
  }

  lastTorProxyState = activate
  torProxyPromise = ipcRenderer.invoke(eventConstants.toggleTor, { activate }).catch(error => {
    torProxyPromise = null
    throw error
  })

  return torProxyPromise
}

export const markPrimaryApiReady = () => {
  if (resolvePrimaryApiReady) {
    resolvePrimaryApiReady()
    resolvePrimaryApiReady = null
  }
}

export const waitForPrimaryApiReady = () => primaryApiReadyPromise
