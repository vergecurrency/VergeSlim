import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import * as ElectronUtils from 'electron-util'
import Log from 'electron-log'
import { InstallerInterface } from '@/setup/installer'

const ASAR_TOR_PATH: string = ElectronUtils.fixPathForAsarUnpack(path.join(__dirname, 'bin', 'Tor'))
const BIN_PATH: string = path.join(app.getPath('appData'), 'MyVergies', 'bin')
const TOR_PATH: string = path.join(BIN_PATH, 'Tor')

const executableFiles = [
  'tor',
  'tor.real',
  path.join('PluggableTransports', 'obfs4proxy'),
  path.join('pluggable_transports', 'conjure-client'),
  path.join('pluggable_transports', 'lyrebird')
]

class TorInstaller implements InstallerInterface {
  private ensureFolder (folder: string): void {
    if (!fs.existsSync(folder)) {
      fs.mkdirSync(folder, { recursive: true })
      Log.info(`Tor installation: folder created: ${folder}`)
    }
  }

  private fileContentIsEqual (sourcePath: string, destinationPath: string): boolean {
    const sourceContent = fs.readFileSync(sourcePath)
    const destinationContent = fs.readFileSync(destinationPath)

    return sourceContent.equals(destinationContent)
  }

  private syncFiles (source: string, destination: string): number {
    let copiedFiles = 0
    const entries = fs.readdirSync(source, { withFileTypes: true })

    entries.forEach(entry => {
      const sourcePath = path.join(source, entry.name)
      const destinationPath = path.join(destination, entry.name)

      if (entry.isDirectory()) {
        this.ensureFolder(destinationPath)
        copiedFiles += this.syncFiles(sourcePath, destinationPath)
        return
      }

      let shouldCopy = !fs.existsSync(destinationPath)
      if (!shouldCopy) {
        const sourceStats = fs.statSync(sourcePath)
        const destinationStats = fs.statSync(destinationPath)
        shouldCopy = sourceStats.size !== destinationStats.size

        if (!shouldCopy && sourceStats.mtimeMs > destinationStats.mtimeMs) {
          shouldCopy = !this.fileContentIsEqual(sourcePath, destinationPath)
        }
      }

      if (shouldCopy) {
        if (fs.existsSync(destinationPath) && !ElectronUtils.is.windows) {
          // Existing executables can be 0555 from previous runs; make writable before overwrite.
          fs.chmodSync(destinationPath, 0o755)
        }
        fs.copyFileSync(sourcePath, destinationPath)
        copiedFiles++
        Log.info(`Tor installation: file copied: ${path.relative(ASAR_TOR_PATH, sourcePath)}`)
      }
    })

    return copiedFiles
  }

  public install (): boolean {
    this.ensureFolder(BIN_PATH)
    this.ensureFolder(TOR_PATH)
    this.syncFiles(ASAR_TOR_PATH, TOR_PATH)

    if (!ElectronUtils.is.windows) {
      executableFiles.forEach(file => {
        const executablePath = path.join(TOR_PATH, file)
        if (fs.existsSync(executablePath)) {
          fs.chmodSync(executablePath, 0o555)
        }
      })

      Log.info('Tor installation: bin files chmodded')
    }

    Log.info('Tor successfully installed!')

    return true
  }
}

export default new TorInstaller()
