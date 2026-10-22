<script setup lang="ts">
import { weekday } from '../../game/sim/time';
import { t } from '../../i18n';
import { fullDate, itemName, noteText, weatherName } from '../../i18n/data';
import { useGame } from '../../stores/ui';
import ItemIcon from '../common/ItemIcon.vue';
import ModalFrame from '../common/ModalFrame.vue';

const s = useGame((g) => ({ report: g.morningReport, date: fullDate(g, weekday(g)), weather: weatherName(g.weather), gold: g.gold }));
</script>

<template>
  <ModalFrame :title="t('morning.title', { date: s.date })" :close-keys="['Escape', 'KeyE', 'Enter', 'Space']" width="min(520px, calc(100vw - 32px))">
    <div v-if="s.report" class="space-y-3">
      <div v-if="s.report.shipped.length">
        <h3 class="mb-1 font-semibold">{{ t('morning.receipt') }}</h3>
        <ul class="divide-y divide-wood/20">
          <li v-for="l in s.report.shipped" :key="l.id" class="flex items-center gap-2 py-1">
            <ItemIcon :id="l.id" :size="24" />
            <span class="flex-1">{{ itemName(l.id) }} × {{ l.qty }}</span>
            <span class="tabular-nums">{{ t('common.gold', { n: l.gold }) }}</span>
          </li>
        </ul>
        <div class="mt-1 flex justify-between border-t-2 border-wood/40 pt-1 text-lg font-semibold">
          <span>{{ t('morning.total') }}</span><span class="tabular-nums">+{{ t('common.gold', { n: s.report.total }) }}</span>
        </div>
      </div>
      <p v-else class="opacity-70">{{ t('morning.nothing') }}</p>
      <ul v-if="s.report.notes.length" class="list-disc space-y-1 ps-5">
        <li v-for="(n, i) in s.report.notes" :key="i">{{ noteText(n) }}</li>
      </ul>
      <p class="text-sm opacity-70">{{ t('morning.footer', { weather: s.weather, gold: s.gold.toLocaleString('en-US') }) }}</p>
    </div>
    <div class="mt-3 text-end text-sm opacity-60">{{ t('morning.start') }}</div>
  </ModalFrame>
</template>
