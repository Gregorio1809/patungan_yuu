<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, useId, watch } from 'vue'
import AppIcon from './AppIcon.vue'

const props = withDefaults(
  defineProps<{
    modelValue: boolean
    title: string
    description?: string
    size?: 'sm' | 'md' | 'lg'
  }>(),
  { size: 'md' },
)

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const panel = ref<HTMLElement | null>(null)
const titleId = useId()
const descriptionId = useId()
let previouslyFocused: HTMLElement | null = null
let originalOverflow = ''

const sizeClass = computed(() => {
  if (props.size === 'sm') return 'sm:max-w-md'
  if (props.size === 'lg') return 'sm:max-w-2xl'
  return 'sm:max-w-lg'
})

const focusableSelector =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

function close() {
  emit('update:modelValue', false)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') {
    event.preventDefault()
    close()
    return
  }

  if (event.key !== 'Tab' || !panel.value) return

  const nodes = Array.from(
    panel.value.querySelectorAll<HTMLElement>(focusableSelector),
  ).filter(element => element.offsetParent !== null)

  if (nodes.length === 0) return

  const first = nodes[0]
  const last = nodes[nodes.length - 1]

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

watch(
  () => props.modelValue,
  async open => {
    if (typeof document === 'undefined') return

    if (open) {
      previouslyFocused = document.activeElement as HTMLElement | null
      originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      document.addEventListener('keydown', onKeydown)
      await nextTick()
      const target =
        panel.value?.querySelector<HTMLElement>('[data-autofocus]') ?? panel.value
      target?.focus()
    } else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = originalOverflow
      previouslyFocused?.focus()
    }
  },
)

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown)
  document.body.style.overflow = originalOverflow
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center sm:p-4"
        @click.self="close"
      >
        <div
          ref="panel"
          role="dialog"
          aria-modal="true"
          :aria-labelledby="titleId"
          :aria-describedby="description ? descriptionId : undefined"
          tabindex="-1"
          class="modal-panel flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl outline-none sm:rounded-card"
          :class="sizeClass"
        >
          <div class="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div class="min-w-0">
              <h2 :id="titleId" class="text-xl font-semibold">{{ title }}</h2>
              <p
                v-if="description"
                :id="descriptionId"
                class="mt-1 text-sm text-muted"
              >
                {{ description }}
              </p>
            </div>
            <button
              type="button"
              class="btn btn-ghost btn-icon -mr-1 -mt-1"
              aria-label="Tutup"
              @click="close"
            >
              <AppIcon name="close" :size="20" />
            </button>
          </div>

          <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4">
            <slot />
          </div>

          <div
            v-if="$slots.footer"
            class="border-t border-line px-5 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-4"
          >
            <slot name="footer" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
