export const UNSTOPPABLE_DOMAINS_API_KEY = process.env.UNS_API_KEY || 'Bearer ri7h_ailrqgaxtfqaqsenkknxnv8zjwmokc6majxsdsxc4eg'
export const UNSTOPPABLE_DOMAINS_API_URL = 'https://api.unstoppabledomains.com/resolve/domains/'
export const UNSTOPPABLE_DOMAINS_XVG_RECORD_KEY = 'crypto.XVG.address'

export const normalizeWeb3Domain = (value: string): string => value.trim().toLowerCase()

export const looksLikeWeb3Domain = (value: string): boolean => {
  const domain = normalizeWeb3Domain(value)

  if (domain.length === 0 || domain.includes('://') || domain.includes('@')) {
    return false
  }

  if (!/^[a-z0-9-]+(?:\.[a-z0-9-]+)+$/.test(domain)) {
    return false
  }

  const labels = domain.split('.')

  return labels.every(label => label.length > 0 && !label.startsWith('-') && !label.endsWith('-'))
}

export const buildUnstoppableDomainLookupUrl = (domain: string): string => {
  return `${UNSTOPPABLE_DOMAINS_API_URL}${encodeURIComponent(normalizeWeb3Domain(domain))}`
}

export const extractUnstoppableXvgAddress = (payload: any): string | null => {
  const address = payload &&
    payload.records &&
    typeof payload.records[UNSTOPPABLE_DOMAINS_XVG_RECORD_KEY] === 'string'
    ? payload.records[UNSTOPPABLE_DOMAINS_XVG_RECORD_KEY].trim()
    : ''

  return address.length > 0 ? address : null
}
