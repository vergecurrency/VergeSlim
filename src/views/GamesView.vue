<template>
  <content-view :title="$i18n.t('games.games')">
    <template slot="section">
      <section class="section games-section">
        <div class="games-intro-panel">
          <p class="games-intro-copy">{{ $i18n.t('games.subtitle') }}</p>
        </div>
        <tetris-arena/>
      </section>
    </template>
  </content-view>
</template>

<script>
import ContentView from '@/components/layout/ContentView'
import TetrisArena from '@/components/games/TetrisArena.vue'

export default {
  name: 'GamesView',
  components: { ContentView, TetrisArena }
}
</script>

<style scoped lang="scss">
.games-section {
  padding: 0;
}

.games-intro-panel {
  margin-bottom: 1.25rem;
  padding: 1rem 1.15rem;
  border-radius: 18px;
  border: 1px solid rgba(83, 243, 255, 0.16);
  background:
    linear-gradient(140deg, rgba(255, 87, 210, 0.14), transparent 48%),
    linear-gradient(180deg, rgba(9, 14, 32, 0.94), rgba(7, 10, 24, 0.9));
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04), 0 18px 36px rgba(1, 4, 18, 0.18);
}

.games-intro-copy {
  margin: 0;
  color: var(--rv-text-soft);
  font-size: 0.96rem;
  line-height: 1.7;
}
</style>
