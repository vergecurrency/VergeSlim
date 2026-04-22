<template>
  <nav
    class="navbar is-app-navbar is-draggable"
    role="navigation"
    aria-label="main navigation"
  >
    <div class="navbar-menu">
      <div class="navbar-start">
        <div class="navbar-brand">
          <div v-if="isDarwin" class="navbar-item navbar-window-controls"></div>
          <div class="navbar-item logo"></div>
        </div>
      </div>
      <div class="navbar-end">
        <div class="navbar-item">
          <slot name="navbar-items"/>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'NavBar',
  computed: {
    isDarwin () {
      return process.platform === 'darwin'
    }
  }
}
</script>

<style lang="scss">
.navbar {
  border-bottom: 1px solid rgba(83, 243, 255, 0.14);
  box-shadow: 0 16px 30px rgba(1, 4, 18, 0.28);
}

.navbar.is-app-navbar {
  position: relative;
  z-index: 20;
  background: linear-gradient(180deg, rgba(8, 12, 28, 0.94), rgba(12, 16, 34, 0.82));
  backdrop-filter: blur(16px);
}

.navbar-menu,
.navbar-start,
.navbar-end {
  align-items: center;
}

.navbar .button {
  max-height: 40px;
  min-width: 40px;
}

.is-draggable {
  -webkit-app-region: drag;
}

.is-not-draggable {
  -webkit-app-region: no-drag;
}

.navbar-window-controls {
  width: 65px;
}

.logo {
  margin-left: 12px;
  background: url("~@/assets/logo-light.svg");
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  filter: drop-shadow(0 0 18px rgba(83, 243, 255, 0.24));
  width: 132px;
}
</style>
