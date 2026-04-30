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
          <div class="navbar-item logo">
            <span class="logo-mark" aria-hidden="true">V</span>
            <span class="logo-wordmark is-family-display">Verge Slim</span>
          </div>
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
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  filter: drop-shadow(0 0 18px rgba(83, 243, 255, 0.24));
  min-width: 0;
}

.logo-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(255, 63, 181, 0.92), rgba(83, 243, 255, 0.9));
  color: rgba(7, 10, 24, 0.96);
  font-size: 1rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  box-shadow: 0 0 18px rgba(83, 243, 255, 0.22);
}

.logo-wordmark {
  font-size: 1.05rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--rv-text);
  white-space: nowrap;
}
</style>
