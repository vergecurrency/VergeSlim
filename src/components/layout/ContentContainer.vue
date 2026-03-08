<template>
  <div class="column" style="height: 100%">
    <div ref="appContentBox" class="app-content-box">
      <div class="quick-nav">
        <router-link class="quick-nav-link" :to="{ name: 'welcome' }">
          Overview
        </router-link>
        <router-link class="quick-nav-link" :to="{ name: 'trade' }">
          Trade
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
  .quick-nav {
    display: flex;
    gap: 10px;
    margin-bottom: 16px;
  }

  .quick-nav-link {
    border: 1px solid #dbdbdb;
    border-radius: 4px;
    color: #363636;
    font-size: 0.875rem;
    font-weight: 600;
    padding: 6px 10px;
  }

  .quick-nav-link:hover {
    border-color: #00d1b2;
    color: #00a188;
  }

  .quick-nav-link.router-link-exact-active {
    border-color: #00d1b2;
    color: #00a188;
  }

  .app-content-box {
    height: 100%;
    padding: 30px;
    overflow-y: auto;
    margin: auto;
  }

  @media (prefers-color-scheme: dark) {
    .quick-nav-link {
      border-color: #3b3e44;
      color: #f5f5f5;
    }

    .quick-nav-link:hover,
    .quick-nav-link.router-link-exact-active {
      border-color: #2ad6c1;
      color: #2ad6c1;
    }
  }
</style>
