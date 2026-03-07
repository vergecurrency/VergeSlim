'use strict'

import path from 'path'
import { spawn, execFileSync } from 'child_process'
import { platform } from 'os'
import { Socket } from 'net'
import fs from 'fs'
import { TorController, torrc } from '@deadcanaries/granax'
import Log from 'electron-log'
import { app } from 'electron'

const BIN_PATH: string = path.join(app.getPath('appData'), 'MyVergies', 'bin')
const LD_LIBRARY_PATH: string = path.join(
  BIN_PATH, 'tor-browser_en-US', 'Browser', 'TorBrowser', 'Tor'
)

export default function (options: Object = {}, torrcOptions: Object = {}) {
  const socket: Socket = new Socket()
  const controller = new TorController(socket, options)
  const [torrcFile, dataDirectory] = torrc(torrcOptions)

  const exe: string = path.basename(getTor(platform()))
  let tor: string = path.join(BIN_PATH, 'Tor', exe)
  let env: NodeJS.ProcessEnv = { ...process.env, LD_LIBRARY_PATH: path.join(BIN_PATH, 'Tor') }

  if (process.env.GRANAX_USE_SYSTEM_TOR && process.platform === 'linux') {
    tor = exe
    env = { ...process.env }
  }

  const args = process.env.GRANAX_TOR_ARGS
    ? process.env.GRANAX_TOR_ARGS.split(' ')
    : []
  const child = spawn(tor, ['-f', torrcFile].concat(args), {
    cwd: BIN_PATH,
    env
  })
  let portFileReads = 0

  controller.process = child // NB: Expose the tor process to userland

  function connect (): any {
    let port = null

    try {
      port = parseInt(fs.readFileSync(path.join(
        dataDirectory,
        'control-port'
      )).toString().split(':')[1])
    } catch (err) {
      /* istanbul ignore next */
      portFileReads++

      /* istanbul ignore next */
      if (portFileReads <= 20) {
        return setTimeout(() => connect(), 1000)
      } else {
        return controller.emit('error',
          new Error('Failed to read control port'))
      }
    }

    socket.connect(port, '127.0.0.1')
  }

  /* istanbul ignore next */
  process.on('exit', () => child.kill())
  child.stdout.once('data', () => setTimeout(() => connect(), 1000))
  child.on('error', (err) => controller.emit('error', err))
  child.on('exit', (code) => {
    controller.emit('error', new Error('Tor exited with code ' + code))
  })

  return controller
}

const getTor = function (platform: string): string {
  /* eslint complexity: ["error", 8] */
  let torpath = null

  /* istanbul ignore else */
  if (process.env.GRANAX_USE_SYSTEM_TOR) {
    try {
      torpath = execFileSync(
        platform === 'win32' ? 'where' : 'which',
        ['tor']
      ).toString().trim()
    } catch (err) {
      /* istanbul ignore next */
      throw new Error('Tor is not installed')
    }

    return torpath
  }

  switch (platform) {
    case 'win32':
      torpath = path.join(BIN_PATH, 'Browser', 'TorBrowser', 'Tor', 'tor.exe')
      break
    case 'darwin':
      torpath = path.join(BIN_PATH, '.tbb.app', 'Contents', 'MacOS', 'Tor', 'tor.real')
      break
    case 'android':
    case 'linux':
      torpath = path.join(LD_LIBRARY_PATH, 'tor')
      break
    default:
      throw new Error(`Unsupported platform "${platform}"`)
  }

  return torpath
}
