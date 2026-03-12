import keytar from 'keytar'
import electron from 'electron'
import Log from 'electron-log'

const logKeytarError = (action: string, service: string, wallet: string, error: any) => {
  Log.error(`keychain ${action} failed for service "${service}" and wallet "${wallet}": ${error instanceof Error ? error.message : String(error)}`)
}

electron.ipcMain.handle('get-password', async (event, service: string, wallet: string) => {
  Log.info(`request password for service "${service}" and wallet "${wallet}"`)

  try {
    return await keytar.getPassword(service, wallet)
  } catch (error) {
    logKeytarError('read', service, wallet, error)
    throw error
  }
})

electron.ipcMain.handle('set-password', async (event, service: string, wallet: string, credentials: string) => {
  Log.info(`request set password for service "${service}" and wallet "${wallet}"`)

  try {
    return await keytar.setPassword(service, wallet, credentials)
  } catch (error) {
    logKeytarError('write', service, wallet, error)
    throw error
  }
})

electron.ipcMain.handle('delete-password', async (event, service: string, wallet: string) => {
  Log.info(`request delete password for service "${service}" and wallet "${wallet}"`)

  try {
    return await keytar.deletePassword(service, wallet)
  } catch (error) {
    logKeytarError('delete', service, wallet, error)
    throw error
  }
})
