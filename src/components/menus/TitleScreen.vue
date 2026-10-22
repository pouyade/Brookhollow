<script setup lang="ts">
import { ref } from 'vue';
import { lastSlot, slotSummary } from '../../game/save/save';
import { continueGame } from '../../app/flow';
import { ui } from '../../stores/ui';
import SlotList from './SlotList.vue';
import LanguageSwitcher from '../common/LanguageSwitcher.vue';
import { t } from '../../i18n';
import { shortDate } from '../../i18n/data';

const last = lastSlot();
const lastInfo = last ? slotSummary(last) : null;
const view = ref<'main' | 'load' | 'new'>('main');
function pickNew(slot: number) {
  ui.pendingSlot = slot;
  ui.screen = 'newgame';
}
</script>

<template>
  <div class="relative flex h-full items-center justify-center overflow-hidden bg-gradient-to-b from-[#7ec4e8] via-[#b9e2a0] to-[#5f9e46] p-4">
    <div class="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[repeating-linear-gradient(90deg,#4f8a3a_0_24px,#5c9a45_24px_48px)] opacity-70" />
    <div class="panel relative w-[min(460px,100%)] p-6 text-center">
      <h1 class="text-4xl font-semibold tracking-wide text-wood sm:text-5xl">{{ t('app.title') }}</h1>
      <p class="mb-5 text-lg opacity-80">{{ t('app.subtitle') }}</p>

      <div v-if="view === 'main'" class="flex flex-col gap-2">
        <button v-if="last" class="btn py-2 text-lg" @click="continueGame(last)">
          {{ t('title.continue') }}
          <span class="block text-sm opacity-80">{{ lastInfo?.name }} · {{ lastInfo?.seasonIndex !== undefined ? shortDate(lastInfo.seasonIndex, lastInfo.day ?? 1) : lastInfo?.date }}</span>
        </button>
        <button class="btn py-2 text-lg" @click="view = 'new'">{{ t('title.new') }}</button>
        <button class="btn py-2 text-lg" @click="view = 'load'">{{ t('title.load') }}</button>
      </div>
      <div v-else class="text-start">
        <h2 class="mb-2 text-lg font-semibold">{{ view === 'new' ? t('title.chooseSlot') : t('title.loadFarm') }}</h2>
        <SlotList :mode="view === 'new' ? 'new' : 'load'" @pick="(s) => (view === 'new' ? pickNew(s) : continueGame(s))" />
        <button class="btn btn-ghost mt-3" @click="view = 'main'">{{ t('common.back') }}</button>
      </div>
      <div class="mt-5 flex justify-center"><LanguageSwitcher /></div>
      <p class="mt-4 text-xs opacity-60">{{ t('app.credits') }}</p>
    </div>
  </div>
</template>
