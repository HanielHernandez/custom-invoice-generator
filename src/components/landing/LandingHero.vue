<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { RouterLink } from 'vue-router'

const emit = defineEmits<{
    (event: 'navigate', sectionId: string): void
}>()
</script>

<template>
    <section id="top" class="relative isolate flex min-h-[min(100dvh,52rem)] items-end overflow-hidden">
        <img
            class="absolute inset-0 -z-20 size-full object-cover object-center animate-[landing-hero-zoom_18s_ease-out_forwards]"
            src="/landing-hero.jpg"
            alt="Desk with a laptop open to an invoice document"
        />
        <div
            class="absolute inset-0 -z-10 bg-gradient-to-b from-foreground/30 via-foreground/55 to-foreground/80"
        />

        <div
            class="mx-auto w-full max-w-6xl px-5 pb-16 pt-28 animate-[landing-rise_700ms_ease-out_both] sm:pb-20"
        >
            <p class="mb-3 text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl">
                DFM Invoice Creator
            </p>
            <h1
                class="max-w-[14ch] text-4xl font-semibold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl"
            >
                Invoices that look as sharp as your work.
            </h1>
            <p class="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/85 sm:text-lg">
                Create, brand, and send professional invoices for your business — without wrestling
                templates or lost spreadsheets.
            </p>
            <div class="mt-7 flex flex-wrap gap-3">
                <Button as-child size="lg">
                    <RouterLink to="/auth/signup">Start free</RouterLink>
                </Button>
                <Button
                    size="lg"
                    variant="outline"
                    class="border-primary-foreground/50 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
                    @click="emit('navigate', 'pricing')"
                >
                    See pricing
                </Button>
            </div>
        </div>
    </section>
</template>
