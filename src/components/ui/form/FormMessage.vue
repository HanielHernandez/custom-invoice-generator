<script lang="ts" setup>
import { type HTMLAttributes, toValue } from 'vue'
import { cn } from '@/lib/utils'
import { useFormField } from './useFormField'

const props = defineProps<{
    class?: HTMLAttributes['class']
}>()

const { formMessageId, error } = useFormField()
</script>

<template>
    <p
        v-if="error"
        :id="formMessageId"
        data-slot="form-message"
        :class="cn('text-destructive-foreground text-sm', props.class)"
    >
        {{ toValue(error) }}
    </p>
</template>
