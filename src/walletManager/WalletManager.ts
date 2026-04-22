// @ts-ignore
import Client from 'bitcore-wallet-client-xvg'
import axios from 'axios'
import Log from 'electron-log'
import Wallet from '@/walletManager/Wallet'
import ManagerConfig, { WalletConfigItem } from '@/walletManager/ManagerConfig'
import constants from '@/utils/constants'
import Keytar from '@/utils/keytar'
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

  public readonly wallets: Wallet[] = []

  public setStatusReporter (statusReporter: (phase: string) => void) {
    this.statusReporter = statusReporter
  }

  public async boot (config: ManagerConfig) {
    this.config = config
    this.reportWalletStatus(this.config.wallets.length > 0 ? 'connecting' : 'ready')

    for (const walletConfig of this.config.wallets) {
      try {
        const wallet = await this.initializeWallet(walletConfig)
        this.wallets.push(wallet)
      } catch (e) {
        Log.error(e.toString())
      }
    }

    this.reportWalletStatus('ready')
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
    this.setClientTimeout(vwc, STEADY_STATE_CLIENT_TIMEOUT_MS)

    return vwc
  }

  protected async initializeWallet (walletConfig: WalletConfigItem): Promise<Wallet> {
    const vwc = this.getClient(walletConfig)
    const wallet = new Wallet(walletConfig.identifier, walletConfig.name, walletConfig.color, vwc)

    this.setClientTimeout(vwc, STARTUP_CLIENT_TIMEOUT_MS)
    await this.warmWalletServiceRoute(walletConfig)

    await this.retryStartupOperation(`connect wallet "${walletConfig.name}"`, () => wallet.open())

    this.setClientTimeout(vwc, STEADY_STATE_CLIENT_TIMEOUT_MS)

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
          if (includeTransactions) {
            await Promise.allSettled([
              wallet.fetchTxHistory(),
              wallet.getTxProposals()
            ])
          }
        } catch (e) {
          Log.error(e.toString())
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
    const baseUrl = (walletConfig.vwsApi || constants.vwsApi).replace(/\/+$/, '')
    const coin = encodeURIComponent(walletConfig.coin || 'xvg')
    const network = encodeURIComponent(walletConfig.network || 'livenet')

    return `${baseUrl}/v2/feelevels/?coin=${coin}&network=${network}`
  }

  protected delay (ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
