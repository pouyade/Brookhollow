<script setup lang="ts">
import { ref } from 'vue';
import { SLOTS, slotSummary } from '../../game/save/save';
import type { SaveSummary } from '../../game/save/save';
import { locale, t } from '../../i18n';
import { shortDate } from '../../i18n/data';

/** shared save-slot picker; `mode` decides whether empty or filled slots are selectable */
const props = defineProps<{ mode: 'load' | 'save' | 'new' }>();
const emit = defineEmits<{ pick: [slot: number] }>();
const rev = ref(0);
const slots = () => {
  void rev.value;
  return Array.from({ length: SLOTS }, (_, i) => ({ slot: i + 1, summary: slotSummary(i + 1) }));
};
const confirming = ref<number | null>(null);

function dateOf(s: SaveSummary) {
  if (s.seasonIndex === undefined || s.day === undefined) return s.date;
  return `${shortDate(s.seasonIndex, s.day)} · ${t('common.year', { n: s.year ?? 1 })}`;
}
const when = (ms: number) => new Date(ms).toLocaleString(locale.value === 'fa' ? 'fa-IR' : 'en-US');

function choose(slot: number, filled: boolean) {
  if (props.mode !== 'load' && filled && confirming.value !== slot) {
    confirming.value = slot;
    return;
  }
  confirming.value = null;
  emit('pick', slot);
  rev.value++;
}
</script>

<template>
  <ul class="flex flex-col gap-2">
    <li v-for="s in slots()" :key="s.slot">
      <button
        class="btn btn-ghost flex w-full items-center justify-between gap-3 border-2 border-wood/40 text-start"
        :disabled="mode === 'load' && !s.summary"
        @click="choose(s.slot, !!s.summary)"
      >
        <span>
          <span class="font-semibold">{{ t('slot.label', { n: s.slot }) }}</span>
          <template v-if="s.summary">
            — {{ s.summary.savedAt ? t('slot.of', { name: s.summary.name, farm: s.summary.farmName }) : t('slot.damaged') }}
            <span v-if="s.summary.savedAt" class="block text-sm opacity-70">{{ dateOf(s.summary) }} · {{ t('common.gold', { n: s.summary.gold.toLocaleString('en-US') }) }} · {{ t('slot.saved', { when: when(s.summary.savedAt) }) }}</span>
          </template>
          <span v-else class="opacity-60"> — {{ t('slot.empty') }}</span>
        </span>
        <span v-if="confirming === s.slot" class="shrink-0 rounded bg-rose-700 px-2 text-sm text-white">{{ t('slot.overwrite') }}</span>
      </button>
    </li>
  </ul>
</template>
