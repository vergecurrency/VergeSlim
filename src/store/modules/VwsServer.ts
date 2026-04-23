import { getDefaultVwsApiUrl, normalizeVwsApiUrl } from '@/utils/vwsApi'

interface VwsServerState {
  api: string
}

const state: VwsServerState = {
  api: getDefaultVwsApiUrl()
}

const mutations = {
  UPDATE_VWS_API (state: VwsServerState, api: string) {
    state.api = normalizeVwsApiUrl(api)
  }
}

const actions = {
  // @ts-ignore
  updateVwsApi ({ commit }, api: string) {
    commit('UPDATE_VWS_API', api)
  }
}

const getters = {
  currentVwsApi: (state: VwsServerState) => {
    return state.api || getDefaultVwsApiUrl()
  }
}

export default {
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}
