<template>
  <div class="modal-card modal-panel modal-panel-compact">
    <div class="modal-card-body">
      <p class="has-text-grey pb-4">Copy one of the following to your clipboard</p>
      <div class="box is-paddingless is-clipped">
        <a class="list-option" @click="copyAddress">Address</a>
        <a v-if="address.amount" class="list-option" @click="copyAmount">Amount</a>
        <a class="list-option" @click="copyPublicKey">Public key</a>
        <a class="list-option has-text-danger" @click="copyPrivateKey">Private Key</a>
      </div>
      <b-button label="Cancel" expanded @click="$parent.close()"/>
    </div>
  </div>
</template>

<style scoped>
.list-option {
  display: flex;
  padding: 1em;
  border-bottom: 1px solid rgba(83, 243, 255, 0.12);
  color: var(--rv-text-soft);
  transition: background-color 140ms ease, color 140ms ease;
}

a:last-child.list-option {
  border-bottom: none;
}

.list-option:hover {
  background: linear-gradient(90deg, rgba(83, 243, 255, 0.08), rgba(255, 87, 210, 0.06));
  color: var(--rv-text);
}
</style>

<script>
import Constants from '@/utils/constants'

export default {
  name: 'AddressCopyModal',

  props: {
    address: {
      type: Object,
      required: true
    }
  },

  methods: {
    copyAddress () {
      this.copyToClipboad(this.address.address)
    },

    copyAmount () {
      this.copyToClipboad((this.address.amount / Constants.satoshiDivider).toString())
    },

    copyPublicKey () {
      this.copyToClipboad(this.address.publicKey)
    },

    copyPrivateKey () {
      this.copyToClipboad(this.address.privateKey)
    },

    copyToClipboad (value) {
      this.$electron.clipboard.writeText(value, 'selection')

      this.$buefy.toast.open({
        message: this.$i18n.t('receive.addressCopied'),
        type: 'is-success'
      })

      this.$parent.close()
    }
  }
}
</script>
