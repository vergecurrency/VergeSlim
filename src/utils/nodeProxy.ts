const TOR_HTTP_PROXY = 'http://127.0.0.1:9998'
const NO_PROXY = '127.0.0.1,localhost'

const getGlobalAgent = () => {
  const globalAny = global as any

  if (!globalAny.GLOBAL_AGENT) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { bootstrap } = require('global-agent')
    bootstrap()
  }

  return globalAny.GLOBAL_AGENT
}

const setEnv = (key: string, value: string) => {
  process.env[key] = value
}

const clearEnv = (key: string) => {
  delete process.env[key]
}

export const applyNodeProxyState = (activate: boolean) => {
  const globalAgent = getGlobalAgent()

  if (activate) {
    globalAgent.HTTP_PROXY = TOR_HTTP_PROXY
    globalAgent.HTTPS_PROXY = TOR_HTTP_PROXY
    globalAgent.NO_PROXY = NO_PROXY

    setEnv('GLOBAL_AGENT_HTTP_PROXY', TOR_HTTP_PROXY)
    setEnv('GLOBAL_AGENT_HTTPS_PROXY', TOR_HTTP_PROXY)
    setEnv('GLOBAL_AGENT_NO_PROXY', NO_PROXY)
    setEnv('HTTP_PROXY', TOR_HTTP_PROXY)
    setEnv('HTTPS_PROXY', TOR_HTTP_PROXY)
    setEnv('http_proxy', TOR_HTTP_PROXY)
    setEnv('https_proxy', TOR_HTTP_PROXY)
    setEnv('NO_PROXY', NO_PROXY)
    setEnv('no_proxy', NO_PROXY)
    return
  }

  globalAgent.HTTP_PROXY = null
  globalAgent.HTTPS_PROXY = null
  globalAgent.NO_PROXY = NO_PROXY

  clearEnv('GLOBAL_AGENT_HTTP_PROXY')
  clearEnv('GLOBAL_AGENT_HTTPS_PROXY')
  setEnv('GLOBAL_AGENT_NO_PROXY', NO_PROXY)
  clearEnv('HTTP_PROXY')
  clearEnv('HTTPS_PROXY')
  clearEnv('http_proxy')
  clearEnv('https_proxy')
  setEnv('NO_PROXY', NO_PROXY)
  setEnv('no_proxy', NO_PROXY)
}
