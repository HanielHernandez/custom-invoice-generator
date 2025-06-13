<script setup lang="ts">
import { computed, defineProps, useAttrs } from 'vue'

type Variant = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'p' | 'a'

const { variant = "p" } = defineProps<{
  variant: Variant
}>()

const attrs = useAttrs()

const tag = computed(() => variant)

const variantClasses: Record<Variant, string> = {
  h1: 'text-4xl font-bold leading-tight',
  h2: 'text-3xl font-semibold leading-snug',
  h3: 'text-2xl font-semibold leading-snug',
  h4: 'text-xl font-medium leading-snug',
  h5: 'text-lg font-medium leading-snug',
  p: 'text-base text-gray-700',
  a: 'text-blue-600 hover:underline',
}

const classes = computed(() => variantClasses[variant])
</script>
<template>
  <component :is="tag" :class="classes" v-bind="attrs">
    <slot />
  </component>
</template>
<style lang="scss"></style>
