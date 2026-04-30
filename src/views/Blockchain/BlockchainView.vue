<template>
  <div>
    <navigation-header title="Blockchain" />
    <form-box
      title="Blockchain installation"
      description="By installing the full Verge Currency blockchain you can easily support the network. If you keep Verge Slim running while you've installed the full blockchain the network gets extra support in distributing blocks. Verge Slim will make sure the blockchain is supported by running the latest version of a Verge node."
      type="is-success"
    >
      <b-button
        label="Install"
      />
    </form-box>

    <form-box
      v-if="blockHeight"
      title="Blocks Tip"
      description="The blockchain is a large chain of information that all confirm each other. One single piece of this large chain is called a block. And each of those blocks have their own number, also known as block height. The latest of those blocks is kinda important for various reasons :) so this is the current block height:"
    >
      <span class="has-text-weight-bold is-size-4 has-text-primary">{{ blockHeight }}</span>
    </form-box>
    <form-box
      title="Block Explorer"
      description="Verify yours and others transactions on the Verge Currency block explorer."
    >
      <b-button
        label="Open Explorer"
        type="is-primary"
        @click="openExplorer"
      />
    </form-box>
  </div>
</template>

<script>
import FormBox from '@/components/layout/FormBox'
import NavigationHeader from '@/components/layout/NavigationHeader'
import constants from '@/utils/constants'

export default {
  name: 'blockchain-view',

  components: { NavigationHeader, FormBox },

  data () {
    return {
      blockHeight: null,
      fetcher: null
    }
  },

  created () {
    this.getBlockHeight()

    this.fetcher = setInterval(this.getBlockHeight, 30000)
  },

  destroyed () {
    clearInterval(this.fetcher)
  },

  methods: {
    openExplorer () {
      this.$electron.shell.openExternal(constants.explorer)
    },

    getBlockHeight () {
      this.$http.get(`${constants.bnApi}/XVG/mainnet/block/tip`).then(response => {
        this.blockHeight = response.data.height || null
      })
    }
  }
}
</script>
