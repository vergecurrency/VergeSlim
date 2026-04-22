import { shallowMount, createLocalVue } from '@vue/test-utils'
import sinon from 'sinon'
import TransactionView from '@/views/Wallet/Transaction/TransactionView.vue'
import Buefy from 'buefy'
import VueRouter from 'vue-router'

const localVue = createLocalVue()
localVue.use(Buefy)
localVue.use(VueRouter)

describe('TransactionView.vue', () => {
  it('should render correct contents', () => {
    const transaction = {
      txid: 'fb6786d19c94c6766d1caa454b65af849c042c00e379b08cfc5a092f6ba85439',
      confirmations: 2705,
      time: 1572380947,
      action: 'sent',
      amount: 10000000,
      outputs: [
        {
          address: 'D8tF73Fd56BgsGGxe9ZQP4v3amU4cMxyMT',
          amount: 10000000,
          message: null
        }
      ]
    }
    const wallet = {
      name: 'Main Account',
      amount: 123,
      color: 'blue',
      transactions: [transaction]
    }

    const $electron = { remote: { app: { getLocale: () => 'nl' } } }
    const wrapper = shallowMount(TransactionView, {
      localVue,
      propsData: {
        txid: transaction.txid,
        wallet
      },
      mocks: {
        $electron,
        $i18n: {
          t (key: string) {
            return key
          }
        }
      }
    })

    expect(wrapper.text()).toContain(transaction.txid)
    expect(wrapper.text()).toContain(transaction.confirmations)
    expect(wrapper.text()).toContain(transaction.action)
  })

  it('should render the web3 domain and resolved address when available', () => {
    const transaction = {
      txid: 'fb6786d19c94c6766d1caa454b65af849c042c00e379b08cfc5a092f6ba85439',
      confirmations: 2705,
      time: 1572380947,
      action: 'sent',
      amount: 10000000,
      outputs: [
        {
          address: 'D8tF73Fd56BgsGGxe9ZQP4v3amU4cMxyMT',
          amount: 10000000,
          message: null
        }
      ]
    }
    const wallet = {
      name: 'Main Account',
      amount: 123,
      color: 'blue',
      transactions: [transaction]
    }

    const $electron = { remote: { app: { getLocale: () => 'nl' } } }
    const wrapper = shallowMount(TransactionView, {
      localVue,
      propsData: {
        txid: transaction.txid,
        wallet
      },
      mocks: {
        $electron,
        $store: {
          getters: {
            resolvedRecipientByTxid: () => ({
              domain: 'example.crypto',
              address: 'D8tF73Fd56BgsGGxe9ZQP4v3amU4cMxyMT'
            })
          }
        },
        $i18n: {
          t (key: string) {
            return key
          }
        }
      }
    })

    expect(wrapper.text()).toContain('example.crypto')
    expect(wrapper.text()).toContain('D8tF73Fd56BgsGGxe9ZQP4v3amU4cMxyMT')
  })

  it('should open the tx address in a explorer', () => {
    const transaction = {
      txid: 'fb6786d19c94c6766d1caa454b65af849c042c00e379b08cfc5a092f6ba85439',
      confirmations: 2705,
      time: 1572380947,
      action: 'sent',
      amount: 10000000,
      outputs: [
        {
          address: 'D8tF73Fd56BgsGGxe9ZQP4v3amU4cMxyMT',
          amount: 10000000,
          message: null
        }
      ]
    }
    const wallet = {
      name: 'Main Account',
      amount: 123,
      color: 'blue',
      transactions: [transaction]
    }

    const openExternal = sinon.stub()
    const $electron = {
      shell: { openExternal },
      remote: { app: { getLocale: () => 'nl' } }
    }
    const wrapper = shallowMount(TransactionView, {
      localVue,
      propsData: {
        txid: transaction.txid,
        wallet
      },
      mocks: {
        $electron,
        $i18n: {
          t (key: string) {
            return key
          }
        }
      }
    })

    wrapper.find('#show-address-details').trigger('click')

    // eslint-disable-next-line no-unused-expressions
    expect(openExternal.called).toBe(true)
  })

  it('should open the tx id in a explorer', () => {
    const transaction = {
      txid: 'fb6786d19c94c6766d1caa454b65af849c042c00e379b08cfc5a092f6ba85439',
      confirmations: 2705,
      time: 1572380947,
      action: 'sent',
      amount: 10000000,
      outputs: [
        {
          address: 'D8tF73Fd56BgsGGxe9ZQP4v3amU4cMxyMT',
          amount: 10000000,
          message: null
        }
      ]
    }
    const wallet = {
      name: 'Main Account',
      amount: 123,
      color: 'blue',
      transactions: [transaction]
    }

    const openExternal = sinon.stub()
    const $electron = {
      shell: { openExternal },
      remote: { app: { getLocale: () => 'nl' } }
    }
    const wrapper = shallowMount(TransactionView, {
      localVue,
      propsData: {
        txid: transaction.txid,
        wallet
      },
      mocks: {
        $electron,
        $i18n: {
          t (key: string) {
            return key
          }
        }
      }
    })

    wrapper.find('#show-txid-details').trigger('click')

    // eslint-disable-next-line no-unused-expressions
    expect(openExternal.called).toBe(true)
  })
})
