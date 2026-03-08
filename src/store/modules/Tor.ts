interface TorSettings {
  enabled: boolean
}

const state: TorSettings = {
  enabled: true
}

const mutations = {
  UPDATE_TOR_ENABLED (state: TorSettings, enabled: boolean) {
    state.enabled = enabled
  }
}

const actions = {
  // @ts-ignore
  updateTorEnabled ({ commit }, enabled: boolean) {
    commit('UPDATE_TOR_ENABLED', enabled)
  }
}

const getters = {
  isTorEnabled: (state: TorSettings) => {
    return state.enabled
  }
}

export default {
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}
