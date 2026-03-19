import { mount } from '@vue/test-utils'
import PaperKey from '@/views/Wallet/Create/PaperKey.vue'
import Constants from '@/utils/constants'

const mockWords = [
  'alpha',
  'bravo',
  'charlie',
  'delta',
  'echo',
  'foxtrot',
  'golf',
  'hotel',
  'india',
  'juliet',
  'kilo',
  'lima'
]

jest.mock('bitcore-mnemonic', () => {
  function MockMnemonic () {
    return {
      toString: () => mockWords.join(' ')
    }
  }

  MockMnemonic.Words = {
    ENGLISH: 'english'
  }

  MockMnemonic.isValid = () => true

  return MockMnemonic
})

describe('PaperKey', () => {
  it('renders generated paper key words in the 12 boxes', async () => {
    const wrapper = mount(PaperKey, {
      propsData: {
        value: {}
      },
      mocks: {
        $i18n: {
          t: (key: string) => key
        }
      },
      stubs: ['b-field', 'b-button', 'b-notification']
    })

    const vm = wrapper.vm as any

    await wrapper.vm.$nextTick()

    expect(vm.paperkey).toHaveLength(Constants.paperKeyLength)
    expect(vm.paperkey).toEqual(mockWords)

    const renderedWordTags = wrapper.findAll('.word-tag')

    expect(renderedWordTags).toHaveLength(Constants.paperKeyLength)

    renderedWordTags.wrappers.forEach((tagWrapper, index) => {
      expect(tagWrapper.text()).toBe(mockWords[index])
    })
  })
})
