<template>
  <div>
    <div class="block">
      <h1 class="title is-family-display section-display-title" v-html="$i18n.t('send.awesomeYouveDoneIt')"/>
    </div>

    <b-notification :closable="false">
      <div class="is-flex wallet-created">
        <b-icon icon="check-circle" class="create-wallet-icon has-text-success" size="is-large"/>
        <p class="has-text-success has-text-weight-semibold" v-html="$i18n.t('send.transactionSent')"/>
        <p>{{ $i18n.t('send.transactionSentSubtitle') }}!</p>
      </div>
    </b-notification>

    <h3 class="is-size-3 is-family-display section-display-title" v-html="$i18n.t('send.whatToDoNext')"/>
    <div class="box has-background-info-light">
      <div class="columns is-vcentered">
        <div class="column">
          <h4 class="has-text-weight-semibold" v-html="$i18n.t('send.seeTransaction')"/>
          <p v-html="$i18n.t('send.seeTransactionDesc')"/>
        </div>
        <div class="column is-narrow">
          <b-button @click="$emit('next', { route: 'wallets.transactions' })" v-html="$i18n.t('send.transaction')"/>
        </div>
      </div>
    </div>

    <div class="box">
      <div class="columns">
        <div class="column">
          <h4 class="has-text-weight-semibold" v-html="$i18n.t('send.anotherTransaction')"/>
          <p v-html="$i18n.t('send.anotherTransactionDesc')"/>
        </div>
        <div class="column is-narrow">
          <b-button @click="$emit('send')" v-html="$i18n.t('send.anotherTransaction')"/>
        </div>
      </div>
    </div>

    <div class="box">
      <div class="columns is-vcentered">
        <div class="column">
          <h4 class="has-text-weight-semibold" v-html="$i18n.t('send.orGoToWallet')"/>
          <p v-html="$i18n.t('send.orGoToWalletDesc')"></p>
        </div>
        <div class="column is-narrow">
          <b-button
            icon-left="edit"
            :label="$i18n.t('send.goToWallet')"
            type="is-primary"
            @click="$emit('next', { route: 'wallets' })"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TransactionSent'
}
</script>

<style scoped>
  .section-display-title {
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--rv-text);
    text-shadow:
      0 0 10px rgba(124, 255, 242, 0.18),
      0 0 24px rgba(50, 239, 222, 0.24);
  }
</style>
