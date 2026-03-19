import { app, protocol, nativeTheme, BrowserWindow, Menu, ipcMain, powerMonitor, net } from 'electron'
import { createProtocol, installVueDevtools } from 'vue-cli-plugin-electron-builder/lib'
import logger from 'electron-log'
import ElectronWindowState from 'electron-window-state'
import * as ElectronUtils from 'electron-util'
import path from 'path'
import { execFile } from 'child_process'
import Installer from '@/setup/installer'
import { generateMenuTemplate, dockTemplate } from '@/toolbar/menu'
import Tor from '@/http/tor'
import ExportImportManager from '@/walletManager/ExportImportManager'
import '@/utils/keytar/main'
import '@/utils/ipcMainEvents'
import * as Utils from '@/utils'
import { eventConstants } from '@/utils/constants'
import { applyNodeProxyState } from '@/utils/nodeProxy'

// Install MyVergies components
Installer.install()

logger.transports.file.level = 'debug'

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null = null
const TOR_SOCKS_PORT = 9999
const TOR_HTTP_TUNNEL_PORT = 9998
const TOR_BIN_PATH = path.join(app.getPath('appData'), 'MyVergies', 'bin', 'Tor')
let torController: any = null
let torBootstrapPromise: Promise<void> | null = null
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{ scheme: 'app', privileges: { secure: true, standard: true } }])

const activateTorProxy = (win: BrowserWindow) => win.webContents.session.setProxy({
  proxyRules: `socks5://127.0.0.1:${TOR_SOCKS_PORT}`,
  proxyBypassRules: '<local>, 192.168.1.1/16, fefe:13::abc/33'
})

const deactivateTorProxy = (win: BrowserWindow) => win.webContents.session.setProxy({ proxyRules: undefined })

const requestJson = (window: BrowserWindow, url: string, timeoutMs = 25000) => new Promise((resolve, reject) => {
  const request = net.request({
    method: 'GET',
    session: window.webContents.session,
    url
  })
  const timeout = setTimeout(() => {
    request.abort()
    reject(new Error(`Timeout fetching ${url}`))
  }, timeoutMs)

  request.on('response', response => {
    let data = ''

    response.on('data', chunk => {
      data += chunk.toString()
    })

    response.on('end', () => {
      clearTimeout(timeout)
      if (response.statusCode < 200 || response.statusCode >= 300) {
        reject(new Error(`Failed to fetch ${url} with status ${response.statusCode}`))
        return
      }

      try {
        resolve(JSON.parse(data))
      } catch (error) {
        reject(error)
      }
    })
  })

  request.on('error', error => {
    clearTimeout(timeout)
    reject(error)
  })
  request.end()
})

const getTorInfo = (controller: any, keyword: string) => new Promise<string>((resolve, reject) => {
  controller.getInfo(keyword, (error: Error | null, result: string) => {
    if (error) {
      reject(error)
      return
    }

    resolve(result)
  })
})

const getCountryName = (countryCode: string) => {
  if (!countryCode || countryCode === '??') {
    return 'Unknown'
  }

  try {
    // Prefer a readable country name, but fall back to the ISO code if unsupported.
    const displayNamesCtor = (Intl as any).DisplayNames
    if (!displayNamesCtor) {
      return countryCode
    }

    const displayNames = new displayNamesCtor(['en'], { type: 'region' })
    return displayNames.of(countryCode) || countryCode
  } catch (_error) {
    return countryCode
  }
}

const parseBootstrapStatus = (status: string) => {
  const progressMatch = status.match(/PROGRESS=(\d+)/)
  const summaryMatch = status.match(/SUMMARY="([^"]+)"/)

  return {
    progress: progressMatch ? Number(progressMatch[1]) : 0,
    summary: summaryMatch ? summaryMatch[1] : status
  }
}

const waitForTorBootstrap = async (controller: any, maxAttempts = 24, delayMs = 2500) => {
  if (!controller) {
    throw new Error('Tor controller is not ready')
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const bootstrapStatus = await getTorInfo(controller, 'status/bootstrap-phase')
      const { progress, summary } = parseBootstrapStatus(bootstrapStatus)

      logger.info(`Waiting for Tor bootstrap (${attempt}/${maxAttempts}) progress=${progress} summary="${summary}"`)

      if (progress >= 100) {
        logger.info('Tor bootstrap completed')
        return
      }
    } catch (error) {
      logger.warn('Tor bootstrap status check failed:', error)
    }

    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  throw new Error('Tor bootstrap did not complete in time')
}

const ensureTorBootstrapped = (controller: any) => {
  if (!torBootstrapPromise) {
    torBootstrapPromise = waitForTorBootstrap(controller).finally(() => {
      torBootstrapPromise = null
    })
  }

  return torBootstrapPromise
}

const waitForTorCircuit = async (window: BrowserWindow, maxAttempts = 8, delayMs = 5000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      logger.info(`Waiting for Tor circuit (${attempt}/${maxAttempts})`)
      const torCheckData: any = await requestJson(window, 'https://check.torproject.org/api/ip', 15000)
      if (torCheckData && torCheckData.IsTor === true && torCheckData.IP) {
        logger.info('Tor circuit is ready')
        return torCheckData.IP
      }
      logger.warn('Tor circuit check returned non-Tor result')
    } catch (error) {
      logger.warn('Tor circuit check failed:', error)
    }

    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delayMs))
    }
  }

  throw new Error('Tor circuit did not become ready in time')
}

const getTorBinaryPath = () => {
  if (process.platform === 'darwin') {
    return path.join(TOR_BIN_PATH, 'tor.real')
  }

  return path.join(TOR_BIN_PATH, 'tor')
}

const getTorVersion = () => new Promise((resolve) => {
  const torBinaryPath = getTorBinaryPath()

  execFile(torBinaryPath, ['--version'], (error, stdout = '', stderr = '') => {
    if (error) {
      logger.warn('Failed to read Tor version:', error)
      resolve('Unknown')
      return
    }

    const output = `${stdout}\n${stderr}`
    const match = output.match(/Tor version ([^\s]+)\./i)
    resolve(match ? match[1] : 'Unknown')
  })
})

function createWindow () {
  Menu.setApplicationMenu(Menu.buildFromTemplate(generateMenuTemplate()))

  if (process.platform === 'darwin') {
    app.dock.setMenu(Menu.buildFromTemplate(dockTemplate))
  }

  const mainWindowState = ElectronWindowState({
    defaultWidth: 1030,
    defaultHeight: 560
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
  if (!win || win.isDestroyed()) {
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
    const tor = Tor({}, {
      SocksPort: `${port}`,
      HTTPTunnelPort: `${TOR_HTTP_TUNNEL_PORT}`
    })
    torController = tor

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
  applyNodeProxyState(true)

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
    ipcMain.handle(eventConstants.toggleTor, async (_event, arg: any) => {
      logger.info(`Tor toggle requested: activate=${arg.activate}`)
      applyNodeProxyState(arg.activate === true)
      if (arg.activate === true) {
        await activateTorProxy(window)
      } else {
        await deactivateTorProxy(window)
      }
      logger.info(`Tor toggle applied: activate=${arg.activate}`)
      return { success: true }
    })

    ipcMain.handle(eventConstants.getTorNetworkInfo, async () => {
      try {
        const torVersion = await getTorVersion()
        const torIp = await waitForTorCircuit(window)
        let countryCode = 'Unknown'

        try {
          countryCode = (await getTorInfo(torController, `ip-to-country/${torIp}`)).trim().toUpperCase()
        } catch (countryError) {
          const message = countryError instanceof Error ? countryError.message : String(countryError)
          logger.debug(`Tor country lookup unavailable; continuing with verified Tor IP only: ${message}`)
        }

        return {
          ip: torIp || 'Unknown',
          country_name: getCountryName(countryCode),
          country_code: countryCode || 'Unknown',
          torVersion
        }
      } catch (error) {
        logger.warn('Tor network info lookup failed, returning unknown values:', error)
        return {
          ip: 'Unknown',
          country_name: 'Unknown',
          country_code: 'Unknown',
          torVersion: await getTorVersion()
        }
      }
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
