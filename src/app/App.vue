<script setup lang="ts">
import { ui } from '../stores/ui';
import TitleScreen from '../components/menus/TitleScreen.vue';
import NewGame from '../components/menus/NewGame.vue';
import IntroScene from '../components/menus/IntroScene.vue';
import GameCanvas from './GameCanvas.vue';
import Hud from '../components/hud/Hud.vue';
import Hotbar from '../components/hud/Hotbar.vue';
import Toasts from '../components/hud/Toasts.vue';
import DialogueBox from '../components/dialogs/DialogueBox.vue';
import ModalHost from '../components/dialogs/ModalHost.vue';
</script>

<template>
  <TitleScreen v-if="ui.screen === 'title'" />
  <NewGame v-else-if="ui.screen === 'newgame'" />
  <IntroScene v-else-if="ui.screen === 'intro'" />
  <div v-else class="relative h-full w-full">
    <GameCanvas />
    <Hud />
    <Hotbar />
    <Toasts />
    <DialogueBox />
    <ModalHost />
  </div>
</template>
