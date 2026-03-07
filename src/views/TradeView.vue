<template>
  <content-view
    :title="$i18n.t('welcome.goToGithub')"
    :back="{ name: 'welcome' }"
  >
    <template slot="section">
      <section class="section trade-widget-section">
        <iframe
          class="trade-widget-frame"
          src="https://stealthex.io/widget/1c5c64de-0ac0-4b79-a393-e447de460c42"
          title="Trade XVG"
        />
      </section>
    </template>
  </content-view>
</template>

<script>
import ContentView from '@/components/layout/ContentView'

export default {
  name: 'TradeView',
  components: { ContentView }
}
</script>

<style scoped>
.trade-widget-section {
  padding: 0;
  overflow: hidden;
}

.trade-widget-frame {
  width: 100%;
  min-height: 620px;
  border: 0;
}
</style>
