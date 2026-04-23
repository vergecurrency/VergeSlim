import Vue, { PluginFunction } from 'vue'
import WalletManager from '@/walletManager/WalletManager'
import ManagerConfig, { WalletConfigItem } from '@/walletManager/ManagerConfig'
import Keytar from '@/utils/keytar'
import { resolveVwsApiUrl } from '@/utils/vwsApi'
import { Store } from 'vuex'
import { ensureTorProxyState } from '@/utils/torStartup'

const walletManager: PluginFunction<any> = function (vue: typeof Vue, options: any): void {
  const manager = new WalletManager()
  manager.setStatusReporter((phase: string) => {
    options.store.dispatch('updateWalletStatus', phase)
  })
  vue.prototype.$walletManager = manager

  options.store.dispatch('updateWalletStatus', 'connecting')

  loadWallets(options.store).then(async (wallets: WalletConfigItem[]) => {
    await ensureTorProxyState(options.store.getters.isTorEnabled)
    vue.prototype.$walletManager.boot(new ManagerConfig(wallets))
  }).catch((error: any) => {
    options.store.dispatch('updateWalletStatus', 'idle')

    if (Keytar.isAccessError(error)) {
      const details = error && error.originalMessage ? `<br/><br/><small>${error.originalMessage}</small>` : ''

      vue.prototype.$buefy.dialog.alert({
        title: 'Could Not Load Wallets',
        message: `${Keytar.accessErrorMessage}${details}`,
        type: 'is-danger',
        hasIcon: true
      })

      return
    }

    vue.prototype.$buefy.dialog.alert({
      title: 'Could Not Load Wallets',
      message: error.toString(),
      type: 'is-danger',
      hasIcon: true
    })
  })
}

const loadWallets = async (store: Store<any>): Promise<WalletConfigItem[]> => {
  await migrateOldWallets(store)

  const identifiers = store.getters.allWalletIdentifiers

  if (identifiers.length === 0) {
    return []
  }

  return Promise.all(identifiers.map(async (identifier: string): Promise<WalletConfigItem> => {
    const encryptedWallet = await Keytar.getCredentials(Keytar.walletService, identifier)

    if (encryptedWallet === undefined) {
      throw Error(`Couldn't load wallet: ${identifier}`)
    }

    const wallet = JSON.parse(atob(encryptedWallet as string))
    wallet.vwsApi = resolveVwsApiUrl(wallet.vwsApi || store.getters.currentVwsApi)

    return wallet
  }))
}

/**
 * Migrate the stored wallet names to wallet identifiers.
 */
const migrateOldWallets = async (store: Store<any>): Promise<any> => {
  const names = store.getters.allWalletNames

  return Promise.all(names.map(async (name: string): Promise<WalletConfigItem> => {
    const encryptedWallet = await Keytar.getCredentials(Keytar.walletService, name)

    if (encryptedWallet === undefined) {
      throw Error(`Couldn't load wallet: ${name}`)
    }

    const wallet = JSON.parse(atob(encryptedWallet as string))
    const identifier = generateWalletIdentifier()
    wallet.identifier = identifier
    wallet.vwsApi = resolveVwsApiUrl(wallet.vwsApi || store.getters.currentVwsApi)

    // Remove old items
    await store.dispatch('removeWalletName', wallet.name)
    await Keytar.deleteCredentials(Keytar.walletService, wallet.name)

    // Add new items
    await store.dispatch('addWalletIdentifier', identifier)
    await Keytar.setCredentials(Keytar.walletService, identifier, btoa(JSON.stringify(wallet)))

    return wallet
  }))
}

const generateWalletIdentifier = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)

    return v.toString(16)
  })
}

export default walletManager
