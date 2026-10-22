<script setup lang="ts">
import { LOCALES, locale, setLocale, t } from '../../i18n';
import type { Locale } from '../../i18n';
import { changed } from '../../game/sim/events';

function pick(l: Locale) {
  setLocale(l);
  changed(); // refresh HUD text that is derived from game state
}
</script>

<template>
  <div class="flex items-center gap-2" role="group" :aria-label="t('common.language')">
    <span class="text-sm opacity-70">{{ t('common.language') }}</span>
    <button
      v-for="(info, code) in LOCALES"
      :key="code"
      class="btn px-2 py-0.5 text-sm"
      :class="{ active: locale === code }"
      :lang="info.htmlLang"
      :aria-pressed="locale === code"
      @click="pick(code as Locale)"
    >
      {{ info.name }}
    </button>
  </div>
</template>
