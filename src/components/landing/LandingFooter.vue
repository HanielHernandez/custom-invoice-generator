<script setup lang="ts">
import { Separator } from '@/components/ui/separator'
import { Mail, Phone } from 'lucide-vue-next'
</script>

<template>
    <footer id="contact" class="bg-foreground text-primary-foreground">
        <Separator class="bg-primary-foreground/15" />
        <div
            class="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 md:flex-row md:items-end md:justify-between"
        >
            <div>
                <p class="text-xl font-bold tracking-tight">DFM</p>
                <p class="mt-1 text-sm text-primary-foreground/70">
                    Invoice Creator by Digital Flow Media LLC
                </p>
            </div>

            <div class="grid gap-3 text-sm">
                <a
                    href="mailto:digitalflowmediallc@gmail.com"
                    class="inline-flex items-center gap-2 text-primary-foreground/85 transition-colors hover:text-primary-foreground"
                >
                    <Mail class="size-4" />
                    digitalflowmediallc@gmail.com
                </a>
                <a
                    href="tel:+13053209637"
                    class="inline-flex items-center gap-2 text-primary-foreground/85 transition-colors hover:text-primary-foreground"
                >
                    <Phone class="size-4" />
                    +1 305-320-9637
                </a>
            </div>
        </div>
    </footer>
</template>
