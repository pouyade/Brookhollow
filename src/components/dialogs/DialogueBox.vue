<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { playSfx } from '../../game/audio/sfx';
import { closeDialogue, inputLocked, ui } from '../../stores/ui';
import Portrait from '../common/Portrait.vue';
import { t } from '../../i18n';

const choiceIndex = ref(0);
const d = computed(() => ui.dialogue);
const atEnd = computed(() => !!d.value && d.value.index >= d.value.lines.length - 1);
const showChoices = computed(() => atEnd.value && !!d.value?.choices?.length);

watch(d, () => (choiceIndex.value = 0));

function advance() {
  const dl = d.value;
  if (!dl) return;
  if (showChoices.value) return pick(choiceIndex.value);
  if (!atEnd.value) {
    dl.index++;
    playSfx('menu');
  } else closeDialogue();
}

function pick(i: number) {
  const c = d.value?.choices?.[i];
  if (!c) return;
  playSfx('menu');
  closeDialogue();
  c.run();
}

function onKey(e: KeyboardEvent) {
  if (!d.value || ui.modal || inputLocked() || e.repeat) return;
  const n = d.value.choices?.length ?? 0;
  if (['KeyE', 'Enter', 'Space'].includes(e.code)) {
    e.preventDefault();
    advance();
  } else if (showChoices.value && ['ArrowUp', 'KeyW'].includes(e.code)) {
    choiceIndex.value = (choiceIndex.value + n - 1) % n;
  } else if (showChoices.value && ['ArrowDown', 'KeyS'].includes(e.code)) {
    choiceIndex.value = (choiceIndex.value + 1) % n;
  } else if (showChoices.value && /^Digit[1-9]$/.test(e.code)) {
    pick(Number(e.code.slice(5)) - 1);
  } else if (e.code === 'Escape') {
    e.preventDefault();
    // escape picks the last choice (always the "cancel" option) or closes
    if (showChoices.value) pick(n - 1);
    else closeDialogue();
  }
}
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div v-if="d" class="absolute inset-x-0 bottom-24 z-20 flex justify-center px-3">
    <div class="panel flex w-[min(760px,100%)] gap-3 p-3" @click="!showChoices && advance()">
      <div v-if="d.portrait !== undefined" class="flex flex-col items-center">
        <div class="rounded border-2 border-wood bg-parch-2 p-1">
          <Portrait :frame="d.portrait" :scale="4" />
        </div>
      </div>
      <div class="min-h-[88px] flex-1">
        <div v-if="d.name" class="mb-1 text-lg font-semibold text-wood">{{ d.name }}</div>
        <p class="whitespace-pre-line text-lg leading-snug">{{ d.lines[d.index] }}</p>
        <div v-if="showChoices" class="mt-2 flex flex-col items-start gap-1">
          <button
            v-for="(c, i) in d.choices"
            :key="c.label"
            class="btn btn-ghost w-full text-start"
            :class="{ active: i === choiceIndex }"
            @click.stop="pick(i)"
            @mouseenter="choiceIndex = i"
          >
            <span class="me-1 opacity-50">{{ i + 1 }}.</span>{{ i === choiceIndex ? '▸ ' : '' }}{{ c.label }}
          </button>
        </div>
        <div v-else class="mt-1 text-end text-sm opacity-50">{{ atEnd ? t('dialogue.close') : t('dialogue.next') }}</div>
      </div>
    </div>
  </div>
</template>
