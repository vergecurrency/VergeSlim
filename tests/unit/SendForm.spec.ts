import { shallowMount, createLocalVue } from '@vue/test-utils'
import Buefy from 'buefy'
import electron from 'electron'
import SendForm from '@/views/Wallet/Send/SendForm.vue'

jest.mock('electron')

const localVue = createLocalVue()
localVue.use(Buefy)

describe('SendForm', () => {
  const wallet = {
    getSendMaxInfo: jest.fn()
  }

  const createWrapper = () => shallowMount(SendForm, {
    localVue,
    propsData: {
      value: {
        toAddress: '',
        amount: 0,
        message: ''
      },
      wallet
    },
    mocks: {
      $i18n: {
        t: (key: string) => key
      }
    }
  })

  beforeEach(() => {
    ;(electron as any).ipcRenderer.invoke.mockReset()
  })

  test('resolves a supported web3 domain before emitting the recipient', async () => {
    ;(electron as any).ipcRenderer.invoke.mockResolvedValue({
      success: true,
      domain: 'example.crypto',
      address: 'DF7R7M5semP472WSvK6WPZkDM1h9ixTL6F'
    })

    const wrapper = createWrapper()
    await wrapper.setData({ toAddress: 'example.crypto', amount: '12.5' })

    await (wrapper.vm as any).confirm()

    const emitted = wrapper.emitted().input as any[][]

    expect((electron as any).ipcRenderer.invoke).toHaveBeenCalledWith('RESOLVE_UNSTOPPABLE_DOMAIN', {
      domain: 'example.crypto'
    })
    expect(emitted[0][0].toAddress).toBe('DF7R7M5semP472WSvK6WPZkDM1h9ixTL6F')
    expect(emitted[0][0].recipientLabel).toBe('example.crypto')
    expect(emitted[0][0].resolvedDomain).toBe('example.crypto')
    expect(emitted[0][0].resolvedAddress).toBe('DF7R7M5semP472WSvK6WPZkDM1h9ixTL6F')
    expect((wrapper.vm as any).resolvedDomain).toBe('example.crypto')
  })

  test('does not resolve a plain XVG address before emitting', async () => {
    const wrapper = createWrapper()
    await wrapper.setData({ toAddress: 'DF7R7M5semP472WSvK6WPZkDM1h9ixTL6F', amount: '1.0' })

    await (wrapper.vm as any).confirm()

    const emitted = wrapper.emitted().input as any[][]

    expect((electron as any).ipcRenderer.invoke).not.toHaveBeenCalled()
    expect(emitted[0][0].toAddress).toBe('DF7R7M5semP472WSvK6WPZkDM1h9ixTL6F')
    expect(emitted[0][0].recipientLabel).toBe('DF7R7M5semP472WSvK6WPZkDM1h9ixTL6F')
  })
})
