<script setup lang="ts">
import { computed } from 'vue';
import { hearts } from '../../data/npcs';

const props = defineProps<{ friendship: number }>();
const n = computed(() => hearts(props.friendship));
</script>

<template>
  <div class="flex gap-px text-sm leading-none" dir="ltr" :aria-label="`${n}/10 ♥`">
    <span v-for="i in 10" :key="i" :class="i <= n ? 'text-rose-600' : 'text-ink/25'">♥</span>
  </div>
</template>
