<template>
  <div>
    <div class="columns">
      <div class="column welcome-header">
        <div class="header-logo">
          <img src="@/assets/headers/logo@2x.png"/>
        </div>
        <div class="welcome-copy">
          <h1 class="welcome-title is-family-display" v-html="$i18n.t('welcome.welcomeToMyVergies')"/>
        </div>
      </div>
    </div>

    <div class="box">

      <form-box
        :title="$i18n.t('welcome.addAWallet')"
        :description="$i18n.t('welcome.addAWalletDesc')"
      >
        <router-link class="button is-success is-cta welcome-action-button" :to="{ name: 'wallets.create' }" v-html="$i18n.t('welcome.addWallet')"/>
      </form-box>

      <form-box
        :title="$i18n.t('welcome.changeThings')"
        :description="$i18n.t('welcome.changeThingsDesc')"
      >
        <router-link class="button is-primary is-cta welcome-action-button" :to="{ name: 'settings' }" v-html="$i18n.t('welcome.tweakSettings')"/>
      </form-box>

      <form-box
        :title="$i18n.t('welcome.helpImprove')"
        :description="$i18n.t('welcome.helpImproveDesc')"
        type="is-info"
      >
        <router-link class="button is-info is-cta welcome-action-button" :to="{ name: 'trade' }" v-html="$i18n.t('welcome.goToGithub')"/>
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
    justify-content: flex-start;
    align-items: center;
    gap: 2rem;
    margin-bottom: 0.75rem;
  }

  .header-logo > img {
    width: 256px;
    filter: drop-shadow(0 0 28px rgba(83, 243, 255, 0.18));
    animation: rv-drift 9s ease-in-out infinite;
  }

  .welcome-copy {
    min-width: 340px;
    text-align: left;
  }

  .welcome-title {
    font-size: 3.5rem;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    line-height: 0.95;
    color: var(--rv-text);
    text-wrap: balance;
    text-shadow: 0 0 22px rgba(83, 243, 255, 0.18), 0 0 38px rgba(255, 87, 210, 0.08);
    animation: rv-glow-breathe 5.8s ease-in-out infinite;
  }

  .welcome-action-button {
    min-width: 15.5rem;
  }

  @media (max-width: 768px) {
    .welcome-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 1rem;
    }

    .welcome-title {
      font-size: 2.75rem;
      text-align: left;
      letter-spacing: 0.06em;
    }

    .welcome-copy {
      min-width: 0;
    }

    .welcome-action-button {
      min-width: 100%;
    }
  }
</style>
