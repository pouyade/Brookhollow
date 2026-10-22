<script setup lang="ts">
import { computed } from 'vue';
import { G } from '../../game/sim/state';
import { t } from '../../i18n';
import { letterText } from '../../i18n/data';
import ModalFrame from '../common/ModalFrame.vue';

const props = defineProps<{ id: string }>();
const letter = computed(() => letterText(props.id, G.player));
</script>

<template>
  <ModalFrame :title="letter.subject" :close-keys="['Escape', 'KeyE', 'Enter']" width="min(560px, calc(100vw - 32px))">
    <div class="space-y-3 text-lg leading-snug">
      <p v-for="(p, i) in letter.body" :key="i">{{ p }}</p>
    </div>
    <div class="mt-4 text-end text-sm opacity-60">{{ t('letter.from', { from: letter.from }) }}</div>
  </ModalFrame>
</template>
