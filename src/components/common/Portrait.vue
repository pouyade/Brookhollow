<script setup lang="ts">
import { computed } from 'vue';
import { CHARS_COLS, CHARS_ROWS } from '../../game/rendering/kenney';

/** a character-sheet frame drawn as a CSS sprite */
const props = withDefaults(defineProps<{ frame: number; scale?: number }>(), { scale: 4 });
const url = `${import.meta.env.BASE_URL}assets/kenney/roguelikeChar_transparent.png`;
const style = computed(() => {
  const s = props.scale;
  const col = props.frame % CHARS_COLS, row = Math.floor(props.frame / CHARS_COLS);
  return {
    width: `${16 * s}px`,
    height: `${16 * s}px`,
    backgroundImage: `url(${url})`,
    backgroundSize: `${(CHARS_COLS * 17 - 1) * s}px ${(CHARS_ROWS * 17 - 1) * s}px`,
    backgroundPosition: `-${col * 17 * s}px -${row * 17 * s}px`,
  };
});
</script>

<template>
  <div class="pixel shrink-0" :style="style" />
</template>
