import constants from '@/utils/constants'

export const normalizeVwsApiUrl = (value: string = ''): string => {
  const normalized = value.trim()

  if (normalized === '') {
    return ''
  }

  return normalized.replace(/\/+$/, '')
}

export const getDefaultVwsApiUrl = (): string => normalizeVwsApiUrl(constants.vwsApi)

export const resolveVwsApiUrl = (value?: string | null): string => {
  const normalized = normalizeVwsApiUrl(value || '')

  return normalized || getDefaultVwsApiUrl()
}

export const isValidVwsApiUrl = (value: string): boolean => {
  const normalized = normalizeVwsApiUrl(value)

  if (normalized === '') {
    return false
  }

  try {
    const parsedUrl = new URL(normalized)

    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:'
  } catch (_error) {
    return false
  }
}
