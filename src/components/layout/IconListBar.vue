<template>
  <div class="buttons">
    <TorStatus />
    <a class="button is-white is-not-draggable" @click="$authManager.toggleAuthentication()">
      <span class="icon has-text-grey-dark">
        <b-icon v-if="isAuthenticated" size="is-small" icon="lock-open" />
        <b-icon v-else size="is-small" icon="lock" />
      </span>
    </a>
    <router-link to="/settings" class="button is-white is-not-draggable">
       <span class="icon has-text-grey-dark">
         <b-icon size="is-small" icon="cog" />
       </span>
    </router-link>
    <a class="button is-white is-window-control is-not-draggable" @click="minimizeWindow">
      <span class="icon has-text-grey-dark is-window-control-symbol is-window-control-symbol-minimize">
        <span aria-hidden="true">-</span>
      </span>
    </a>
    <a class="button is-white is-window-control is-not-draggable" @click="toggleMaximizeWindow">
      <span class="icon has-text-grey-dark is-window-control-symbol is-window-control-symbol-maximize">
        <span aria-hidden="true"></span>
      </span>
    </a>
    <a class="button is-white is-window-control is-window-control-close is-not-draggable" @click="closeWindow">
      <span class="icon has-text-grey-dark">
        <b-icon size="is-small" icon="times" />
      </span>
    </a>
  </div>
</template>

<script>
import TorStatus from '@/views/TorStatus'
import { ipcRenderer } from 'electron'
import { eventConstants } from '@/utils/constants'

export default {
  name: 'icon-list-bar',
  components: { TorStatus },
  methods: {
    async minimizeWindow () {
      await ipcRenderer.invoke(eventConstants.minimizeWindow)
    },
    async toggleMaximizeWindow () {
      await ipcRenderer.invoke(eventConstants.toggleMaximizeWindow)
    },
    async closeWindow () {
      await ipcRenderer.invoke(eventConstants.closeWindow)
    }
  }
}
</script>

<style scoped>
.buttons {
  align-items: center;
  gap: 0.35rem;
}

.dropdown-trigger {
  margin: 0 0.5rem 0 0;
}

.is-window-control {
  transition: transform 170ms ease, box-shadow 170ms ease, background-color 170ms ease;
}

.is-window-control:hover {
  transform: translateY(-1px);
  box-shadow: 0 0 20px rgba(83, 243, 255, 0.14);
}

.is-window-control-symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  font-size: 0.95rem;
  font-weight: 700;
  line-height: 1;
}

.is-window-control-symbol-minimize {
  transform: translateY(-4px);
}

.is-window-control-symbol-maximize > span {
  display: inline-block;
  width: 10px;
  height: 10px;
  border: 1.6px solid currentColor;
  border-radius: 1px;
}

.is-window-control-close:hover {
  background-color: rgba(255, 91, 164, 0.14) !important;
  box-shadow: 0 0 20px rgba(255, 91, 164, 0.2);
}
</style>
