export const eventConstants = {
  toggleTor: 'TOGGLE_TOR',
  toggledTor: 'TOR_TOGGLED',
  torConnectionError: 'TOR_CONNECTION_ERROR',
  getTorNetworkInfo: 'GET_TOR_NETWORK_INFO',
  resolveUnstoppableDomain: 'RESOLVE_UNSTOPPABLE_DOMAIN',
  fitWindowToContent: 'FIT_WINDOW_TO_CONTENT'
}

export default {
  priceApi: 'https://api.vergecurrency.network/price/api/v1/price',
  ipApi: 'https://api.vergecurrency.network/price/api/v1/ip',
  vwsApi: 'https://api.vergecurrency.network/vws/api',
  bnApi: 'https://api.vergecurrency.network/node/api',
  explorer: 'https://verge-blockchain.info',
  termsOfUse: 'https://vergecurrency.com/wallets/terms',
  feePerKb: 100000,
  satoshiDivider: 1000000,
  decimalPerSatoshi: 6,
  defaultCurrencyCode: 'USD',
  paperKeyLength: 12
}
