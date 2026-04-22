const disableBuildWorkers = process.env.MYVERGIES_DISABLE_BUILD_WORKERS === 'true'

module.exports = {
  ...(disableBuildWorkers ? { parallel: false } : {}),
  chainWebpack: config => {
    if (disableBuildWorkers) {
      config.plugins.delete('fork-ts-checker')
      config.optimization.minimize(false)
    }
  },
  pluginOptions: {
    electronBuilder: {
      chainWebpackMainProcess: config => {
        if (disableBuildWorkers) {
          config.plugins.delete('uglify')
          config.optimization.minimize(false)
        }
      },
      builderOptions: {
        productName: 'MyVergies',
        appId: 'com.github.vergecurrency.myvergies',
        publish: [
          {
            provider: 'github',
            owner: 'vergecurrency',
            repo: 'MyVergies'
          }
        ],
        asar: true,
        asarUnpack: [
          'bin/**/*'
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
          /* eslint-disable */
          artifactName: '${productName}-Setup-${version}.${ext}'
          /* eslint-enable */
        },
        afterSign: 'dist_electron/notarize.js'
      },
      externals: ['keytar']
    }
  }
}
