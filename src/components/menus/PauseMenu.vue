<script setup lang="ts">
import { reactive, ref } from 'vue';
import { applyAudioSettings, playSfx } from '../../game/audio/sfx';
import { keyLabel, keymap } from '../../game/engine/input';
import type { InputAction } from '../../game/engine/input';
import { currentSlot, loadSettings, save, saveSettings } from '../../game/save/save';
import { toast } from '../../game/sim/events';
import { continueGame, quitToTitle } from '../../app/flow';
import { t } from '../../i18n';
import { closeModal, openModal } from '../../stores/ui';
import LanguageSwitcher from '../common/LanguageSwitcher.vue';
import ModalFrame from '../common/ModalFrame.vue';
import SlotList from './SlotList.vue';

const tab = ref<'menu' | 'save' | 'load' | 'settings' | 'controls'>('menu');
const settings = reactive(loadSettings());
const confirmQuit = ref(false);

function saveTo(slot: number) {
  const ok = save(slot);
  toast(ok ? t('msg.savedSlot', { n: slot }) : t('msg.saveFailed'));
  tab.value = 'menu';
}
function updateSettings() {
  saveSettings({ ...settings });
  applyAudioSettings();
  playSfx('menu');
}
const CONTROLS: [string, InputAction][] = [
  ['controls.use', 'use'], ['controls.interact', 'interact'], ['controls.cycle', 'cycle'],
  ['controls.inventory', 'inventory'], ['controls.journal', 'journal'], ['controls.pause', 'pause'],
];
</script>

<template>
  <ModalFrame :title="t('menu.title')" width="min(460px, calc(100vw - 32px))">
    <div v-if="tab === 'menu'" class="flex flex-col gap-2">
      <button class="btn py-2" @click="closeModal()">{{ t('menu.resume') }}</button>
      <button class="btn py-2" @click="tab = 'save'">{{ t('menu.save') }}</button>
      <button class="btn py-2" @click="tab = 'load'">{{ t('menu.load') }}</button>
      <button class="btn py-2" @click="openModal({ kind: 'journal' })">{{ t('menu.journal') }}</button>
      <button class="btn py-2" @click="tab = 'settings'">{{ t('menu.settings') }}</button>
      <button class="btn py-2" @click="tab = 'controls'">{{ t('menu.controls') }}</button>
      <a class="btn btn-ghost py-2 text-center" href="https://github.com/pouyade/Brookhollow" target="_blank" rel="noopener noreferrer">{{ t('menu.github') }}</a>
      <button v-if="!confirmQuit" class="btn btn-ghost py-2" @click="confirmQuit = true">{{ t('menu.quit') }}</button>
      <div v-else class="flex items-center justify-between gap-2 rounded bg-rose-100 p-2">
        <span class="text-sm">{{ t('menu.quitWarn') }}</span>
        <button class="btn" @click="quitToTitle()">{{ t('menu.quitConfirm') }}</button>
      </div>
      <div class="mt-2 flex justify-center border-t-2 border-wood/20 pt-3"><LanguageSwitcher /></div>
    </div>

    <div v-else-if="tab === 'save'">
      <p class="mb-2 text-sm opacity-75">{{ t('menu.autosave', { n: currentSlot }) }}</p>
      <SlotList mode="save" @pick="saveTo" />
    </div>
    <div v-else-if="tab === 'load'">
      <SlotList mode="load" @pick="continueGame" />
    </div>

    <div v-else-if="tab === 'settings'" class="space-y-3">
      <LanguageSwitcher />
      <label class="flex items-center gap-3">
        <span class="w-28">{{ t('settings.volume') }}</span>
        <input v-model.number="settings.volume" type="range" min="0" max="1" step="0.05" class="flex-1" @change="updateSettings" />
      </label>
      <label class="flex items-center gap-3">
        <input v-model="settings.muted" type="checkbox" @change="updateSettings" />
        <span>{{ t('settings.mute') }}</span>
      </label>
      <label class="flex items-center gap-3">
        <input v-model="settings.showHints" type="checkbox" @change="updateSettings" />
        <span>{{ t('settings.hints') }}</span>
      </label>
      <p class="text-sm opacity-70">{{ t('settings.musicNote') }}</p>
    </div>

    <div v-else-if="tab === 'controls'">
      <table class="w-full">
        <tbody>
          <tr class="border-b border-wood/20">
            <td class="py-1">{{ t('controls.move') }}</td>
            <td class="py-1 text-end font-semibold">{{ t('controls.moveKeys') }}</td>
          </tr>
          <tr v-for="[label, action] in CONTROLS" :key="action" class="border-b border-wood/20">
            <td class="py-1">{{ t(label) }}</td>
            <td class="py-1 text-end font-semibold" dir="ltr">{{ keymap[action].map(keyLabel).join(' / ') }}</td>
          </tr>
          <tr>
            <td class="py-1">{{ t('controls.hotbar') }}</td>
            <td class="py-1 text-end font-semibold" dir="ltr">1 – 9</td>
          </tr>
        </tbody>
      </table>
    </div>

    <button v-if="tab !== 'menu'" class="btn btn-ghost mt-3" @click="tab = 'menu'">{{ t('common.back') }}</button>
  </ModalFrame>
</template>
