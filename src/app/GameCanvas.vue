<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import type Phaser from 'phaser';
import { createGame } from '../game/engine/game';

const el = ref<HTMLDivElement>();
let game: Phaser.Game | null = null;
// keep the canvas exactly the size of its container (window resizes, mobile toolbars...)
const observer = new ResizeObserver(([entry]) => {
  const { width, height } = entry.contentRect;
  if (game && width > 0 && height > 0) game.scale.resize(Math.floor(width), Math.floor(height));
});

onMounted(() => {
  game = createGame(el.value!);
  observer.observe(el.value!);
});
onBeforeUnmount(() => {
  observer.disconnect();
  game?.destroy(true);
  game = null;
});
</script>

<template>
  <div ref="el" class="absolute inset-0 overflow-hidden" />
</template>
