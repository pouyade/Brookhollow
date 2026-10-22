<script setup lang="ts">
import { onBeforeUnmount, onMounted } from 'vue';
import { closeModal, inputLocked } from '../../stores/ui';
import { t } from '../../i18n';

/** shared modal chrome: dimmed backdrop, parchment panel, Esc to close */
const props = withDefaults(defineProps<{ title: string; width?: string; closeKeys?: string[] }>(), {
  width: 'min(720px, calc(100vw - 32px))',
  closeKeys: () => ['Escape'],
});
const emit = defineEmits<{ close: [] }>();

function close() {
  emit('close');
  closeModal();
}
function onKey(e: KeyboardEvent) {
  if (inputLocked()) return;
  if (props.closeKeys.includes(e.code)) {
    e.preventDefault();
    close();
  }
}
onMounted(() => window.addEventListener('keydown', onKey));
onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
</script>

<template>
  <div class="absolute inset-0 z-30 flex items-center justify-center bg-black/45" @mousedown.self="close">
    <div class="panel flex max-h-[calc(100vh-32px)] flex-col" :style="{ width }">
      <div class="flex items-center justify-between border-b-2 border-wood/30 px-4 py-2">
        <h2 class="text-xl font-semibold">{{ title }}</h2>
        <button class="btn btn-ghost px-2 text-lg leading-none" :aria-label="t('common.close')" @click="close">✕</button>
      </div>
      <div class="overflow-y-auto p-4">
        <slot />
      </div>
    </div>
  </div>
</template>
