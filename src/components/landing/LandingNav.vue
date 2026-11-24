<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { auth } from '@/lib/firebase'
import { onMounted, onUnmounted, ref } from 'vue'
import { RouterLink } from 'vue-router'

const emit = defineEmits<{
    (event: 'navigate', sectionId: string): void
}>()

const scrolled = ref(false)
const isSignedIn = ref(Boolean(auth.currentUser))

const onScroll = () => {
    scrolled.value = window.scrollY > 12
}

onMounted(() => {
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    isSignedIn.value = Boolean(auth.currentUser)
})

onUnmounted(() => {
    window.removeEventListener('scroll', onScroll)
})
</script>

<template>
    <header
        :class="[
            'sticky top-0 z-40 border-b bg-background/90 backdrop-blur-md transition-shadow',
            scrolled ? 'border-border shadow-xs' : 'border-transparent'
        ]"
    >
        <div class="mx-auto flex w-full max-w-6xl items-center gap-4 px-5 py-3.5">
            <button
                type="button"
                class="flex min-w-0 items-baseline gap-2 text-left"
                @click="emit('navigate', 'top')"
            >
                <span class="text-xl font-bold tracking-tight text-foreground">DFM</span>
                <span class="hidden truncate text-sm text-muted-foreground sm:inline">
                    Invoice Creator
                </span>
            </button>

            <nav class="ml-auto hidden items-center gap-1 md:flex" aria-label="Page">
                <Button variant="ghost" @click="emit('navigate', 'features')">Features</Button>
                <Button variant="ghost" @click="emit('navigate', 'pricing')">Pricing</Button>
                <Button variant="ghost" @click="emit('navigate', 'about')">About</Button>
            </nav>

            <div class="flex items-center gap-2 md:ml-0">
                <template v-if="isSignedIn">
                    <Button as-child>
                        <RouterLink to="/dashboard">Dashboard</RouterLink>
                    </Button>
                </template>
                <template v-else>
                    <Button as-child variant="ghost">
                        <RouterLink to="/auth/signin">Log in</RouterLink>
                    </Button>
                    <Button as-child>
                        <RouterLink to="/auth/signup">Sign up</RouterLink>
                    </Button>
                </template>
            </div>
        </div>
    </header>
</template>
