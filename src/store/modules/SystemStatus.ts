interface SystemStatusState {
  torPhase: string
  walletPhase: string
}

const state: SystemStatusState = {
  torPhase: 'loading',
  walletPhase: 'idle'
}

const mutations = {
  UPDATE_TOR_STATUS (state: SystemStatusState, phase: string) {
    state.torPhase = phase
  },

  UPDATE_WALLET_STATUS (state: SystemStatusState, phase: string) {
    state.walletPhase = phase
  }
}

const actions = {
  // @ts-ignore
  updateTorStatus ({ commit }, phase: string) {
    commit('UPDATE_TOR_STATUS', phase)
  },

  // @ts-ignore
  updateWalletStatus ({ commit }, phase: string) {
    commit('UPDATE_WALLET_STATUS', phase)
  }
}

const getters = {
  torStatusPhase: (state: SystemStatusState) => state.torPhase,
  walletStatusPhase: (state: SystemStatusState) => state.walletPhase
}

export default {
  state,
  mutations,
  actions,
  getters
}
