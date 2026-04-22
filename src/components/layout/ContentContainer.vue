<template>
  <div class="column app-shell-column" style="height: 100%">
    <div ref="appContentBox" class="app-content-box">
      <div class="quick-nav">
        <router-link class="quick-nav-link" :to="{ name: 'welcome' }">
          {{ $i18n.t('main.quickNav.overview') }}
        </router-link>
        <router-link class="quick-nav-link" :to="{ name: 'games' }">
          {{ $i18n.t('main.quickNav.games') }}
        </router-link>
        <router-link class="quick-nav-link" :to="{ name: 'trade' }">
          {{ $i18n.t('main.quickNav.trade') }}
        </router-link>
      </div>
      <slot/>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ContentContainer'
}
</script>

<style>
  .app-shell-column {
    position: relative;
  }

  .quick-nav {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .quick-nav-link {
    border: 1px solid rgba(83, 243, 255, 0.18);
    border-radius: 999px;
    color: var(--rv-text-soft);
    font-size: 0.76rem;
    font-weight: 700;
    letter-spacing: 0.14em;
    padding: 0.55rem 1rem;
    text-transform: uppercase;
    background: rgba(13, 19, 46, 0.72);
    box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  }

  .quick-nav-link:hover,
  .quick-nav-link.router-link-exact-active {
    border-color: rgba(83, 243, 255, 0.42);
    color: #ffffff;
    background: linear-gradient(135deg, rgba(255, 87, 210, 0.2), rgba(83, 243, 255, 0.22));
    box-shadow: 0 0 24px rgba(83, 243, 255, 0.12);
  }

  .app-content-box {
    height: 100%;
    padding: 32px 34px 40px;
    overflow-y: auto;
    margin: auto;
    border-radius: 20px;
  }

  @media (max-width: 768px) {
    .app-content-box {
      padding: 24px 18px 28px;
    }
  }
</style>
