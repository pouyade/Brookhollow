<script setup lang="ts">
import { computed, ref } from 'vue';
import { DAYS_PER_YEAR } from '../../data/crops';
import { NPCS } from '../../data/npcs';
import { giftReaction } from '../../game/sim/social';
import { TIME, dayIndex } from '../../game/sim/time';
import { t } from '../../i18n';
import { itemName, npcText, shortDate } from '../../i18n/data';
import { SEASONS } from '../../data/crops';
import { useGame } from '../../stores/ui';
import Hearts from '../common/Hearts.vue';
import ModalFrame from '../common/ModalFrame.vue';
import Portrait from '../common/Portrait.vue';

const tab = ref<'people' | 'farm'>('people');
const s = useGame((g) => ({
  npcs: Object.values(NPCS).map((n) => ({ def: n, st: g.npcs[n.id] })),
  stats: g.stats,
  materials: g.materials,
  daysLeft: (TIME.evaluationYear - 1) * DAYS_PER_YEAR - dayIndex(g),
}));
const shippedTotal = computed(() => Object.values(s.value.stats.shipped).reduce((a, b) => a + b, 0));
const birthday = (id: string) => {
  const b = NPCS[id].birthday;
  return shortDate(SEASONS.indexOf(b.season), b.day);
};
</script>

<template>
  <ModalFrame :title="t('journal.title')" :close-keys="['Escape', 'KeyJ']">
    <div class="mb-3 flex gap-2">
      <button class="btn" :class="{ active: tab === 'people' }" @click="tab = 'people'">{{ t('journal.people') }}</button>
      <button class="btn" :class="{ active: tab === 'farm' }" @click="tab = 'farm'">{{ t('journal.farm') }}</button>
    </div>

    <ul v-if="tab === 'people'" class="grid gap-2 sm:grid-cols-2">
      <li v-for="{ def, st } in s.npcs" :key="def.id" class="flex gap-3 rounded border-2 border-wood/30 p-2">
        <Portrait :frame="def.frame" :scale="3" :class="{ 'opacity-30 grayscale': !st?.met }" />
        <div class="min-w-0 flex-1">
          <template v-if="st?.met">
            <div class="font-semibold">{{ npcText(def.id, 'name') }} <span class="text-sm font-normal opacity-70">· {{ npcText(def.id, 'role') }}</span></div>
            <Hearts :friendship="st.friendship" />
            <div class="text-sm">{{ t('journal.birthday', { date: birthday(def.id) }) }}</div>
            <div v-if="st.knownGifts.length" class="text-sm opacity-80">
              <span v-for="id in st.knownGifts" :key="id" class="me-2 inline-block">{{ itemName(id) }}: {{ t(`reaction.${giftReaction(def.id, id)}`) }}</span>
            </div>
            <div v-else class="text-sm opacity-60">{{ t('journal.giftsUnknown') }}</div>
          </template>
          <template v-else>
            <div class="font-semibold">???</div>
            <div class="text-sm opacity-60">{{ t('journal.notMet') }}</div>
          </template>
        </div>
      </li>
    </ul>

    <div v-else class="space-y-2">
      <div class="rounded border-2 border-wood/30 p-2">
        <div class="font-semibold">{{ t('journal.evaluation') }}</div>
        <p v-if="s.daysLeft > 0">{{ t('journal.daysLeft', { days: s.daysLeft, year: TIME.evaluationYear }) }}</p>
        <p v-else>{{ t('journal.due') }}</p>
      </div>
      <table class="w-full">
        <tbody>
          <tr><td>{{ t('journal.days') }}</td><td class="text-end tabular-nums">{{ s.stats.daysPlayed }}</td></tr>
          <tr><td>{{ t('journal.earned') }}</td><td class="text-end tabular-nums">{{ t('common.gold', { n: s.stats.goldEarned.toLocaleString('en-US') }) }}</td></tr>
          <tr><td>{{ t('journal.shipped') }}</td><td class="text-end tabular-nums">{{ shippedTotal }}</td></tr>
          <tr><td>{{ t('journal.planted') }}</td><td class="text-end tabular-nums">{{ s.stats.planted }}</td></tr>
          <tr><td>{{ t('journal.cleared') }}</td><td class="text-end tabular-nums">{{ s.stats.debrisCleared }}</td></tr>
          <tr><td>{{ t('journal.materials') }}</td><td class="text-end tabular-nums">{{ s.materials.lumber }} / {{ s.materials.stone }}</td></tr>
        </tbody>
      </table>
      <div v-if="Object.keys(s.stats.harvested).length">
        <div class="font-semibold">{{ t('journal.harvested') }}</div>
        <span v-for="(n, id) in s.stats.harvested" :key="id" class="me-3 inline-block">{{ itemName(String(id)) }} ×{{ n }}</span>
      </div>
    </div>
  </ModalFrame>
</template>
