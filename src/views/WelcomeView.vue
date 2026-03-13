<template>
  <div>
    <div class="columns">
      <div class="column welcome-header">
        <div class="welcome-copy has-text-right">
          <h1 class="welcome-title" v-html="$i18n.t('welcome.welcomeToMyVergies')"/>
        </div>
        <div class="header-logo">
          <img src="@/assets/headers/logo@2x.png"/>
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
    gap: 2rem;
  }

  .header-logo > img {
    width: 200px;
  }

  .welcome-copy {
    min-width: 340px;
  }

  .welcome-title {
    font-family: "Avenir Next", Futura, "Trebuchet MS", sans-serif;
    font-size: 3.5rem;
    font-weight: 800;
    letter-spacing: -0.04em;
    line-height: 0.95;
    color: #2f3a44;
    text-wrap: balance;
  }

  @media (max-width: 768px) {
    .welcome-header {
      flex-direction: column-reverse;
      gap: 1rem;
    }

    .welcome-title {
      font-size: 2.75rem;
      text-align: center;
    }

    .welcome-copy {
      min-width: 0;
    }
  }

  @media (prefers-color-scheme: dark) {
    .welcome-title {
      color: #f4f6f8;
    }
  }
</style>
