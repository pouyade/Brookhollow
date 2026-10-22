<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { CH } from '../../game/rendering/kenney';
import { G } from '../../game/sim/state';
import { enterWorld } from '../../app/flow';
import Portrait from '../common/Portrait.vue';
import { format, t } from '../../i18n';
import { introPages } from '../../i18n/data';

const p = G.player;
/** which intro pages show the mayor's portrait */
const SPEAKER: Record<number, number> = { 2: CH.hollis, 4: CH.hollis };
const pages = computed(() =>
  introPages().map((text, i) => ({ text: format(text, { name: p.name, farm: p.farmName }), who: SPEAKER[i] })),
);
const i = ref(0);
const page = computed(() => pages.value[i.value]);

function next() {
  if (i.value < pages.value.length - 1) i.value++;
  else enterWorld();
}
function onKey(e: KeyboardEvent) {
  if (['KeyE', 'Enter', 'Space'].includes(e.code)) {
    e.preventDefault();
    next();
  } else if (e.code === 'Escape') enterWorld();
}
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div class="flex h-full cursor-pointer flex-col items-center justify-center gap-6 bg-gradient-to-b from-[#1d2440] to-[#3d2f2a] p-6 text-[#f6e7c1]" @click="next">
    <Transition name="fade" mode="out-in">
      <div :key="i" class="flex max-w-2xl flex-col items-center gap-4 text-center">
        <Portrait v-if="page.who !== undefined" :frame="page.who" :scale="6" />
        <p class="text-2xl leading-relaxed">{{ page.text }}</p>
      </div>
    </Transition>
    <p class="text-sm opacity-60">{{ t('intro.continue') }}</p>
  </div>
</template>
