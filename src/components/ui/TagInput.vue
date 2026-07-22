<script setup lang="ts">
import { cn } from '@/lib/utils'
import { X } from 'lucide-vue-next'
import { ref } from 'vue'

const props = withDefaults(
    defineProps<{
        modelValue?: string[]
        placeholder?: string
        disabled?: boolean
        class?: string
    }>(),
    {
        modelValue: () => [],
        placeholder: 'Type and press Enter',
        disabled: false
    }
)

const emit = defineEmits<{
    (e: 'update:modelValue', value: string[]): void
}>()

const draft = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

const focusInput = () => {
    if (props.disabled) return
    inputRef.value?.focus()
}

const addTag = (raw: string) => {
    const tag = raw.trim()
    if (!tag) return

    const exists = props.modelValue.some(
        (item) => item.toLowerCase() === tag.toLowerCase()
    )
    if (exists) {
        draft.value = ''
        return
    }

    emit('update:modelValue', [...props.modelValue, tag])
    draft.value = ''
}

const removeTag = (index: number) => {
    if (props.disabled) return
    emit(
        'update:modelValue',
        props.modelValue.filter((_, i) => i !== index)
    )
}

const onKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Enter') {
        event.preventDefault()
        addTag(draft.value)
        return
    }

    if (event.key === 'Backspace' && !draft.value && props.modelValue.length) {
        removeTag(props.modelValue.length - 1)
    }
}

const onBlur = () => {
    if (draft.value.trim()) {
        addTag(draft.value)
    }
}
</script>

<template>
    <div
        :class="
            cn(
                'border-input dark:bg-input/30 flex min-h-9 w-full cursor-text flex-wrap items-center gap-2 rounded-md border bg-transparent px-3 py-1.5 text-base shadow-xs transition-[color,box-shadow] md:text-sm',
                'focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]',
                disabled && 'pointer-events-none opacity-50',
                props.class
            )
        "
        @click="focusInput"
    >
        <span
            v-for="(tag, index) in modelValue"
            :key="`${tag}-${index}`"
            class="bg-secondary text-secondary-foreground inline-flex max-w-full items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium"
        >
            <span class="truncate">{{ tag }}</span>
            <button
                type="button"
                class="hover:text-foreground text-muted-foreground rounded-sm"
                :disabled="disabled"
                @click.stop="removeTag(index)"
            >
                <X class="h-3 w-3" />
                <span class="sr-only">Remove {{ tag }}</span>
            </button>
        </span>

        <input
            ref="inputRef"
            v-model="draft"
            type="text"
            :disabled="disabled"
            :placeholder="modelValue.length ? '' : placeholder"
            class="placeholder:text-muted-foreground min-w-[8rem] flex-1 border-0 bg-transparent p-0 text-sm outline-none focus:ring-0"
            @keydown="onKeydown"
            @blur="onBlur"
        />
    </div>
</template>
