import electron from 'electron'
import Log from 'electron-log'

export default class Keytar {
  static readonly appService: string = 'MyVergies'
  static readonly walletService: string = 'MyVergies Wallet'
  static readonly accessErrorTitle: string = 'Keychain Access Needed'
  static readonly accessErrorMessage: string = 'MyVergies could not access the macOS Keychain. Enter your Mac login password and choose "Always Allow" if prompted, then try again. If you denied access earlier, restart MyVergies and retry.'

  static async setCredentials (service: string, account: string, credentials: string) {
    Log.info(`set credentials for service "${service}" and account "${account}"`)

    return await this.request('set-password', service, account, credentials)
  }

  static async getCredentials (service: string, account: string) {
    Log.info(`get credentials for service "${service}" and account "${account}"`)

    return await this.request('get-password', service, account)
  }

  static async deleteCredentials (service: string, account: string) {
    Log.info(`delete credentials for service "${service}" and account "${account}"`)

    return await this.request('delete-password', service, account)
  }

  static isAccessError (error: any): boolean {
    return Boolean(error && error.isKeytarAccessError)
  }

  protected static async request (channel: string, ...args: any[]) {
    try {
      return await electron.ipcRenderer.invoke(channel, ...args)
    } catch (error) {
      Log.error(`keychain request "${channel}" failed: ${error instanceof Error ? error.message : String(error)}`)

      const wrappedError: any = new Error(Keytar.accessErrorMessage)
      wrappedError.isKeytarAccessError = true
      wrappedError.originalMessage = error instanceof Error ? error.message : String(error)

      throw wrappedError
    }
  }
}
