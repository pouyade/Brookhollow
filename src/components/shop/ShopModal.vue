<script setup lang="ts">
import { reactive } from 'vue';
import { CROPS, daysToMature } from '../../data/crops';
import { t } from '../../i18n';
import { itemDesc, itemName, shopName } from '../../i18n/data';
import { ITEMS } from '../../data/items';
import { NPCS } from '../../data/npcs';
import { SHOPS } from '../../data/shops';
import * as actions from '../../game/sim/actions';
import { shopGoods } from '../../game/sim/economy';
import { spaceFor } from '../../game/sim/inventory';
import { useGame } from '../../stores/ui';
import ItemIcon from '../common/ItemIcon.vue';
import ModalFrame from '../common/ModalFrame.vue';
import Portrait from '../common/Portrait.vue';

const props = defineProps<{ shop: string }>();
const def = SHOPS[props.shop];
const keeper = NPCS[def.keeper];
const s = useGame((g) => ({ gold: g.gold, goods: shopGoods(props.shop), space: (id: string) => spaceFor(id) }));
const qty = reactive<Record<string, number>>({});

function info(id: string) {
  const it = ITEMS[id];
  if (it.cropId && it.kind === 'seed') {
    const c = CROPS[it.cropId];
    return t('shop.days', { days: daysToMature(c) }) + (c.regrow ? t('shop.regrows', { days: c.regrow }) : '') + t('shop.sells', { price: c.sellPrice });
  }
  return itemDesc(id) ?? '';
}
</script>

<template>
  <ModalFrame :title="shopName(def.id)">
    <div class="mb-3 flex items-center gap-3">
      <Portrait :frame="keeper.frame" :scale="3" />
      <p class="flex-1 italic">{{ t('shop.greeting') }}</p>
      <div class="text-lg font-semibold tabular-nums">{{ t('common.gold', { n: s.gold.toLocaleString('en-US') }) }}</div>
    </div>
    <ul class="divide-y divide-wood/20">
      <li v-for="g in s.goods" :key="g.item" class="flex flex-wrap items-center gap-2 py-2">
        <ItemIcon :id="g.item" />
        <div class="min-w-[10rem] flex-1">
          <div class="font-semibold">{{ itemName(g.item) }}</div>
          <div class="text-sm opacity-70">{{ info(g.item) }}</div>
        </div>
        <div class="w-20 text-end tabular-nums">{{ t('common.gold', { n: g.price }) }}</div>
        <div class="flex items-center gap-1" dir="ltr">
          <button class="btn px-2" :disabled="(qty[g.item] ?? 1) <= 1" :aria-label="t('shop.less')" @click="qty[g.item] = (qty[g.item] ?? 1) - 1">−</button>
          <span class="w-6 text-center tabular-nums">{{ qty[g.item] ?? 1 }}</span>
          <button class="btn px-2" :aria-label="t('shop.more')" @click="qty[g.item] = (qty[g.item] ?? 1) + 1">+</button>
        </div>
        <button
          class="btn"
          :disabled="s.gold < g.price * (qty[g.item] ?? 1) || s.space(g.item) < (qty[g.item] ?? 1)"
          @click="actions.buy(shop, g.item, qty[g.item] ?? 1)"
        >
          {{ t('shop.buy', { cost: g.price * (qty[g.item] ?? 1) }) }}
        </button>
      </li>
    </ul>
  </ModalFrame>
</template>
