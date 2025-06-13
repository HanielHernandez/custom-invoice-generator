<script setup lang=ts>
defineOptions({
  inheritAttrs: false
})


const model = defineModel()

</script>
<template>
  <input v-bind="$attrs" v-model="model"
    class="border border-neutral-400 w-full rounded-md focus:border-neutral-600 px-4 py-3 placeholder:text-neutral-300 text-neutral-600">
</template>
<style lang="scss"></style>
