import {
  buildUnstoppableDomainLookupUrl,
  extractUnstoppableXvgAddress,
  looksLikeWeb3Domain,
  normalizeWeb3Domain
} from '@/utils/unstoppableDomains'

describe('unstoppableDomains helpers', () => {
  test('normalizes and validates supported web3 domains', () => {
    expect(normalizeWeb3Domain('  Example.Crypto ')).toBe('example.crypto')
    expect(looksLikeWeb3Domain('example.crypto')).toBe(true)
    expect(looksLikeWeb3Domain('subdomain.wallet')).toBe(true)
    expect(looksLikeWeb3Domain('example.eth')).toBe(true)
    expect(looksLikeWeb3Domain('https://example.crypto')).toBe(false)
    expect(looksLikeWeb3Domain('not an address')).toBe(false)
  })

  test('builds a lookup url for the normalized domain', () => {
    expect(buildUnstoppableDomainLookupUrl('Example.Crypto'))
      .toBe('https://api.unstoppabledomains.com/resolve/domains/example.crypto')
  })

  test('extracts the XVG record from the resolution payload', () => {
    expect(extractUnstoppableXvgAddress({
      records: {
        'crypto.XVG.address': ' DJd7VQx7ePrxExampleAddress '
      }
    })).toBe('DJd7VQx7ePrxExampleAddress')

    expect(extractUnstoppableXvgAddress({ records: {} })).toBeNull()
  })
})
