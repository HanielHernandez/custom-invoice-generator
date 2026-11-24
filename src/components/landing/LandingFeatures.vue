<script setup lang="ts">
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Users, Zap, type LucideIcon } from 'lucide-vue-next'

type Feature = {
    icon: LucideIcon
    title: string
    description: string
}

const features: Feature[] = [
    {
        icon: FileText,
        title: 'Polished invoices in minutes',
        description:
            'Build branded invoices with your logo, terms, and line items — then download or share without the spreadsheet scramble.'
    },
    {
        icon: Users,
        title: 'Clients in one place',
        description:
            'Keep customer details, addresses, and history ready so every invoice starts from real data, not a blank form.'
    },
    {
        icon: Zap,
        title: 'Plans that grow with you',
        description:
            'Start free, then unlock higher limits for invoices and clients as your business picks up speed.'
    }
]
</script>

<template>
    <section id="features" class="bg-background py-20">
        <div class="mx-auto w-full max-w-6xl px-5">
            <p class="mb-2 text-sm font-semibold uppercase tracking-[0.14em] text-primary">
                Features
            </p>
            <h2 class="max-w-[18ch] text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                Everything you need to bill with confidence
            </h2>
            <p class="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Built for small teams and solo operators who want clean invoices and less admin
                noise.
            </p>

            <div class="mt-10 grid gap-4 md:grid-cols-3">
                <Card v-for="feature in features" :key="feature.title" class="h-full">
                    <CardHeader>
                        <span
                            class="mb-2 inline-flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary"
                        >
                            <component :is="feature.icon" class="size-5" />
                        </span>
                        <CardTitle>{{ feature.title }}</CardTitle>
                        <CardDescription class="text-base leading-relaxed">
                            {{ feature.description }}
                        </CardDescription>
                    </CardHeader>
                </Card>
            </div>
        </div>
    </section>
</template>
