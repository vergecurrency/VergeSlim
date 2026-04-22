<template>
  <div class="block has-text-centered">
    <small class="is-small has-text-grey">
      <span v-html="$i18n.t('main.version')"/>: <b v-html="version"/>
    </small>
  </div>
</template>

<script>
export default {
  name: 'VersionBlock',

  created () {
    this.version = this.formatVersion(this.$electron.ipcRenderer.sendSync('get-version'))
  },

  data () {
    return {
      version: ''
    }
  },

  methods: {
    formatVersion (version) {
      return version.replace(/\.0$/, '')
    }
  }
}
</script>
