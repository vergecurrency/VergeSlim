import { app, protocol, nativeTheme, BrowserWindow, Menu, ipcMain, powerMonitor } from 'electron'
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib'
import logger from 'electron-log'
import ElectronWindowState from 'electron-window-state'
import * as ElectronUtils from 'electron-util'
import Installer from '@/setup/installer'
import { generateMenuTemplate, dockTemplate } from '@/toolbar/menu'
import Tor from '@/http/tor'
import ExportImportManager from '@/walletManager/ExportImportManager'
import '@/utils/keytar/main'
import '@/utils/ipcMainEvents'
import * as Utils from '@/utils'
import { eventConstants } from '@/utils/constants'

// Install MyVergies components
Installer.install()

logger.transports.file.level = 'debug'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null
const TOR_SOCKS_PORT = 9999
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

const activateTorProxy = (win: BrowserWindow) => win.webContents.session.setProxy({
  proxyRules: `socks5://127.0.0.1:${TOR_SOCKS_PORT}`,
  proxyBypassRules: '<local>, 192.168.1.1/16, fefe:13::abc/33'
})

const deactivateTorProxy = (win: BrowserWindow) => win.webContents.session.setProxy({ proxyRules: undefined })

function createWindow () {
  Menu.setApplicationMenu(Menu.buildFromTemplate(generateMenuTemplate()))

  if (process.platform === 'darwin') {
    app.dock.setMenu(Menu.buildFromTemplate(dockTemplate))
  }

  const mainWindowState = ElectronWindowState({
    defaultWidth: 1100,
    defaultHeight: 700
  })

  // Create the browser window.
  win = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    height: mainWindowState.height,
    width: mainWindowState.width,
    title: 'MyVergies',
    minHeight: 560,
    minWidth: 1030,
    show: true,
    useContentSize: true,
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#1b1c1f' : '#e0e0e0',
    titleBarStyle: 'hidden',
    trafficLightPosition: {
      x: 12,
      y: 36
    },
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
      contextIsolation: false
    }
  })

  mainWindowState.manage(win)

  activateTorProxy(win).then(() => {
    if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
      win!.loadURL(process.env.WEBPACK_DEV_SERVER_URL as string)
      if (!process.env.IS_TEST) {
        win!.webContents.openDevTools()
      }
    } else {
      createProtocol('app')
      // Load the index.html when not in development
      win!.loadURL('app://./index.html')
    }
  })

  if (Utils.isMacOSEnvironment()) {
    let forceQuit = false

    app.on('before-quit', () => {
      forceQuit = true
    })

    win.on('close', event => {
      if (!forceQuit) {
        event.preventDefault()

        win!.hide()
      }
    })
  }

  win.on('closed', () => {
    win = null
  })

  win.once('ready-to-show', () => {
    win!.show()
  })

  powerMonitor.on('lock-screen', () => {
    win!.webContents.send('user-idle')
  })

  setInterval(() => {
    if (powerMonitor.getSystemIdleTime() >= 60) {
      win!.webContents.send('user-idle')
    }
  }, 1000)

  // Register export save dialog events
  ExportImportManager.registerEvents(win)

  return win
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  } else {
    win.show()
    win.setTrafficLightPosition({
      x: 12,
      y: 36
    })
  }
})

const startUpTorOnPort = (port: number) => {
  return new Promise((resolve, reject) => {
    const tor = Tor()

    tor.on('ready', async () => {
      tor.setConfig('SocksPort', `${port}`, () => {
        tor.getConfig('SocksPort', (_: any, result: any) => {
          resolve(result)
        })
      })
    })

    tor.on('error', (err: Error) => {
      reject(err)
    })
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  ElectronUtils.enforceMacOSAppLocation()

  startUpTorOnPort(TOR_SOCKS_PORT).then(async port => {
    console.log(`TorSocks listening on ${port}!`)

    if (Utils.isDevelopmentEnvironment() && !process.env.IS_TEST) {
    // Install Vue Devtools
    // Devtools extensions are broken in Electron 6.0.0 and greater
    // See https://github.com/nklayman/vue-cli-plugin-electron-builder/issues/378 for more info
    // Electron will not launch with Devtools extensions installed on Windows 10 with dark mode
    // If you are not using Windows 10 dark mode, you may uncomment these lines
    // In addition, if the linked issue is closed, you can upgrade electron and uncomment these lines
      try {
        await installVueDevtools()
      } catch (e) {
        console.error('Vue Devtools failed to install:', e.toString())
      }
    }
    const window = createWindow()
    ipcMain.on(eventConstants.toggleTor, async (event, arg: any) => {
      if (arg.activate === true) {
        await activateTorProxy(window)
      } else {
        await deactivateTorProxy(window)
      }

      event.returnValue = 'received'
      event.reply(eventConstants.toggledTor)
    })
  }).catch(error => {
    logger.error(error)

    const window = createWindow()

    setTimeout(() => window.webContents.send(eventConstants.torConnectionError, error), 1000)

    deactivateTorProxy(window)
  })
})

// Exit cleanly on request from parent process in development mode.
if (Utils.isDevelopmentEnvironment()) {
  if (Utils.isWinOSEnvironment()) {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}

// Will be default from Electron >= 9; So remove at that version.
app.allowRendererProcessReuse = true
