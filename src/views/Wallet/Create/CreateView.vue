<template>
  <div class="is-vcentered is-fullheight">
    <div class="columns has-text-centered">
      <div class="column">
        <page-title>
          <img src="@/assets/headers/create-wallet@2x.png"/>
        </page-title>
        <h1 class="is-size-1 has-text-grey is-family-handwritten" v-html="$i18n.t('createWallet.createAWallet')"/>
        <p v-html="$i18n.t('createWallet.createAWalletDesc')"/>
      </div>
    </div>

    <div class="columns is-centered has-text-centered">
      <div class="column is-narrow">
        <div class="buttons">
          <router-link
            class="button is-primary"
            :to="{ name: 'wallets.create.new' }"
            v-html="$i18n.t('createWallet.createANewWallet')"
          />
          <router-link
            class="button is-success"
            :to="{ name: 'wallets.create.restore' }"
            v-html="$i18n.t('createWallet.restoreAnExistingWallet')"
          />
        </div>

        <span class="has-text-weight-bold" v-html="$i18n.t('createWallet.or')"/>

        <br/>
        <br/>
        <div class="buttons is-centered">
          <router-link class="button" :to="{ name: 'wallets.create.import' }" v-html="$i18n.t('createWallet.importWallet')"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import PageTitle from '@/components/layout/PageTitle'

export default {
  name: 'wallet-create-view',
  components: { PageTitle }
}
</script>
