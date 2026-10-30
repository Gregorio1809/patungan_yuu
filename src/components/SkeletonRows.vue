<script setup lang="ts">
withDefaults(defineProps<{ rows?: number }>(), { rows: 3 })
</script>

<template>
  <ul aria-hidden="true" class="divide-y divide-line">
    <li v-for="row in rows" :key="row" class="animate-pulse px-4 py-4 sm:px-5">
      <div class="flex items-center justify-between gap-4">
        <div class="flex-1 space-y-2">
          <div class="h-3.5 w-1/2 rounded-full bg-paper-deep" />
          <div class="h-3 w-1/3 rounded-full bg-paper-deep" />
        </div>
        <div class="h-4 w-20 rounded-full bg-paper-deep" />
      </div>
    </li>
  </ul>
</template>
