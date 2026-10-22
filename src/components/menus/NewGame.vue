<script setup lang="ts">
import { reactive } from 'vue';
import { SEASONS } from '../../data/crops';
import { t } from '../../i18n';
import { seasonName } from '../../i18n/data';
import LanguageSwitcher from '../common/LanguageSwitcher.vue';
import type { Season } from '../../data/crops';
import { CH } from '../../game/rendering/kenney';
import { startNewGame } from '../../app/flow';
import { ui } from '../../stores/ui';
import Portrait from '../common/Portrait.vue';

const form = reactive({ name: '', farmName: '', dogName: '', season: 'spring' as Season, day: 1 });
const valid = () => form.name.trim() && form.farmName.trim() && form.dogName.trim() && form.day >= 1 && form.day <= 30;

function start() {
  if (!valid()) return;
  startNewGame(ui.pendingSlot, {
    name: form.name.trim().slice(0, 16),
    farmName: form.farmName.trim().slice(0, 16),
    dogName: form.dogName.trim().slice(0, 16),
    birthday: { season: form.season, day: form.day },
  });
}
</script>

<template>
  <div class="flex h-full items-center justify-center bg-[#2c3a28] p-4">
    <form class="panel w-[min(480px,100%)] space-y-3 p-6" @submit.prevent="start">
      <div class="flex items-center gap-3">
        <Portrait :frame="CH.player" :scale="4" />
        <div>
          <h1 class="text-2xl font-semibold text-wood">{{ t('new.heading') }}</h1>
          <p class="text-sm opacity-70">{{ t('slot.label', { n: ui.pendingSlot }) }}</p>
        </div>
      </div>
      <label class="block">
        <span class="text-sm font-semibold">{{ t('new.name') }}</span>
        <input v-model="form.name" maxlength="16" required autofocus class="mt-1 w-full rounded border-2 border-wood bg-white/70 px-2 py-1" />
      </label>
      <label class="block">
        <span class="text-sm font-semibold">{{ t('new.farm') }}</span>
        <input v-model="form.farmName" maxlength="16" required class="mt-1 w-full rounded border-2 border-wood bg-white/70 px-2 py-1" />
      </label>
      <label class="block">
        <span class="text-sm font-semibold">{{ t('new.dog') }}</span>
        <input v-model="form.dogName" maxlength="16" required class="mt-1 w-full rounded border-2 border-wood bg-white/70 px-2 py-1" />
      </label>
      <fieldset>
        <legend class="text-sm font-semibold">{{ t('new.birthday') }}</legend>
        <div class="mt-1 flex gap-2">
          <select v-model="form.season" class="flex-1 rounded border-2 border-wood bg-white/70 px-2 py-1">
            <option v-for="s in SEASONS" :key="s" :value="s">{{ seasonName(s) }}</option>
          </select>
          <input v-model.number="form.day" type="number" min="1" max="30" class="w-20 rounded border-2 border-wood bg-white/70 px-2 py-1" />
        </div>
      </fieldset>
      <LanguageSwitcher />
      <div class="flex justify-between pt-2">
        <button type="button" class="btn btn-ghost" @click="ui.screen = 'title'">{{ t('common.back') }}</button>
        <button type="submit" class="btn px-5 text-lg" :disabled="!valid()">{{ t('new.begin') }}</button>
      </div>
    </form>
  </div>
</template>
