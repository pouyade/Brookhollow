<script setup lang="ts">
import { ui } from '../../stores/ui';
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 top-24 z-20 flex flex-col items-center gap-1 px-4">
    <TransitionGroup name="fade">
      <div v-for="t in ui.toasts" :key="t.id" class="panel max-w-md px-3 py-1 text-center text-sm">{{ t.text }}</div>
    </TransitionGroup>
  </div>
</template>
