<script setup lang="ts">
import type { IconName } from '../lib/icons'
import AppIcon from './AppIcon.vue'

withDefaults(
  defineProps<{
    title: string
    description?: string
    icon?: IconName
  }>(),
  { icon: 'receipt' },
)
</script>

<template>
  <div class="flex flex-col items-center px-6 py-10 text-center">
    <div
      class="flex size-12 items-center justify-center rounded-2xl bg-paper-deep text-muted"
    >
      <AppIcon :name="icon" :size="24" />
    </div>
    <h3 class="mt-3 text-base font-semibold">{{ title }}</h3>
    <p v-if="description" class="mt-1 max-w-sm text-sm text-muted">
      {{ description }}
    </p>
    <div v-if="$slots.default" class="mt-4">
      <slot />
    </div>
  </div>
</template>
