<script setup lang="ts">
import { AlertDialogAction, AlertDialogCancel, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from './ui/alert-dialog';
import AlertDialog from './ui/alert-dialog/AlertDialog.vue';
import AlertDialogContent from './ui/alert-dialog/AlertDialogContent.vue';
import LoadingSpinner from './ui/LoadingSpinner.vue';

const { open = false, loading = false } = defineProps<{
    open: boolean,
    loading?: boolean
}>()
const emit = defineEmits<{
    (e: "onCancel"): void,
    (e: "onContinue"): void
}>()



</script>
<template>
    <AlertDialog :open="open">
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete this invoice
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel @click="emit('onCancel')" :disabled="loading">Cancel</AlertDialogCancel>
                <AlertDialogAction @click="emit('onContinue')" :disabled="loading">Continue

                    <LoadingSpinner v-if="loading" />
                </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
</template>
<style lang="scss"></style>
