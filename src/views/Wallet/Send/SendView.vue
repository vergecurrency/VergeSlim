<template>
  <content-view
    :back="backLink"
    :title="$i18n.t('send.send')"
  >

    <template slot="section">
      <b-steps
        v-model="activeStep"
        size="is-small"
        :animated="false"
        :has-navigation="false"
      >

        <br/>

        <b-step-item :label="$i18n.t('send.fillForm')" :clickable="false">
          <send-form v-model="transaction" :wallet="wallet" @input="validateTransaction"/>
        </b-step-item>

        <b-step-item :label="$i18n.t('send.confirm')" :clickable="false">
          <send-confirm v-model="transaction" @confirmed="sendTransaction" @cancel="activeStep = 0"/>
        </b-step-item>

        <b-step-item :label="$i18n.t('send.sending')" :clickable="false">
          <sending ref="sendingView"/>
        </b-step-item>

        <b-step-item :label="$i18n.t('send.sent')" icon="check">
          <transaction-sent @send="reset" @next="goTo"/>
        </b-step-item>

      </b-steps>
    </template>

  </content-view>
</template>

<script>
import SendForm from '@/views/Wallet/Send/SendForm'
import Sending from '@/views/Wallet/Send/Sending'
import TransactionSent from '@/views/Wallet/Send/TransactionSent'
import SendConfirm from '@/views/Wallet/Send/SendConfirm'
import ContentView from '@/components/layout/ContentView'
import constants from '@/utils/constants'

export default {
  name: 'send-view',
  components: { ContentView, SendConfirm, TransactionSent, Sending, SendForm },
  data () {
    return {
      viewLocked: false,
      activeStep: 0,
      transaction: {
        toAddress: '',
        recipientLabel: '',
        resolvedDomain: '',
        resolvedAddress: '',
        amount: 0,
        message: '',
        txp: null
      }
    }
  },
  props: {
    wallet: {
      type: Object,
      required: true
    }
  },
  computed: {
    backLink () {
      return this.viewLocked ? null : {
        name: 'wallets',
        params: {
          walletIdentifier: this.wallet.identifier,
          wallet: this.wallet
        }
      }
    }
  },
  methods: {
    validateTransaction () {
      const options = {
        outputs: [
          {
            toAddress: this.transaction.toAddress,
            amount: this.transaction.amount * constants.satoshiDivider
          }
        ],
        dryRun: false
      }

      this.wallet.createTxProposal(options).then(txp => {
        this.transaction.txp = txp
        this.activeStep = 1
      }).catch(e => {
        this.$buefy.dialog.alert({
          message: this.$i18n.t(`send.errors.${e.message}`)
        })
      })
    },

    sendTransaction () {
      this.viewLocked = true
      this.activeStep = 2

      this.wallet.publishTxProposal(this.transaction.txp).then(async txp => {
        this.$refs.sendingView.animate()

        const passphrase = await this.$walletManager.getWalletPassphrase(this.wallet)

        return this.wallet.signTxProposal(txp, passphrase)
      }).then(txp => {
        this.$refs.sendingView.animate()

        return this.wallet.broadcastTxProposal(txp)
      }).then(txp => {
        this.$refs.sendingView.animate()

        this.persistResolvedRecipient(txp)

        this.fetchTransaction()

        this.transaction.txp = txp
        this.viewLocked = false
        this.activeStep = 3
      }).catch(e => {
        this.$buefy.dialog.alert({
          message: e.message
        })
      })
    },

    reset () {
      this.viewLocked = false
      this.activeStep = 0
      this.transaction = {
        toAddress: '',
        recipientLabel: '',
        resolvedDomain: '',
        resolvedAddress: '',
        amount: 0,
        message: '',
        txp: null
      }
    },

    goTo (event) {
      if (this.activeStep !== 3) {
        return
      }

      this.$router.push({
        name: event.route,
        params: {
          walletIdentifier: this.wallet.identifier,
          wallet: this.wallet,
          txid: this.transaction.txp.txid
        }
      })
    },

    fetchTransaction () {
      setTimeout(async () => {
        await this.wallet.status()
        await this.wallet.fetchTxHistory()
      }, 2500)
    },

    persistResolvedRecipient (txp) {
      if (!txp || !txp.txid || !this.transaction.resolvedDomain) {
        return
      }

      this.$store.dispatch('saveResolvedRecipient', {
        txid: txp.txid,
        domain: this.transaction.resolvedDomain,
        address: this.transaction.resolvedAddress || this.transaction.toAddress
      })
    }
  }
}
</script>
