<template>
  <b-dropdown aria-role="list" class="dropdown-trigger" position="is-bottom-left">
    <button class="button is-white is-not-draggable" slot="trigger">
      <LoadingOnion v-if="connectionStatus === 'loading'" />
      <DisconnectedOnion v-if="connectionStatus === 'disconnected'" />
      <ConnectedOnion v-if="connectionStatus === 'connected'" />
      <ErrorOnion v-if="connectionStatus === 'error'" />
    </button>
    <b-dropdown-item aria-role="listitem" :focusable="false" custom>
      <div class="ox">
        <b-field>
          <b-switch v-model="torActivated" @input="changed">
            {{ $i18n.t("tor.toggle") }}
          </b-switch>
        </b-field>
      </div>
    </b-dropdown-item>
    <hr class="dropdown-divider">
    <b-dropdown-item aria-role="listitem" :focusable="false" custom>
      <b-field :label="$i18n.t('tor.status.title')">
        {{ this.connectionStatusName }}
      </b-field>
    </b-dropdown-item>
    <div v-if="torActivated && !loading && !error">
      <b-dropdown-item aria-role="listitem" :focusable="false" custom>
        <b-field :label="$i18n.t('tor.status.ip')">
          {{ networkData.ip }}
        </b-field>
      </b-dropdown-item>
      <b-dropdown-item aria-role="listitem" :focusable="false" custom>
        <b-field :label="$i18n.t('tor.status.region')">
          {{ networkData.country_name }}, {{ networkData.city }}
        </b-field>
      </b-dropdown-item>
      <b-dropdown-item aria-role="listitem" :focusable="false" custom>
        <b-field :label="$i18n.t('tor.status.version') || 'Tor Version'">
          {{ networkData.torVersion || 'Unknown' }}
        </b-field>
      </b-dropdown-item>
    </div>
  </b-dropdown>
</template>

<script>
import { ipcRenderer } from 'electron'
import LoadingOnion from '@/assets/tor-icons/onion-loading'
import DisconnectedOnion from '@/assets/tor-icons/onion-disconnected'
import ConnectedOnion from '@/assets/tor-icons/onion-connected'
import ErrorOnion from '@/assets/tor-icons/onion-error'
import { eventConstants } from '@/utils/constants'
import Log from 'electron-log'
import { ensureTorProxyState, waitForPrimaryApiReady } from '@/utils/torStartup'

export default {
  name: 'tor-status',

  components: { LoadingOnion, DisconnectedOnion, ConnectedOnion, ErrorOnion },

  data () {
    return {
      loading: true,
      networkData: {},
      error: null,
      torActivated: true
    }
  },

  mounted () {
    if (typeof this.$store.getters.isTorEnabled === 'boolean') {
      this.torActivated = this.$store.getters.isTorEnabled
    }

    this.applyTorState()
  },

  computed: {
    connectionStatusName () {
      if (this.loading) {
        return this.$i18n.t('tor.status.loading')
      }

      if (this.error) {
        return this.$i18n.t('tor.status.unableToConnect')
      }

      if (!this.torActivated) {
        return this.$i18n.t('tor.status.disconnected')
      }

      return this.$i18n.t('tor.status.connected')
    },

    connectionStatus () {
      if (this.loading) {
        return 'loading'
      }

      if (this.error) {
        return 'error'
      }

      if (!this.torActivated) {
        return 'disconnected'
      }

      return 'connected'
    }
  },

  methods: {
    delay (ms) {
      return new Promise(resolve => setTimeout(resolve, ms))
    },

    async applyTorState () {
      try {
        await ensureTorProxyState(this.torActivated)

        if (!this.torActivated) {
          this.error = null
          this.networkData = null
          this.loading = false
          return
        }

        await waitForPrimaryApiReady()

        return this.fetchIpAddress()
      } catch (err) {
        Log.error("Couldn't apply tor state. Reason:", err)
        this.error = err
        this.networkData = null
        this.loading = false
      }
    },

    async fetchIpAddress () {
      this.error = null
      this.ip = null
      this.loading = true

      const maxAttempts = 6
      const retryDelayMs = 7000

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          if (attempt > 1) {
            await this.delay(retryDelayMs)
          } else {
            await this.delay(500)
          }

          const networkData = await ipcRenderer.invoke(eventConstants.getTorNetworkInfo)
          if (!networkData || !networkData.ip) {
            throw new Error('Empty tor network data')
          }

          Log.info('Fetched Tor IP address')
          this.networkData = networkData
          this.loading = false
          return
        } catch (err) {
          Log.warn(`Tor IP lookup attempt ${attempt}/${maxAttempts} failed`, err)
          if (attempt === maxAttempts) {
            // Tor can still be usable even if geo/IP lookup is blocked by the exit relay.
            this.error = null
            this.networkData = {
              ip: 'Unknown',
              country_name: 'Unknown',
              city: 'Unknown',
              torVersion: this.networkData && this.networkData.torVersion ? this.networkData.torVersion : 'Unknown'
            }
            this.loading = false
            return
          }
        }
      }
    },

    async changed () {
      this.$store.dispatch('updateTorEnabled', this.torActivated)
      await this.applyTorState()
    }
  }
}
</script>
