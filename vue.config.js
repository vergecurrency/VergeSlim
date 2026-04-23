const disableBuildWorkers = process.env.MYVERGIES_DISABLE_BUILD_WORKERS === 'true'

const rendererExternals = {
  electron: 'commonjs2 electron',
  'bitcore-wallet-client-xvg': 'commonjs2 bitcore-wallet-client-xvg',
  'bitcore-lib': 'commonjs2 bitcore-lib',
  'bitcore-lib-cash': 'commonjs2 bitcore-lib-cash',
  'bitcore-mnemonic': 'commonjs2 bitcore-mnemonic',
  'bitcore-stealth': 'commonjs2 bitcore-stealth',
  'electron-log': 'commonjs2 electron-log',
  'sudo-prompt': 'commonjs2 sudo-prompt'
}

module.exports = {
  outputDir: 'dist_electron/bundled',
  publicPath: './',
  configureWebpack: {
    entry: {
      app: './src/main.ts'
    },
    target: 'electron-renderer',
    output: {
      hashFunction: 'xxhash64'
    },
    externals: rendererExternals
  },
  ...(disableBuildWorkers ? { parallel: false } : {}),
  chainWebpack: config => {
    if (disableBuildWorkers) {
      config.plugins.delete('fork-ts-checker')
      config.optimization.minimize(false)
    }
  }
}
