<template>
  <div>
    <div class="columns">
      <div class="column welcome-header">
        <div class="header-logo">
          <img src="@/assets/headers/logo@2x.png"/>
        </div>
        <div class="has-text-right">
          <h1 class="is-size-1 is-family-handwritten" v-html="$i18n.t('welcome.welcomeToMyVergies')"/>
          <h4 class="is-size-6 has-text-grey" v-html="$i18n.t('welcome.createdBy')"/>
        </div>
      </div>
    </div>

    <div class="box">

      <form-box
        :title="$i18n.t('welcome.addAWallet')"
        :description="$i18n.t('welcome.addAWalletDesc')"
      >
        <router-link class="button is-success" :to="{ name: 'wallets.create' }" v-html="$i18n.t('welcome.addWallet')"/>
      </form-box>

      <form-box
        :title="$i18n.t('welcome.changeThings')"
        :description="$i18n.t('welcome.changeThingsDesc')"
      >
        <router-link class="button is-primary" :to="{ name: 'settings' }" v-html="$i18n.t('welcome.tweakSettings')"/>
      </form-box>

      <form-box
        :title="$i18n.t('welcome.helpImprove')"
        :description="$i18n.t('welcome.helpImproveDesc')"
        type="is-info"
      >
        <router-link class="button is-info" :to="{ name: 'trade' }" v-html="$i18n.t('welcome.goToGithub')"/>
      </form-box>

    </div>

    <version-block/>
  </div>
</template>

<script>
import FormBox from '@/components/layout/FormBox'
import VersionBlock from '@/components/VersionBlock'

export default {
  name: 'WelcomeView',

  components: { VersionBlock, FormBox }
}
</script>

<style>
  .welcome-header {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .header-logo > img {
    width: 200px;
  }
</style>
