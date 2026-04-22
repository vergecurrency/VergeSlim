'use strict'

module.exports = {
  MenuItem: jest.fn(function (values) {
    this.values = values
  }),
  Menu: jest.fn(() => ({
    append: jest.fn()
  })),
  ipcRenderer: {
    invoke: jest.fn(),
    on: jest.fn()
  },
  app: {
    name: 'MyVergies',
    getVersion () {
      return '0.0.1'
    }
  }
}
