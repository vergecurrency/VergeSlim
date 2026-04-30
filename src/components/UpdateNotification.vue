<template>
  <b-notification
    type="is-success"
    class="is-radiusless is-marginless py-2"
    :closable="false"
  >
    <div class="columns">
      <div class="column is-flex is-align-items-center">
        <b-icon
          size="is-medium"
          icon="arrow-alt-circle-up"
        />
        <span class="mx-1">There is a recommended update for <b>Verge Slim</b></span>
      </div>
      <div class="column has-text-right">
        <b-button
          size="is-small"
          label="Update"
          @click="$electron.ipcRenderer.sendSync('install-update')"
        />
      </div>
    </div>
  </b-notification>
</template>

<script>
export default {
  name: 'UpdateNotification'
}
</script>
