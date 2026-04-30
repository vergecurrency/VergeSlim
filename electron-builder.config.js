const pkg = require('./package.json')
const [majorVersion = '0', minorVersion = '0', patchVersion = '0'] = pkg.version.split('.')
const releaseVersion = Number(patchVersion) > 0
  ? pkg.version
  : `${majorVersion}.${minorVersion}`

module.exports = {
  productName: 'VergeSlim',
  appId: 'com.github.vergecurrency.myvergies',
  directories: {
    output: 'dist_electron'
  },
  files: [
    'dist_electron/bundled/**/*',
    'dist_electron/icons/**/*',
    '!dist_electron/bundled/**/*.map'
  ],
  publish: [
    {
      provider: 'github',
      owner: 'vergecurrency',
      repo: 'VergeSlim'
    }
  ],
  asar: true,
  asarUnpack: [
    'dist_electron/bundled/bin/**/*'
  ],
  extraResources: [
    {
      from: 'dist_electron/icons/icon.png',
      to: 'icon.png'
    }
  ],
  mac: {
    darkModeSupport: true,
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'dist_electron/entitlements.mac.plist',
    entitlementsInherit: 'dist_electron/entitlements.mac.plist',
    icon: 'dist_electron/icons/Icon.icns'
  },
  win: {
    icon: 'dist_electron/icons/icon.ico',
    signAndEditExecutable: false,
    target: [
      {
        target: 'nsis',
        arch: [
          'x64',
          'ia32'
        ]
      }
    ]
  },
  linux: {
    icon: 'dist_electron/icons',
    artifactName: 'VergeSlim-v' + releaseVersion + '.${ext}'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    artifactName: 'VergeSlim-Setup-v' + releaseVersion + '.${ext}'
  },
  portable: {
    artifactName: 'VergeSlim-v' + releaseVersion + '.${ext}'
  },
  dmg: {
    sign: false,
    icon: null,
    background: 'dist_electron/icons/background.png',
    artifactName: 'VergeSlim-v' + releaseVersion + '.${ext}',
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 130,
        y: 150,
        type: 'file'
      }
    ]
  },
  afterSign: 'dist_electron/notarize.js'
}
