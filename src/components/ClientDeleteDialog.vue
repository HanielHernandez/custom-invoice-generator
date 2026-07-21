<script setup lang="ts">
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'

const props = withDefaults(
    defineProps<{
        open: boolean
        loading?: boolean
        objectId?: string | null
        clientName?: string | null
    }>(),
    {
        loading: false,
        objectId: null,
        clientName: null
    }
)

const emit = defineEmits<{
    (e: 'onCancel'): void
    (e: 'onContinue', objectId: string): void
}>()

// Controlled dialog: ignore update:open(false) from Action click (it races and
// clears parent state before onContinue). Cancel / Escape emit onCancel instead.
const onOpenChange = (value: boolean) => {
    if (value || props.loading) return
}

const onCancel = () => {
    if (props.loading) return
    emit('onCancel')
}

const onContinue = () => {
    if (props.loading) return
    if (!props.objectId) {
        console.error('Error deleting client: missing client id', props.objectId)
        return
    }
    emit('onContinue', props.objectId)
}

const onEscapeKeyDown = (event: Event) => {
    if (props.loading) {
        event.preventDefault()
        return
    }
    event.preventDefault()
    emit('onCancel')
}

const onPointerDownOutside = (event: Event) => {
    if (props.loading) event.preventDefault()
}

const onInteractOutside = (event: Event) => {
    if (props.loading) event.preventDefault()
}
</script>

<template>
    <AlertDialog :open="open" @update:open="onOpenChange">
        <AlertDialogContent
            class="data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 duration-200"
            @escape-key-down="onEscapeKeyDown"
            @pointer-down-outside="onPointerDownOutside"
            @interact-outside="onInteractOutside"
        >
            <AlertDialogHeader>
                <AlertDialogTitle>Delete client?</AlertDialogTitle>
                <AlertDialogDescription>
                    Are you sure you want to delete
                    {{ clientName ? `"${clientName}"` : 'this client' }}? This action cannot be
                    undone.
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel :disabled="loading" @click.prevent="onCancel">
                    Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                    class="bg-destructive text-white hover:bg-destructive/90 min-w-28"
                    :class="{ 'animate-pulse': loading }"
                    :disabled="loading"
                    @click.prevent="onContinue"
                >
                    <Transition name="client-delete-fade" mode="out-in">
                        <span :key="loading ? 'deleting' : 'delete'">
                            {{ loading ? 'Deleting...' : 'Delete' }}
                        </span>
                    </Transition>
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>

<style scoped>
.client-delete-fade-enter-active,
.client-delete-fade-leave-active {
    transition: opacity 0.2s ease;
}

.client-delete-fade-enter-from,
.client-delete-fade-leave-to {
    opacity: 0;
}
</style>
