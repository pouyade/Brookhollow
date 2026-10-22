<script setup lang="ts">
import { ui } from '../../stores/ui';
import InventoryModal from '../inventory/InventoryModal.vue';
import ShopModal from '../shop/ShopModal.vue';
import BinModal from '../shop/BinModal.vue';
import PauseMenu from '../menus/PauseMenu.vue';
import Journal from '../menus/Journal.vue';
import LetterModal from './LetterModal.vue';
import MorningReport from './MorningReport.vue';
</script>

<template>
  <template v-if="ui.modal">
    <InventoryModal v-if="ui.modal.kind === 'inventory'" />
    <ShopModal v-else-if="ui.modal.kind === 'shop'" :shop="ui.modal.shop" />
    <BinModal v-else-if="ui.modal.kind === 'bin'" />
    <PauseMenu v-else-if="ui.modal.kind === 'pause'" />
    <Journal v-else-if="ui.modal.kind === 'journal'" />
    <LetterModal v-else-if="ui.modal.kind === 'letter'" :id="ui.modal.id" />
    <MorningReport v-else-if="ui.modal.kind === 'morning'" />
  </template>
</template>
