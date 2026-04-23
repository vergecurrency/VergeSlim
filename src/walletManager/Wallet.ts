// @ts-ignore
import Client from 'bitcore-wallet-client-xvg'
import Info from '@/walletManager/models/Info'
import Balance, { BalanceAddress } from '@/walletManager/models/Balance'
import Tx from '@/walletManager/models/Tx'
import { TxProposal, TxProposalResponse } from '@/walletManager/models/TxProposal'
import AddressInfo from '@/walletManager/models/AddressInfo'
import SendMaxInfo from '@/walletManager/models/SendMaxInfo'
import { resolveVwsApiUrl } from '@/utils/vwsApi'

export default class Wallet {
  protected vwc: Client
  public identifier: string
  public name?: string
  public color?: string
  public info?: Info
  public transactions: Tx[] = []
  public addresses: AddressInfo[] = []
  public txProposals: TxProposalResponse[] = []

  constructor (identifier: string, name: string, color: string, vwc: Client) {
    this.identifier = identifier
    this.name = name
    this.color = color
    this.vwc = vwc
  }

  public async create (name: string, copayerName: string, m: number = 1, n: number = 1, options: object = {}) {
    try {
      // First check if the wallet is already on the server.
      // If not we create the wallet after getting an error.
      const status = await this.status()

      return status
    } catch (e) {
      return new Promise((resolve, reject) => {
        this.vwc.createWallet(name, copayerName, m, n, options, (error: Error|null, secret: string|null) => {
          if (error) {
            return reject(error)
          }

          resolve(secret)
        })
      })
    }
  }

  public open (): Promise<Info> {
    return new Promise((resolve, reject) => {
      this.vwc.openWallet((error: Error, info: Info) => {
        if (error) {
          return reject(error)
        }

        this.info = info

        resolve(info)
      })
    })
  }

  public status (): Promise<Info> {
    return new Promise((resolve, reject) => {
      this.vwc.getStatus({ includeExtendedInfo: true }, (error: Error, info: Info) => {
        if (error) {
          return reject(error)
        }

        this.info = info

        resolve(info)
      })
    })
  }

  public fetchBalance (): Promise<Balance> {
    return new Promise((resolve, reject) => {
      this.vwc.getBalance((error: Error|null, balance: Balance) => {
        if (error) {
          return reject(error)
        }

        resolve(balance)
      })
    })
  }

  public scan (): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.vwc.startScan({}, (error: Error|null) => {
        if (error) {
          return reject(error)
        }

        resolve(true)
      })
    })
  }

  public fetchTxHistory (): Promise<Tx[]> {
    return new Promise((resolve, reject) => {
      this.vwc.getTxHistory({ includeExtendedInfo: true }, (error: Error|null, txs: Tx[]) => {
        if (error) {
          return reject(error)
        }

        const txids: string[] = []
        const filteredTxs: Tx[] = []

        txs.forEach((tx: Tx) => {
          if (txids.includes(tx.txid)) {
            return
          }

          txids.push(tx.txid)
          filteredTxs.push(tx)
        })

        this.transactions = filteredTxs

        resolve(filteredTxs)
      })
    })
  }

  public getTxHistory (): Tx[] {
    return this.transactions
  }

  public getTxProposals (): Promise<TxProposalResponse[]> {
    return new Promise((resolve, reject) => {
      this.vwc.getTxProposals({
        doNotVerify: true
      }, (error: Error|null, txps: TxProposalResponse[]) => {
        if (error) {
          return reject(error)
        }

        this.txProposals = txps

        resolve(txps)
      })
    })
  }

  public createTxProposal (proposal: TxProposal): Promise<TxProposalResponse> {
    return new Promise((resolve, reject) => {
      this.vwc.createTxProposal(proposal, (error: Error|null, txp: TxProposalResponse) => {
        if (error) {
          return reject(error)
        }

        resolve(txp)
      })
    })
  }

  public publishTxProposal (proposal: TxProposalResponse): Promise<TxProposalResponse> {
    return new Promise((resolve, reject) => {
      this.vwc.publishTxProposal({ txp: proposal }, (error: Error|null, txp: TxProposalResponse) => {
        if (error) {
          return reject(error)
        }

        resolve(txp)
      })
    })
  }

  public signTxProposal (proposal: TxProposalResponse, passphrase: string): Promise<TxProposalResponse> {
    return new Promise((resolve, reject) => {
      this.vwc.signTxProposal(proposal, passphrase, (error: Error|null, txp: TxProposalResponse) => {
        if (error) {
          return reject(error)
        }

        resolve(txp)
      })
    })
  }

  public broadcastTxProposal (proposal: TxProposalResponse): Promise<TxProposalResponse> {
    return new Promise((resolve, reject) => {
      this.vwc.broadcastTxProposal(proposal, (error: Error|null, txp: TxProposalResponse) => {
        if (error) {
          return reject(error)
        }

        resolve(txp)
      })
    })
  }

  public removeTxProposal (proposal: TxProposalResponse): Promise<TxProposalResponse[]> {
    return new Promise((resolve, reject) => {
      this.vwc.removeTxProposal(proposal, (error: Error|null) => {
        if (error) {
          return reject(error)
        }

        return this.getTxProposals()
      })
    })
  }

  public createAddress (): Promise<AddressInfo> {
    return new Promise((resolve, reject) => {
      this.vwc.createAddress({}, (error: Error|null, addressInfo: AddressInfo) => {
        if (error) {
          return reject(error)
        }

        this.addresses.unshift(addressInfo)

        resolve(addressInfo)
      })
    })
  }

  public getMainAddresses (options: object): Promise<AddressInfo[]> {
    return new Promise((resolve, reject) => {
      this.vwc.getMainAddresses(options, (error: Error|null, addresses: AddressInfo[]) => {
        if (error) {
          return reject(error)
        }

        this.addresses = addresses

        resolve(addresses)
      })
    })
  }

  public getAddress (): Promise<AddressInfo> {
    const options = {
      reverse: true
    }

    if (!this.info) {
      throw new Error('Wallet info not found')
    }

    const info = this.info

    return this.getMainAddresses(options).then(addresses => {
      for (const addressInfo of addresses) {
        if (!info.balance.byAddress.find((balance: BalanceAddress) => balance.address === addressInfo.address)) {
          return addressInfo
        }
      }

      // Create a new address
      return this.createAddress()
    })
  }

  public getSendMaxInfo (returnInputs: boolean = false): Promise<SendMaxInfo> {
    return new Promise((resolve, reject) => {
      this.vwc.getSendMaxInfo({ returnInputs }, (error: Error|null, info: SendMaxInfo) => {
        if (error) {
          return reject(error)
        }

        resolve(info)
      })
    })
  }

  public setName (name: string): void {
    this.name = name
  }

  public setColor (color: string): void {
    this.color = color
  }

  public setApiEndpoint (apiEndpoint: string): void {
    this.vwc.request.baseUrl = resolveVwsApiUrl(apiEndpoint)
  }

  public getExportConfig (): object {
    return {
      name: this.name,
      color: this.color,
      coin: this.info!.wallet.coin,
      network: this.info!.wallet.network,
      paperkey: this.vwc.credentials.mnemonic,
      walletPrivKey: this.vwc.credentials.walletPrivKey,
      singleAddress: this.info!.wallet.singleAddress,
      vwsApi: resolveVwsApiUrl(this.vwc.request.baseUrl)
    }
  }

  public getClient (): Client {
    return this.vwc
  }

  public getCredentials (): Client.credentials {
    return this.getClient().credentials
  }
}
