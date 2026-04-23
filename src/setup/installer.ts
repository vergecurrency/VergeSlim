import torInstaller from '@/setup/installers/tor'

export interface InstallerInterface {
  install: () => void
}

const installers: InstallerInterface[] = [
  torInstaller
]

export default {
  install () {
    installers.forEach(installer => {
      const succeeded = installer.install()

      // Handle failed...
    })
  }
}
