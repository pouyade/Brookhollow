<script setup lang="ts">
import { computed } from 'vue';
import { ITEMS } from '../../data/items';
import { iconUrl } from '../../game/rendering/generate';
import { itemName } from '../../i18n/data';

const props = withDefaults(defineProps<{ id: string; size?: number }>(), { size: 32 });
const src = computed(() => iconUrl(ITEMS[props.id]?.icon ?? '', 3));
</script>

<template>
  <img :src="src" :width="size" :height="size" class="pixel pointer-events-none" :alt="itemName(id)" />
</template>
