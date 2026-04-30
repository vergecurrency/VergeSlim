import electron from 'electron'
import Wallet from '@/walletManager/Wallet'
// @ts-ignore
import sjcl from 'sjcl'
import fs from 'fs'
import { WalletConfigItem } from '@/walletManager/ManagerConfig'

export default class ExportImportManager {
  public static registerEvents (browserWindow: Electron.BrowserWindow) {
    electron.ipcMain.on('export-wallet-file', async (event, filename: string) => {
      event.returnValue = await electron.dialog.showSaveDialog(browserWindow, {
        defaultPath: filename,
        properties: [
          'showHiddenFiles',
          'createDirectory',
          'showOverwriteConfirmation'
        ]
      })
    })
  }

  public async exportWallet (
    wallet: Wallet,
    passphrase: string,
    encryptionPassword: string|null = null
  ): Promise<boolean> {
    const exportContent = this.getExportContent(wallet, passphrase, encryptionPassword)
    const saveDialogReturnValue = await this.userSavesFile(wallet.name!, encryptionPassword !== '')

    if (saveDialogReturnValue.filePath) {
      fs.writeFileSync(saveDialogReturnValue.filePath, exportContent)

      return true
    }

    return false
  }

  public async readWallet (file: File, encryptionPassword: () => Promise<string>): Promise<WalletConfigItem> {
    const content = fs.readFileSync(file.path).toString()
    let parsed = JSON.parse(content)

    if (!this.isWalletConfig(parsed)) {
      const password = await encryptionPassword()

      try {
        parsed = sjcl.decrypt(password, content)
      } catch (e) {
        throw Error('Wrong encryption password given!')
      }

      parsed = JSON.parse(parsed)
    }

    return parsed
  }

  protected getExportContent (wallet: Wallet, passphrase: string, encryptionPassword: string|null = null) {
    let walletConfig = JSON.stringify({ ...wallet.getExportConfig(), passphrase })

    if (encryptionPassword) {
      walletConfig = sjcl.encrypt(encryptionPassword, walletConfig, {
        iter: 10000
      })
    }

    return walletConfig
  }

  protected userSavesFile (filename: string, isEncrypted: boolean = false): Promise<Electron.SaveDialogReturnValue> {
    return electron.ipcRenderer.sendSync(
      'export-wallet-file',
      `${filename.toLocaleLowerCase().replace(' ', '-')}${isEncrypted ? '-encrypted-' : ''}-verge-slim-export.json`
    )
  }

  protected isWalletConfig (content: any): content is WalletConfigItem {
    return content &&
      'name' in content &&
      'color' in content &&
      'coin' in content &&
      'network' in content &&
      'paperkey' in content &&
      'passphrase' in content &&
      'walletPrivKey' in content &&
      'singleAddress' in content &&
      'vwsApi' in content
  }
}
