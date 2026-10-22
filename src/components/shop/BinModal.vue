<script setup lang="ts">
import { ITEMS } from '../../data/items';
import { t } from '../../i18n';
import { itemName } from '../../i18n/data';
import * as actions from '../../game/sim/actions';
import { binValue, canShip } from '../../game/sim/economy';
import { useGame } from '../../stores/ui';
import ItemIcon from '../common/ItemIcon.vue';
import ModalFrame from '../common/ModalFrame.vue';

const s = useGame((g) => ({
  sellable: g.inventory.map((x, i) => ({ slot: i, item: x ? { ...x } : null })).filter((x) => x.item && canShip(x.item.id)),
  bin: g.bin.map((b) => ({ ...b })),
  value: binValue(),
}));
</script>

<template>
  <ModalFrame :title="t('bin.title')">
    <p class="mb-3 text-sm opacity-75">{{ t('bin.explain') }}</p>
    <div class="grid gap-4 sm:grid-cols-2">
      <section>
        <h3 class="mb-1 font-semibold">{{ t('bin.yourBag') }}</h3>
        <p v-if="!s.sellable.length" class="opacity-60">{{ t('bin.nothing') }}</p>
        <ul class="divide-y divide-wood/20">
          <li v-for="x in s.sellable" :key="x.slot" class="flex items-center gap-2 py-1">
            <ItemIcon :id="x.item!.id" :size="28" />
            <span class="flex-1">{{ itemName(x.item!.id) }} ×{{ x.item!.qty }}</span>
            <span class="text-sm opacity-70">{{ t('common.gold', { n: ITEMS[x.item!.id].sellPrice }) }}</span>
            <button class="btn px-2 text-sm" @click="actions.ship(x.slot, 1)">1</button>
            <button class="btn px-2 text-sm" @click="actions.ship(x.slot, x.item!.qty)">{{ t('bin.all') }}</button>
          </li>
        </ul>
      </section>
      <section>
        <h3 class="mb-1 font-semibold">{{ t('bin.inBin') }}</h3>
        <p v-if="!s.bin.length" class="opacity-60">{{ t('bin.empty') }}</p>
        <ul class="divide-y divide-wood/20">
          <li v-for="(b, i) in s.bin" :key="b.id" class="flex items-center gap-2 py-1">
            <ItemIcon :id="b.id" :size="28" />
            <span class="flex-1">{{ itemName(b.id) }} ×{{ b.qty }}</span>
            <span class="text-sm tabular-nums">{{ t('common.gold', { n: ITEMS[b.id].sellPrice * b.qty }) }}</span>
            <button class="btn btn-ghost px-2 text-sm" :title="t('bin.takeBack')" @click="actions.unship(i)">↩</button>
          </li>
        </ul>
        <div class="mt-2 border-t-2 border-wood/40 pt-1 text-end text-lg font-semibold">{{ t('bin.expected', { n: s.value }) }}</div>
      </section>
    </div>
  </ModalFrame>
</template>
