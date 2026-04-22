// @ts-ignore
import Client from 'bitcore-wallet-client-xvg'
import Log from 'electron-log'
import Wallet from '@/walletManager/Wallet'
import ManagerConfig, { WalletConfigItem } from '@/walletManager/ManagerConfig'
import constants from '@/utils/constants'
import Keytar from '@/utils/keytar'
import Timeout = NodeJS.Timeout

export default class WalletManager {
  protected config?: ManagerConfig
  protected ticker?: Timeout
  protected statusReporter?: (phase: string) => void

  public readonly wallets: Wallet[] = []

  public setStatusReporter (statusReporter: (phase: string) => void) {
    this.statusReporter = statusReporter
  }

  public async boot (config: ManagerConfig) {
    this.config = config
    this.reportWalletStatus(this.config.wallets.length > 0 ? 'connecting' : 'ready')

    for (const walletConfig of this.config.wallets) {
      try {
        const vwc = this.getClient(walletConfig)
        const wallet = new Wallet(walletConfig.identifier, walletConfig.name, walletConfig.color, vwc)
        await wallet.open()

        this.wallets.push(wallet)
      } catch (e) {
        Log.error(e.toString())
      }
    }

    this.startTicker()
  }

  public getWallet (identifier: string): Wallet | undefined {
    return this.wallets.find((wallet) => wallet.identifier === identifier)
  }

  public getWallets (): Wallet[] {
    return this.wallets
  }

  public async addWallet (walletConfig: WalletConfigItem) {
    const vwc = this.getClient(walletConfig)
    const wallet = new Wallet(this.generateWalletIdentifier(), walletConfig.name, walletConfig.color, vwc)

    walletConfig.identifier = wallet.identifier

    await wallet.create(walletConfig.name, walletConfig.name, 1, 1, {
      coin: walletConfig.coin,
      network: walletConfig.network,
      singleAddress: walletConfig.singleAddress
    })
    await wallet.open()
    await Keytar.setCredentials(Keytar.walletService, wallet.identifier, btoa(JSON.stringify(walletConfig)))
    this.wallets.push(wallet)

    this.restartTicker()

    return wallet
  }

  public async updateWallet (identifier: string, wallet: Wallet): Promise<Wallet> {
    const walletConfig = await this.getWalletConfig(identifier)
    // @ts-ignore
    walletConfig.vwsApi = wallet.vwc.request.baseUrl
    walletConfig.name = wallet.name!
    walletConfig.color = wallet.color!

    const encryptedWallet = btoa(JSON.stringify(walletConfig))

    await Keytar.setCredentials(Keytar.walletService, identifier, encryptedWallet)

    if (identifier !== wallet.identifier) {
      await Keytar.deleteCredentials(Keytar.walletService, identifier)
    }

    this.restartTicker()

    return wallet
  }

  public async removeWallet (wallet: Wallet): Promise<boolean> {
    const succeeded = await Keytar.deleteCredentials(Keytar.walletService, wallet.identifier)

    if (succeeded) {
      this.wallets.splice(this.wallets.findIndex(w => w === wallet), 1)
    }

    return succeeded
  }

  // TODO: function will only return passphrase when application unlocked.
  public async getWalletPassphrase (wallet: Wallet): Promise<string> {
    const walletConfig = await this.getWalletConfig(wallet.identifier)

    return walletConfig.passphrase
  }

  public getDerivedXPrivKey (wallet: Wallet): Promise<object> {
    return this.getWalletPassphrase(wallet).then(passphrase => wallet.getCredentials().getDerivedXPrivKey(passphrase))
  }

  protected getClient (walletConfig: WalletConfigItem): Client {
    const vwc = new Client({
      baseUrl: walletConfig.vwsApi || constants.vwsApi,
      verbose: false
    })

    vwc.seedFromMnemonic(walletConfig.paperkey, walletConfig)

    return vwc
  }

  protected generateWalletIdentifier (): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)

      return v.toString(16)
    })
  }

  protected async getWalletConfig (identifier: string): Promise<WalletConfigItem> {
    const encryptedWallet = await Keytar.getCredentials(Keytar.walletService, identifier)

    if (encryptedWallet === undefined) {
      throw Error(`Couldn't load wallet: ${identifier}`)
    }

    return JSON.parse(atob(encryptedWallet as string))
  }

  protected startTicker () {
    const fetch = async () => {
      if (this.wallets.length === 0) {
        this.reportWalletStatus('ready')
        return
      }

      this.reportWalletStatus('syncing')

      for (const wallet of this.wallets) {
        try {
          await wallet.status()
          await wallet.fetchTxHistory()
          await wallet.getTxProposals()
        } catch (e) {
          Log.error(e.toString())
        }
      }

      this.reportWalletStatus('ready')
    }

    this.ticker = setInterval(fetch, 30000)

    fetch()
  }

  protected stopTicker () {
    if (this.ticker) {
      clearInterval(this.ticker)
    }
  }

  protected restartTicker () {
    this.stopTicker()
    this.startTicker()
  }

  protected reportWalletStatus (phase: string) {
    if (this.statusReporter) {
      this.statusReporter(phase)
    }
  }
}
