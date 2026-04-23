import path from 'path'
import fs from 'fs'
import { app } from 'electron'
import * as ElectronUtils from 'electron-util'
import Log from 'electron-log'
import { InstallerInterface } from '@/setup/installer'

const BIN_PATH: string = path.join(app.getPath('appData'), 'MyVergies', 'bin')
const TOR_PATH: string = path.join(BIN_PATH, 'Tor')

type BinaryFormat = 'elf' | 'macho' | 'pe' | 'other'

const linuxExecutableFiles = [
  'tor'
]

const macExecutableFiles = [
  'tor.real'
]

const getBundledTorPath = (): string | null => {
  const pathCandidates = [
    path.resolve(__dirname, '..', '..', 'bin', 'Tor'),
    path.resolve(__dirname, 'bin', 'Tor'),
    path.join(app.getAppPath(), 'dist_electron', 'bundled', 'bin', 'Tor'),
    path.join(process.cwd(), 'dist_electron', 'bundled', 'bin', 'Tor'),
    path.join(process.cwd(), 'public', 'bin', 'Tor')
  ]

  return pathCandidates
    .map(candidatePath => ElectronUtils.fixPathForAsarUnpack(candidatePath))
    .find(candidatePath => fs.existsSync(candidatePath)) || null
}

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

  private getBinaryFormat (filePath: string): BinaryFormat {
    const fd = fs.openSync(filePath, 'r')
    const buffer = Buffer.alloc(4)

    try {
      fs.readSync(fd, buffer, 0, 4, 0)
    } finally {
      fs.closeSync(fd)
    }

    if (buffer[0] === 0x7f && buffer[1] === 0x45 && buffer[2] === 0x4c && buffer[3] === 0x46) {
      return 'elf'
    }

    if (buffer[0] === 0x4d && buffer[1] === 0x5a) {
      return 'pe'
    }

    const machoMagic = buffer.readUInt32BE(0)
    if (
      machoMagic === 0xfeedface ||
      machoMagic === 0xfeedfacf ||
      machoMagic === 0xcafebabe
    ) {
      return 'macho'
    }

    return 'other'
  }

  private shouldCopyFileForPlatform (sourcePath: string, relativePath: string): boolean {
    if (ElectronUtils.is.windows) {
      return true
    }

    const extension = path.extname(relativePath).toLowerCase()
    if (extension === '.dll' || extension === '.exe') {
      return false
    }

    const fileName = path.basename(relativePath)
    const isNoExtensionExecutable = extension === '' && (
      fileName === 'tor' ||
      fileName === 'tor.real'
    )

    if (!isNoExtensionExecutable) {
      return true
    }

    const format = this.getBinaryFormat(sourcePath)
    if (ElectronUtils.is.macos) {
      return format === 'macho'
    }

    return format === 'elf'
  }

  private removeFileIfExists (filePath: string): void {
    if (!fs.existsSync(filePath)) {
      return
    }

    fs.chmodSync(filePath, 0o755)
    fs.unlinkSync(filePath)
    Log.info(`Tor installation: removed incompatible file: ${filePath}`)
  }

  private removeIncompatiblePlatformFiles (): void {
    // Legacy pluggable transport helpers are no longer bundled.
    this.removeFileIfExists(path.join(TOR_PATH, 'PluggableTransports', 'obfs4proxy'))
    this.removeFileIfExists(path.join(TOR_PATH, 'PluggableTransports', 'obfs4proxy.exe'))
    this.removeFileIfExists(path.join(TOR_PATH, 'pluggable_transports', 'conjure-client'))
    this.removeFileIfExists(path.join(TOR_PATH, 'pluggable_transports', 'conjure-client.exe'))
    this.removeFileIfExists(path.join(TOR_PATH, 'pluggable_transports', 'lyrebird'))
    this.removeFileIfExists(path.join(TOR_PATH, 'pluggable_transports', 'lyrebird.exe'))
    this.removeFileIfExists(path.join(TOR_PATH, 'pluggable_transports', 'README.CONJURE.md'))
    this.removeFileIfExists(path.join(TOR_PATH, 'pluggable_transports', 'pt_config.json'))

    // Keep only platform-relevant main Tor binary executable.
    if (process.platform === 'linux') {
      this.removeFileIfExists(path.join(TOR_PATH, 'tor.real'))
    } else if (process.platform === 'darwin') {
      this.removeFileIfExists(path.join(TOR_PATH, 'tor'))
    }
  }

  private syncFiles (source: string, destination: string): number {
    let copiedFiles = 0
    const entries = fs.readdirSync(source, { withFileTypes: true })

    entries.forEach(entry => {
      const sourcePath = path.join(source, entry.name)
      const destinationPath = path.join(destination, entry.name)
      const relativePath = path.relative(source, sourcePath)

      if (entry.isDirectory()) {
        this.ensureFolder(destinationPath)
        copiedFiles += this.syncFiles(sourcePath, destinationPath)
        return
      }

      if (!this.shouldCopyFileForPlatform(sourcePath, relativePath)) {
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
        Log.info(`Tor installation: file copied: ${relativePath}`)
      }
    })

    return copiedFiles
  }

  public install (): boolean {
    const bundledTorPath = getBundledTorPath()

    if (!bundledTorPath) {
      Log.error('Tor installation: bundled Tor directory not found')
      return false
    }

    this.ensureFolder(BIN_PATH)
    this.ensureFolder(TOR_PATH)
    this.removeIncompatiblePlatformFiles()
    this.syncFiles(bundledTorPath, TOR_PATH)

    if (!ElectronUtils.is.windows) {
      const executableFiles = ElectronUtils.is.macos ? macExecutableFiles : linuxExecutableFiles
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
