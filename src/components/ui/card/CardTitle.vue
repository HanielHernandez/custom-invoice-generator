<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <h3 data-slot="card-title" :class="cn('tracking-tight font-semibold text-2xl ', props.class)">
    <slot />
  </h3>
</template>
