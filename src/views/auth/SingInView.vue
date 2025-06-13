<script setup lang="ts">
// import AtInput from '@/components/atoms/AtInput.vue';
import AtText from '@/components/atoms/AtText.vue';
import MlField from '@/components/molecules/MlField.vue';
</script>
<template>
  <div class="w-full max-w-120 rounded-md flex flex-col border gap-4 bg-white border-neutral-300 shadow-sm  p-4">
    <at-text variant="h2" class="text-center">
      Sign in
    </at-text>
    <at-text variant="p" class="">
      fill the folowing form to start a new session
    </at-text>

    <form action="">

      <MlField label="Email" placeholder="Your Email ..." />

    </form>

  </div>

</template>
<style lang="scss"></style>
