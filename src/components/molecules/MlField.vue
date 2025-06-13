<script setup lang="ts">
import AtInput from '../atoms/AtInput.vue';

import { useAttrs } from 'vue'

const attrs = useAttrs()

const { label } = defineProps<{
  label: string
}>()

</script>
<template>
  <fieldset class="flex flex-col gap-2">
    <label for="">{{ label }}</label>
    <AtInput :v-bind="attrs"></AtInput>
  </fieldset>
</template>
<style lang="scss"></style>
