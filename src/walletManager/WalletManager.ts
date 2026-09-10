import axios from 'axios'
import Log from 'electron-log'
import ElectrumXWallet from '@/walletManager/ElectrumXWallet'
import Wallet from '@/walletManager/Wallet'
// @ts-ignore
import Client from 'bitcore-wallet-client-xvg'
import ManagerConfig, { WalletConfigItem } from '@/walletManager/ManagerConfig'
import Keytar from '@/utils/keytar'
import { resolveVwsApiUrl } from '@/utils/vwsApi'
import { ElectrumServerConfig } from '@/utils/electrumServers'
import Timeout = NodeJS.Timeout

const STARTUP_CLIENT_TIMEOUT_MS = 10000
const STEADY_STATE_CLIENT_TIMEOUT_MS = 30000
const STARTUP_ROUTE_WARMUP_ATTEMPTS = 2
const STARTUP_ROUTE_WARMUP_TIMEOUT_MS = 2500
const STARTUP_OPERATION_ATTEMPTS = 2
const STARTUP_RETRY_DELAY_MS = 1500
const INITIAL_WALLET_HYDRATION_DELAY_MS = 2500

export default class WalletManager {
  protected config?: ManagerConfig
  protected ticker?: Timeout
  protected initialHydrationTimer?: Timeout
  protected statusReporter?: (phase: string) => void
  protected torEnabled: boolean = true

  public readonly wallets: Array<Wallet | ElectrumXWallet> = []

  public setStatusReporter (statusReporter: (phase: string) => void) {
    this.statusReporter = statusReporter
  }

  public setTorEnabled (enabled: boolean) {
    this.torEnabled = enabled
  }

  public async boot (config: ManagerConfig) {
    this.config = config
    this.reportWalletStatus(this.config.wallets.length > 0 ? 'connecting' : 'ready')

    for (const walletConfig of this.config.wallets) {
      try {
        const wallet = await this.initializeWallet(walletConfig)
        this.wallets.push(wallet)
      } catch (e) {
        Log.error(String(e))
      }
    }

    this.reportWalletStatus('ready')
    this.startTicker()
  }

  public getWallet (identifier: string): Wallet | ElectrumXWallet | undefined {
    return this.wallets.find((wallet) => wallet.identifier === identifier)
  }

  public getWallets (): Array<Wallet | ElectrumXWallet> {
    return this.wallets
  }

  public async addWallet (walletConfig: WalletConfigItem) {
    walletConfig.identifier = this.generateWalletIdentifier()
    const wallet = await this.createWalletInstance(walletConfig)
    await this.persistWalletConfig(wallet.identifier, wallet instanceof ElectrumXWallet ? wallet.getWalletConfig() : walletConfig)
    this.wallets.push(wallet)

    this.restartTicker()

    return wallet
  }

  public async updateWallet (identifier: string, wallet: Wallet | ElectrumXWallet): Promise<Wallet | ElectrumXWallet> {
    const walletConfig = await this.getWalletConfig(identifier)
    if (wallet instanceof Wallet) {
      // @ts-ignore
      walletConfig.vwsApi = wallet.vwc.request.baseUrl
      walletConfig.name = wallet.name!
      walletConfig.color = wallet.color!
    } else {
      Object.assign(walletConfig, wallet.getWalletConfig())
    }

    const encryptedWallet = btoa(JSON.stringify(walletConfig))

    await Keytar.setCredentials(Keytar.walletService, identifier, encryptedWallet)

    if (identifier !== wallet.identifier) {
      await Keytar.deleteCredentials(Keytar.walletService, identifier)
    }

    this.restartTicker()

    return wallet
  }

  public async removeWallet (wallet: Wallet | ElectrumXWallet): Promise<boolean> {
    const succeeded = await Keytar.deleteCredentials(Keytar.walletService, wallet.identifier)

    if (succeeded) {
      this.wallets.splice(this.wallets.findIndex(w => w === wallet), 1)
    }

    return succeeded
  }

  // TODO: function will only return passphrase when application unlocked.
  public async getWalletPassphrase (wallet: Wallet | ElectrumXWallet): Promise<string> {
    const walletConfig = await this.getWalletConfig(wallet.identifier)

    return walletConfig.passphrase
  }

  public async reconnectElectrumWallets (server: ElectrumServerConfig): Promise<number> {
    let updatedWallets = 0

    for (const wallet of this.wallets) {
      if (!(wallet instanceof ElectrumXWallet)) {
        continue
      }

      wallet.setElectrumServer(server)
      await wallet.status()
      await this.persistWalletConfig(wallet.identifier, wallet.getWalletConfig())
      wallet.acknowledgeConfigPersisted()
      updatedWallets++
    }

    this.restartTicker()

    return updatedWallets
  }

  public getDerivedXPrivKey (wallet: Wallet | ElectrumXWallet): Promise<object> {
    if (wallet instanceof Wallet) {
      return this.getWalletPassphrase(wallet).then(passphrase => wallet.getCredentials().getDerivedXPrivKey(passphrase))
    }

    return Promise.resolve(wallet.getAccountPrivateKey())
  }

  protected getClient (walletConfig: WalletConfigItem): Client {
    const vwc = new Client({
      baseUrl: resolveVwsApiUrl(walletConfig.vwsApi),
      verbose: false
    })

    vwc.seedFromMnemonic(walletConfig.paperkey, walletConfig)
    this.setClientTimeout(vwc, STEADY_STATE_CLIENT_TIMEOUT_MS)

    return vwc
  }

  protected async initializeWallet (walletConfig: WalletConfigItem): Promise<Wallet | ElectrumXWallet> {
    if (walletConfig.backend === 'electrumx') {
      const wallet = new ElectrumXWallet(walletConfig, ElectrumXWallet.resolveServerConfig(walletConfig), this.torEnabled)
      this.retryStartupOperation(`connect wallet "${walletConfig.name}"`, () => wallet.open())
        .catch((error) => {
          Log.warn(`ElectrumX wallet "${walletConfig.name}" will stay queued for later sync: ${error}`)
        })
      return wallet
    }

    const vwc = this.getClient(walletConfig)
    const wallet = new Wallet(walletConfig.identifier, walletConfig.name, walletConfig.color, vwc)

    this.setClientTimeout(vwc, STARTUP_CLIENT_TIMEOUT_MS)
    this.warmWalletServiceRoute(walletConfig)
      .then(() => this.retryStartupOperation(`connect wallet "${walletConfig.name}"`, () => wallet.open()))
      .catch((error) => {
        Log.warn(`VWS wallet "${walletConfig.name}" will stay queued for later sync: ${error}`)
      })
      .finally(() => {
        this.setClientTimeout(vwc, STEADY_STATE_CLIENT_TIMEOUT_MS)
      })

    return wallet
  }

  protected async createWalletInstance (walletConfig: WalletConfigItem): Promise<Wallet | ElectrumXWallet> {
    if (walletConfig.backend === 'electrumx') {
      const wallet = new ElectrumXWallet(walletConfig, ElectrumXWallet.resolveServerConfig(walletConfig), this.torEnabled)
      await wallet.create()
      return wallet
    }

    const vwc = this.getClient(walletConfig)
    const wallet = new Wallet(walletConfig.identifier, walletConfig.name, walletConfig.color, vwc)

    await wallet.create(walletConfig.name, walletConfig.name, 1, 1, {
      coin: walletConfig.coin,
      network: walletConfig.network,
      singleAddress: walletConfig.singleAddress
    })
    await wallet.open()
    return wallet
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

  protected async persistWalletConfig (identifier: string, walletConfig: WalletConfigItem): Promise<void> {
    await Keytar.setCredentials(Keytar.walletService, identifier, btoa(JSON.stringify(walletConfig)))
  }

  protected startTicker () {
    const fetch = async (includeTransactions = true) => {
      if (this.wallets.length === 0) {
        this.reportWalletStatus('ready')
        return
      }

      this.reportWalletStatus('syncing')

      for (const wallet of this.wallets) {
        try {
          await wallet.status()
          if (wallet instanceof ElectrumXWallet && wallet.hasPendingConfigChanges()) {
            await this.persistWalletConfig(wallet.identifier, wallet.getWalletConfig())
            wallet.acknowledgeConfigPersisted()
          }
          if (includeTransactions) {
            Promise.allSettled([
              wallet.fetchTxHistory(),
              wallet.getTxProposals()
            ]).catch(error => Log.error(String(error)))
          }
        } catch (e) {
          Log.error(String(e))
        }
      }

      this.reportWalletStatus('ready')
    }

    this.initialHydrationTimer = setTimeout(() => {
      fetch(true).catch(error => Log.error(error.toString()))
    }, INITIAL_WALLET_HYDRATION_DELAY_MS)

    this.ticker = setInterval(() => {
      fetch(true).catch(error => Log.error(error.toString()))
    }, 30000)
  }

  protected stopTicker () {
    if (this.ticker) {
      clearInterval(this.ticker)
    }

    if (this.initialHydrationTimer) {
      clearTimeout(this.initialHydrationTimer)
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

  protected setClientTimeout (vwc: Client, timeoutMs: number) {
    ;(vwc as any).timeout = timeoutMs

    if ((vwc as any).request) {
      ;(vwc as any).request.timeout = timeoutMs
    }
  }

  protected async retryStartupOperation<T> (label: string, task: () => Promise<T>): Promise<T> {
    let lastError: any = null

    for (let attempt = 1; attempt <= STARTUP_OPERATION_ATTEMPTS; attempt++) {
      try {
        if (attempt > 1) {
          Log.info(`Retrying ${label} (${attempt}/${STARTUP_OPERATION_ATTEMPTS})`)
        }

        return await task()
      } catch (error) {
        lastError = error
        Log.warn(`${label} failed on attempt ${attempt}/${STARTUP_OPERATION_ATTEMPTS}: ${error}`)

        if (attempt < STARTUP_OPERATION_ATTEMPTS) {
          await this.delay(STARTUP_RETRY_DELAY_MS)
        }
      }
    }

    throw lastError
  }

  protected async warmWalletServiceRoute (walletConfig: WalletConfigItem) {
    const warmupUrl = this.getWalletServiceWarmupUrl(walletConfig)

    for (let attempt = 1; attempt <= STARTUP_ROUTE_WARMUP_ATTEMPTS; attempt++) {
      try {
        await axios.get(warmupUrl, {
          timeout: STARTUP_ROUTE_WARMUP_TIMEOUT_MS
        })
        return
      } catch (error) {
        Log.warn(`Wallet service warmup failed for ${walletConfig.name} (${attempt}/${STARTUP_ROUTE_WARMUP_ATTEMPTS}): ${error}`)

        if (attempt < STARTUP_ROUTE_WARMUP_ATTEMPTS) {
          await this.delay(STARTUP_RETRY_DELAY_MS)
        }
      }
    }
  }

  protected getWalletServiceWarmupUrl (walletConfig: WalletConfigItem) {
    const baseUrl = resolveVwsApiUrl(walletConfig.vwsApi)
    const coin = encodeURIComponent(walletConfig.coin || 'xvg')
    const network = encodeURIComponent(walletConfig.network || 'livenet')

    return `${baseUrl}/v2/feelevels/?coin=${coin}&network=${network}`
  }

  protected delay (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
