<script setup lang="ts">
import {
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from './ui/alert-dialog'
import AlertDialog from './ui/alert-dialog/AlertDialog.vue'
import AlertDialogContent from './ui/alert-dialog/AlertDialogContent.vue'
import LoadingSpinner from './ui/LoadingSpinner.vue'

const { open = false, loading = false } = defineProps<{
    open: boolean
    loading?: boolean
}>()
const emit = defineEmits<{
    (e: 'onCancel'): void
    (e: 'onContinue'): void
}>()
</script>
<template>
    <AlertDialog :open="open">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro que desea Eliminar este invoice?</AlertDialogTitle>
                <AlertDialogDescription>
                    Estás seguor que deseas elminar este invoice permanentemente
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel @click="emit('onCancel')" :disabled="loading"
                    >Cancelar</AlertDialogCancel
                >
                <AlertDialogAction @click="emit('onContinue')" :disabled="loading"
                    >Eliminar

                    <LoadingSpinner v-if="loading" />
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
<style lang="scss"></style>
