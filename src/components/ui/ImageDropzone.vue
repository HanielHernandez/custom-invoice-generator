<script setup lang="ts">
import { cn } from '@/lib/utils'
import { ImageIcon, Upload, X } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'

const props = withDefaults(
    defineProps<{
        modelValue?: File | null
        previewUrl?: string
        accept?: string
        disabled?: boolean
        label?: string
        hint?: string
        class?: string
    }>(),
    {
        modelValue: null,
        previewUrl: '',
        accept: 'image/*,.svg,image/svg+xml',
        disabled: false,
        label: 'Drop an image here, or click to browse',
        hint: 'PNG, JPG, GIF, WEBP, or SVG'
    }
)

const emit = defineEmits<{
    (e: 'update:modelValue', file: File | null): void
    (e: 'error', message: string): void
}>()

const inputRef = ref<HTMLInputElement | null>(null)
const isDragging = ref(false)
const localPreview = ref('')
const error = ref<string | null>(null)

const preview = computed(() => localPreview.value || props.previewUrl || '')

watch(
    () => props.modelValue,
    (file) => {
        if (!file) {
            if (localPreview.value.startsWith('blob:')) {
                URL.revokeObjectURL(localPreview.value)
            }
            localPreview.value = ''
            return
        }

        if (localPreview.value.startsWith('blob:')) {
            URL.revokeObjectURL(localPreview.value)
        }
        localPreview.value = URL.createObjectURL(file)
    }
)

const isAcceptedImage = (file: File) => {
    if (file.type.startsWith('image/')) return true
    return file.name.toLowerCase().endsWith('.svg')
}

const assignFile = (file: File | null) => {
    error.value = null
    if (!file) {
        emit('update:modelValue', null)
        return
    }

    if (!isAcceptedImage(file)) {
        const message = 'Only image files are allowed (including SVG).'
        error.value = message
        emit('error', message)
        return
    }

    emit('update:modelValue', file)
}

const onInputChange = (event: Event) => {
    const input = event.target as HTMLInputElement
    const file = input.files?.[0] ?? null
    assignFile(file)
    // Allow selecting the same file again later
    input.value = ''
}

const onDrop = (event: DragEvent) => {
    if (props.disabled) return
    event.preventDefault()
    isDragging.value = false
    const file = event.dataTransfer?.files?.[0] ?? null
    assignFile(file)
}

const onDragOver = (event: DragEvent) => {
    if (props.disabled) return
    event.preventDefault()
    isDragging.value = true
}

const onDragLeave = (event: DragEvent) => {
    if (props.disabled) return
    event.preventDefault()
    isDragging.value = false
}

const openPicker = () => {
    if (props.disabled) return
    inputRef.value?.click()
}

const clearFile = () => {
    if (props.disabled) return
    assignFile(null)
}
</script>

<template>
    <div :class="cn('w-full', props.class)">
        <input
            ref="inputRef"
            type="file"
            class="sr-only"
            :accept="accept"
            :disabled="disabled"
            @change="onInputChange"
        />

        <div
            role="button"
            tabindex="0"
            :aria-disabled="disabled"
            :class="
                cn(
                    'relative flex min-h-40 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed px-6 py-8 text-center transition-colors',
                    isDragging
                        ? 'border-primary bg-primary/5'
                        : 'border-muted-foreground/30 bg-muted/20 hover:border-primary/50 hover:bg-muted/40',
                    disabled && 'pointer-events-none opacity-50',
                    error && 'border-destructive'
                )
            "
            @click="openPicker"
            @keydown.enter.prevent="openPicker"
            @keydown.space.prevent="openPicker"
            @dragover="onDragOver"
            @dragleave="onDragLeave"
            @drop="onDrop"
        >
            <template v-if="preview">
                <img
                    :src="preview"
                    alt="Selected image preview"
                    class="max-h-32 w-auto rounded-md object-contain"
                />
                <p class="text-sm text-muted-foreground">
                    {{ modelValue?.name || 'Image selected' }} — drop another file to replace
                </p>
                <button
                    type="button"
                    class="absolute top-3 right-3 rounded-md border bg-background p-1.5 text-muted-foreground hover:text-foreground"
                    @click.stop="clearFile"
                >
                    <X class="h-4 w-4" />
                    <span class="sr-only">Remove file</span>
                </button>
            </template>

            <template v-else>
                <div
                    class="flex h-12 w-12 items-center justify-center rounded-full border bg-background"
                >
                    <Upload v-if="isDragging" class="h-5 w-5 text-primary" />
                    <ImageIcon v-else class="h-5 w-5 text-muted-foreground" />
                </div>
                <div class="space-y-1">
                    <p class="text-sm font-medium">{{ label }}</p>
                    <p class="text-xs text-muted-foreground">{{ hint }}</p>
                </div>
            </template>
        </div>

        <p v-if="error" class="mt-2 text-sm text-destructive-foreground">{{ error }}</p>
    </div>
</template>
