<script setup lang="ts">
import * as actions from '../../game/sim/actions';
import { HOTBAR_SIZE } from '../../game/sim/state';
import { isToolId } from '../../game/sim/tools';
import { t } from '../../i18n';
import { itemName, toolName } from '../../i18n/data';
import { openModal, useGame } from '../../stores/ui';
import ItemIcon from '../common/ItemIcon.vue';

const s = useGame((g) => ({
  slots: g.inventory.slice(0, HOTBAR_SIZE).map((x) => (x ? { ...x } : null)),
  selected: g.selected,
  name: (() => {
    const sel = g.inventory[g.selected];
    if (!sel) return '';
    return isToolId(sel.id) ? toolName(sel.id, g.tools[sel.id]) : itemName(sel.id);
  })(),
}));
</script>

<template>
  <div class="absolute inset-x-0 bottom-2 z-10 flex flex-col items-center gap-1">
    <div v-if="s.name" class="pointer-events-none rounded bg-black/50 px-2 text-sm text-white">{{ s.name }}</div>
    <div class="panel flex gap-1 p-1" dir="ltr">
      <button
        v-for="(slot, i) in s.slots"
        :key="i"
        class="slot"
        :class="{ selected: i === s.selected }"
        :aria-label="slot ? itemName(slot.id) : t('hud.emptySlot')"
        :title="slot ? itemName(slot.id) : ''"
        @click="actions.select(i)"
      >
        <ItemIcon v-if="slot" :id="slot.id" />
        <span v-if="slot && slot.qty > 1" class="absolute bottom-0 right-0.5 text-xs font-semibold text-white [text-shadow:1px_1px_0_#000]">{{ slot.qty }}</span>
        <span class="absolute left-0.5 top-0 text-[10px] opacity-50">{{ i + 1 }}</span>
      </button>
      <button class="slot text-xs" :aria-label="t('hud.openBag')" @click="openModal({ kind: 'inventory' })">{{ t('hud.bag') }}</button>
    </div>
  </div>
</template>
