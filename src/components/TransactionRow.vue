<template>
  <router-link :to="{ name: 'wallets.transactions', params: { walletIdentifier: wallet.identifier, txid: transaction.txid, transaction, wallet }}">
    <div class="transaction-container">
      <div :class="['transaction-icon', `is-${transaction.action}`]">
        <b-icon v-if="transaction.action === 'received'" icon="plus-circle" type="is-success" class="fa-fw"/>
        <b-icon v-else-if="transaction.action === 'sent'" icon="minus-circle" type="is-danger"/>
        <b-icon v-else-if="transaction.action === 'moved'" icon="truck" class="has-text-grey-light fa-fw"/>
        <b-icon v-else-if="transaction.action === 'receiving'" icon="hourglass-half" class="has-text-grey-light fa-fw"/>
        <b-icon v-else-if="transaction.action === 'sending'" icon="satellite-dish" class="has-text-grey-light fa-fw"/>
        <b-icon v-else icon="question-circle" type="is-warning" class="fa-fw"/>
      </div>
      <div class="transaction-content">
        <div class="transaction-label">
          {{ label }}
        </div>
        <div class="transaction-timestamp">
          {{ timestamp }}
        </div>
      </div>
      <transaction-amount
        :amount="transaction.amount"
        :action="transaction.action"
        class="has-text-weight-bold"
        :class="['transaction-amount']"
      />
    </div>
  </router-link>
</template>

<script>
import moment from 'moment'
import TransactionAmount from '@/components/labels/TransactionAmount'

export default {
  name: 'TransactionRow',
  components: { TransactionAmount },
  props: {
    txid: {
      type: String,
      required: true
    },
    wallet: {
      type: Object,
      required: true
    }
  },
  computed: {
    transaction () {
      return this.wallet.transactions.find(tx => tx.txid === this.txid)
    },

    resolvedRecipient () {
      if (!this.$store || !this.$store.getters || !this.$store.getters.resolvedRecipientByTxid) {
        return null
      }

      return this.$store.getters.resolvedRecipientByTxid(this.txid)
    },

    label () {
      const fallback = this.$i18n.t(`transaction.${this.transaction.action}`)
      const outputsWithAddress = this.transaction.outputs.filter(output => output.address !== 'false') || []

      if (this.transaction.action === 'sent' || this.transaction.action === 'sending') {
        if (this.resolvedRecipient && this.resolvedRecipient.domain) {
          return this.resolvedRecipient.domain
        }

        return outputsWithAddress.shift().address || fallback
      }

      return fallback
    },

    timestamp () {
      return moment(this.transaction.time * 1000).locale(this.$electron.remote.app.getLocale()).format('lll')
    }
  }
}
</script>

<style scoped>
  .transaction-container {
    display: flex;
    padding: 1.1em 1.25em;
    border-bottom: 1px solid rgba(83, 243, 255, 0.12);
    align-items: center;
    background: rgba(11, 17, 40, 0.28);
    transition: background-color 140ms ease, transform 140ms ease, box-shadow 140ms ease;
    cursor: pointer;
  }

  a:last-child .transaction-container {
    border-bottom: none;
  }

  .transaction-container:hover {
    background: linear-gradient(90deg, rgba(83, 243, 255, 0.08), rgba(255, 87, 210, 0.06));
    transform: translateY(-1px);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .transaction-icon {
    width: 2.6rem;
    height: 2.6rem;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(15, 22, 48, 0.9);
    border: 1px solid rgba(83, 243, 255, 0.12);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .transaction-icon.is-received {
    color: #76ffba;
  }

  .transaction-icon.is-sent {
    color: #ff89b8;
  }

  .transaction-icon.is-moved,
  .transaction-icon.is-receiving,
  .transaction-icon.is-sending {
    color: var(--rv-text-muted);
  }

  .transaction-content {
    margin: 0 1em;
    flex-grow: 1;
  }

  .transaction-label {
    font-weight: 700;
    color: var(--rv-text);
  }

  .transaction-timestamp {
    font-size: 0.74em;
    font-weight: 500;
    color: var(--rv-text-muted);
  }

  .transaction-amount {
    font-weight: 500;
    text-shadow: 0 0 12px rgba(83, 243, 255, 0.08);
  }
</style>
