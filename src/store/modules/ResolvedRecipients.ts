interface ResolvedRecipientEntry {
  [txid: string]: {
    domain: string
    address: string
  }
}

interface ResolvedRecipientsState {
  byTxid: ResolvedRecipientEntry
}

const state: ResolvedRecipientsState = {
  byTxid: {}
}

const mutations = {
  SAVE_RESOLVED_RECIPIENT (state: ResolvedRecipientsState, payload: { txid: string, domain: string, address: string }) {
    state.byTxid = {
      ...state.byTxid,
      [payload.txid]: {
        domain: payload.domain,
        address: payload.address
      }
    }
  }
}

const actions = {
  // @ts-ignore
  saveResolvedRecipient ({ commit }, payload: { txid: string, domain: string, address: string }) {
    commit('SAVE_RESOLVED_RECIPIENT', payload)
  }
}

const getters = {
  resolvedRecipientByTxid: (state: ResolvedRecipientsState) => (txid: string) => {
    return state.byTxid[txid] || null
  }
}

export default {
  state: state,
  mutations: mutations,
  actions: actions,
  getters: getters
}
