<script setup lang="ts">
import { computed } from 'vue';
import { CAN_CAPACITY } from '../../game/sim/state';
import { weekday } from '../../game/sim/time';
import { getMap } from '../../game/world/maps';
import { t } from '../../i18n';
import { mapName, seasonName, timeText, weatherName, weekdayName } from '../../i18n/data';
import { ui, useGame } from '../../stores/ui';

const WEATHER_ICON = { sun: '☀️', cloudy: '☁️', rain: '🌧️', storm: '⛈️', snow: '❄️' } as const;
const SEASON_COLOR = ['#e88fb0', '#4caf50', '#d9822b', '#7fb0dd'];

const s = useGame((g) => ({
  season: seasonName(g.seasonIndex),
  seasonIndex: g.seasonIndex,
  day: g.day,
  weekday: weekdayName(weekday(g)),
  year: g.year,
  time: timeText(g.timeMin),
  weather: g.weather,
  gold: g.gold,
  stamina: g.stamina,
  maxStamina: g.maxStamina,
  can: g.canWater,
  canMax: CAN_CAPACITY[g.tools.can],
  canSelected: g.inventory[g.selected]?.id === 'can',
  lumber: g.materials.lumber,
  stone: g.materials.stone,
  place: mapName(g.pos.map, getMap(g.pos.map).name),
  indoor: getMap(g.pos.map).indoor,
}));

const staminaPct = computed(() => Math.round((s.value.stamina / s.value.maxStamina) * 100));
const staminaColor = computed(() => (staminaPct.value > 30 ? '#4f8a3a' : staminaPct.value > 10 ? '#e2a23c' : '#c0392b'));
const face = computed(() => (staminaPct.value > 60 ? '😊' : staminaPct.value > 30 ? '😐' : staminaPct.value > 10 ? '😓' : '😵'));
</script>

<template>
  <div class="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-2 p-2 sm:p-3">
    <div class="panel flex items-center gap-3 px-3 py-2">
      <div class="text-3xl leading-none" :title="weatherName(s.weather)">{{ WEATHER_ICON[s.weather] }}</div>
      <div class="leading-tight">
        <div class="text-lg font-semibold">
          <span :style="{ color: SEASON_COLOR[s.seasonIndex] }">{{ t('common.date', { season: s.season, day: s.day }) }}</span>
          <span class="text-sm opacity-70"> {{ s.weekday }} · {{ t('common.year', { n: s.year }) }}</span>
        </div>
        <div class="text-base tabular-nums">
          {{ s.time }}
          <span v-if="s.indoor" class="text-xs opacity-60">{{ t('hud.clockPaused') }}</span>
        </div>
      </div>
    </div>

    <div class="panel hidden px-3 py-1 text-sm opacity-90 md:block">{{ s.place }}</div>

    <div class="flex flex-col items-end gap-2">
      <div class="panel px-3 py-1 text-lg font-semibold tabular-nums">
        <span class="text-gold">●</span> {{ t('common.gold', { n: s.gold.toLocaleString('en-US') }) }}
      </div>
      <div class="panel flex items-center gap-2 px-2 py-1" :title="`${t('hud.stamina')} ${s.stamina}/${s.maxStamina}`">
        <span class="text-lg leading-none">{{ face }}</span>
        <div class="h-3 w-28 overflow-hidden rounded-sm border-2 border-wood bg-wood/20" role="meter" :aria-valuenow="s.stamina" :aria-valuemax="s.maxStamina" :aria-label="t('hud.stamina')">
          <div class="h-full transition-all" :style="{ width: staminaPct + '%', background: staminaColor }" />
        </div>
      </div>
      <div v-if="s.canSelected" class="panel px-2 py-1 text-sm tabular-nums">💧 {{ s.can }}/{{ s.canMax }}</div>
      <div v-if="s.lumber || s.stone" class="panel px-2 py-1 text-xs">🪵 {{ s.lumber }} · 🪨 {{ s.stone }}</div>
    </div>
  </div>
  <div v-if="ui.hint" class="pointer-events-none absolute inset-x-0 bottom-[112px] z-10 flex justify-center">
    <div class="rounded bg-black/55 px-3 py-1 text-sm text-white">{{ ui.hint }}</div>
  </div>
</template>
