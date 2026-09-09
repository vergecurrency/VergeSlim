'use strict'

const Client = jest.fn()

Client.prototype.request = {}

Client.prototype.seedFromMnemonic = () => undefined

Client.prototype.openWallet = (callback) => {
  callback(undefined, {
    name: 'myWallet',
    balance: {
      totalAmount: 0,
      lockedAmount: 0,
      totalConfirmedAmount: 0,
      lockedConfirmedAmount: 0,
      availableAmount: 0,
      availableConfirmedAmount: 0,
      byAddress: [{
        address: 'DAbCE82rhfqhwaaDAbCE82rhfqhwaa',
        path: "m'44/0/0/1",
        amount: 0
      }]
    }
  })
}

module.exports = Client
