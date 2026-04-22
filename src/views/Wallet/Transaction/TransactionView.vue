<template>
  <div>
    <navigation-header
      :back="{ name: 'wallets', params: { walletIdentifier: wallet.identifier, wallet }}"
      :title="$i18n.t('transaction.transaction')"
    />

    <div v-if="transaction">
      <div class="columns is-vcentered">
        <div class="column">
          <div class="tags has-addons">
            <span class="tag is-medium is-lowercase" v-html="$i18n.t('transaction.transaction')"/>
            <span class="tag is-medium is-capitalized" :class="tagColor" v-html="$i18n.t(`transaction.${transaction.action}`)" />
          </div>
        </div>
        <div class="column has-text-right">
          <a v-if="transaction.action === 'sent'" class="button is-rounded">
            <b-icon icon="redo" size="is-small"/>
          </a>
        </div>
      </div>

      <div class="columns">
        <div class="column">
          {{ $i18n.t('transaction.amount') }}
          <transaction-amount
            class="is-size-4 has-text-weight-bold"
            :amount="transaction.amount"
            :action="transaction.action"
          />
        </div>
        <div class="column">
          {{ $i18n.t('transaction.date') }}
          <p class="is-size-4 has-text-weight-semibold has-text-primary">{{ timestamp }}</p>
        </div>
      </div>

      <p class="is-title-transaction-details" v-html="$i18n.t('transaction.details')"/>

      <div class="box">

        <div v-if="resolvedRecipient" class="columns is-vcentered is-gapless">
          <div class="column">
            <p class="has-text-weight-semibold" v-html="$i18n.t('transaction.web3Domain')"/>
            <p v-html="resolvedRecipient.domain"/>
          </div>
        </div>

        <hr v-if="resolvedRecipient && address"/>

        <div v-if="address" class="columns is-vcentered is-gapless">
          <div class="column">
            <p class="has-text-weight-semibold" v-html="$i18n.t('transaction.address')"/>
            <p v-html="address"/>
          </div>
          <div class="column has-text-right">
            <a id="show-address-details" class="button is-rounded is-small" @click="showAddressDetails">
              <b-icon icon="info" size="is-small"/>
            </a>
          </div>
        </div>

        <hr v-if="address"/>

        <div class="columns is-gapless">
          <div class="column">
            <p class="has-text-weight-semibold" v-html="$i18n.t('transaction.confirmations')"/>
            <p v-html="transaction.confirmations"/>
          </div>
        </div>

        <hr/>

        <div class="columns is-vcentered is-gapless">
          <div class="column is-10">
            <p class="has-text-weight-semibold" v-html="$i18n.t('transaction.txid')"/>
            <p class="has-text-txid" v-html="transaction.txid"/>
          </div>
          <div class="column has-text-right">
            <a id="show-txid-details" class="button is-rounded is-small" @click="showTxidDetails">
              <b-icon icon="info" size="is-small"/>
            </a>
          </div>
        </div>

      </div>
    </div>
    <!--  Loading skeleton  -->
    <div v-else>
      <div class="columns">
        <div class="column">
          <b-skeleton width="20%" height="30px"/>
        </div>
        <div class="column is-narrow">
          <b-skeleton width="40px" height="40px" circle/>
        </div>
      </div>
      <div class="columns">
        <div class="column">
          <b-skeleton width="90px" height="20px"/>
          <b-skeleton width="50%" height="35px"/>
        </div>
        <div class="column">
          <b-skeleton width="90px" height="20px"/>
          <b-skeleton width="70%" height="35px"/>
        </div>
      </div>
      <p class="is-title-transaction-details"><b-skeleton width="90px" height="20px"/></p>
      <div class="box">
        <b-skeleton width="90px" height="20px"/>
        <b-skeleton width="50%" height="24px"/>
        <hr/>
        <b-skeleton width="150px" height="20px"/>
        <b-skeleton width="10%" height="24px"/>
        <hr/>
        <b-skeleton width="90px" height="20px"/>
        <b-skeleton width="70%" height="24px"/>
      </div>
    </div>

  </div>
</template>

<script>
import moment from 'moment'
import TransactionAmount from '@/components/labels/TransactionAmount'
import NavigationHeader from '@/components/layout/NavigationHeader'
import constants from '@/utils/constants'

export default {
  name: 'transaction-view',
  components: { TransactionAmount, NavigationHeader },
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
      return this.wallet.transactions.find(tx => tx.txid === this.txid) || null
    },

    resolvedRecipient () {
      if (!this.$store || !this.$store.getters || !this.$store.getters.resolvedRecipientByTxid) {
        return null
      }

      return this.$store.getters.resolvedRecipientByTxid(this.txid)
    },

    address () {
      const outputsWithAddress = this.transaction.outputs.filter(output => output.address !== 'false') || []

      return outputsWithAddress.shift().address || null
    },

    label () {
      const fallback = this.transaction.action

      if (this.transaction.action === 'sent') {
        if (this.resolvedRecipient && this.resolvedRecipient.domain) {
          return this.resolvedRecipient.domain
        }

        return this.address || fallback
      }

      return fallback
    },

    timestamp () {
      return moment(this.transaction.time * 1000).locale(this.$electron.remote.app.getLocale()).format('lll')
    },

    tagColor () {
      switch (this.transaction.action) {
        case 'sent':
        case 'sending':
          return 'is-danger'
        case 'received':
        case 'receiving':
          return 'is-success'
        case 'moved':
        case 'pending':
        default:
          return 'is-dark'
      }
    }
  },
  methods: {
    showAddressDetails () {
      this.$electron.shell.openExternal(`${constants.explorer}/address/${this.address}`)
    },

    showTxidDetails () {
      this.$electron.shell.openExternal(`${constants.explorer}/tx/${this.transaction.txid}`)
    }
  }
}
</script>

<style scoped>
  .has-text-txid {
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .is-title-transaction-details {
    margin-bottom: 10px;
  }
</style>
