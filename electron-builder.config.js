const pkg = require('./package.json')
const displayVersion = pkg.version.replace(/\.0$/, '')

module.exports = {
  productName: 'Verge Slim',
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
      from: 'dist_electron/icons/icon.ico',
      to: 'icon.ico'
    }
  ],
  dmg: {
    sign: false,
    icon: null,
    background: 'dist_electron/icons/background.png',
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
  mac: {
    darkModeSupport: true,
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'dist_electron/entitlements.mac.plist',
    entitlementsInherit: 'dist_electron/entitlements.mac.plist',
    icon: 'dist_electron/icons/icon.icns'
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
    icon: 'dist_electron/icons'
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    artifactName: '${productName}-Setup-${version}.${ext}'
  },
  portable: {
    artifactName: 'Verge Slim ' + displayVersion + '.${ext}'
  },
  afterSign: 'dist_electron/notarize.js'
}
