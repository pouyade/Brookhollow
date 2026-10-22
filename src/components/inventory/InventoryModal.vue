<script setup lang="ts">
import { computed, ref } from 'vue';
import { CROPS, daysToMature } from '../../data/crops';
import { ITEMS } from '../../data/items';
import * as actions from '../../game/sim/actions';
import { HOTBAR_SIZE } from '../../game/sim/state';
import { t } from '../../i18n';
import { itemDesc, itemName, toolName } from '../../i18n/data';
import { isToolId } from '../../game/sim/tools';
import { useGame } from '../../stores/ui';
import ItemIcon from '../common/ItemIcon.vue';
import ModalFrame from '../common/ModalFrame.vue';

const s = useGame((g) => ({
  inv: g.inventory.map((x) => (x ? { ...x } : null)),
  selected: g.selected,
  tools: { ...g.tools },
  stamina: g.stamina,
  maxStamina: g.maxStamina,
  materials: { ...g.materials },
}));
const focus = ref<number>(s.value.selected);
const dragFrom = ref<number | null>(null);

const item = computed(() => {
  const slot = s.value.inv[focus.value];
  return slot ? { slot, def: ITEMS[slot.id] } : null;
});
const title = computed(() => {
  const it = item.value;
  if (!it) return '';
  return isToolId(it.def.id) ? toolName(it.def.id, s.value.tools[it.def.id]) : itemName(it.def.id);
});

function drop(to: number) {
  if (dragFrom.value !== null && dragFrom.value !== to) {
    actions.swapInventory(dragFrom.value, to);
    focus.value = to;
  }
  dragFrom.value = null;
}
</script>

<template>
  <ModalFrame :title="t('bag.title')" :close-keys="['Escape', 'KeyI', 'Tab']">
    <div class="flex flex-col gap-4 sm:flex-row">
      <div>
        <div class="mb-1 text-xs opacity-60">{{ t('bag.hotbar') }}</div>
        <div class="grid grid-cols-6 gap-1 sm:grid-cols-8" dir="ltr">
          <button
            v-for="(slot, i) in s.inv"
            :key="i"
            class="slot"
            :class="{ selected: i === focus, 'bg-[#d8bf82]': i < HOTBAR_SIZE }"
            :draggable="!!slot"
            :aria-label="slot ? itemName(slot.id) : t('hud.emptySlot')"
            @click="focus = i"
            @dblclick="i < HOTBAR_SIZE && actions.select(i)"
            @dragstart="dragFrom = i"
            @dragover.prevent
            @drop.prevent="drop(i)"
          >
            <ItemIcon v-if="slot" :id="slot.id" />
            <span v-if="slot && slot.qty > 1" class="absolute bottom-0 right-0.5 text-xs font-semibold text-white [text-shadow:1px_1px_0_#000]">{{ slot.qty }}</span>
            <span v-if="i === s.selected" class="absolute left-0.5 top-0 text-[10px] text-wood">●</span>
          </button>
        </div>
        <div class="mt-3 text-sm">
          {{ t('bag.summary', { stamina: s.stamina, max: s.maxStamina, lumber: s.materials.lumber, stone: s.materials.stone }) }}
        </div>
      </div>
      <div class="min-w-0 flex-1 rounded border-2 border-wood/30 bg-parch-2/50 p-3">
        <template v-if="item">
          <div class="flex items-center gap-2">
            <ItemIcon :id="item.def.id" :size="48" />
            <div>
              <div class="text-lg font-semibold">{{ title }}</div>
              <div class="text-sm opacity-70">{{ t(`kind.${item.def.kind}`) }}<template v-if="item.slot.qty > 1"> · ×{{ item.slot.qty }}</template></div>
            </div>
          </div>
          <p v-if="itemDesc(item.def.id)" class="mt-2">{{ itemDesc(item.def.id) }}</p>
          <p v-if="item.def.kind === 'seed' && item.def.cropId" class="mt-1 text-sm opacity-80">
            {{ t('bag.matures', { days: daysToMature(CROPS[item.def.cropId]) }) }}<template v-if="CROPS[item.def.cropId].regrow">{{ t('bag.regrows', { days: CROPS[item.def.cropId].regrow! }) }}</template>.
            {{ t('bag.sellsFor', { price: CROPS[item.def.cropId].sellPrice }) }}
          </p>
          <p v-if="item.def.sellPrice" class="mt-1 text-sm">{{ t('bag.shipsFor', { price: item.def.sellPrice }) }}</p>
          <div class="mt-3 flex flex-wrap gap-2">
            <button v-if="focus < HOTBAR_SIZE && focus !== s.selected" class="btn" @click="actions.select(focus)">{{ t('bag.hold') }}</button>
            <button v-if="item.def.energy" class="btn" :disabled="s.stamina >= s.maxStamina" @click="actions.eat(focus)">
              {{ t('bag.eat', { n: item.def.energy }) }}
            </button>
          </div>
        </template>
        <p v-else class="opacity-60">{{ t('bag.empty') }}</p>
      </div>
    </div>
  </ModalFrame>
</template>
