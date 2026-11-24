<script setup lang="ts">
import LandingAbout from '@/components/landing/LandingAbout.vue'
import LandingFeatures from '@/components/landing/LandingFeatures.vue'
import LandingFooter from '@/components/landing/LandingFooter.vue'
import LandingHero from '@/components/landing/LandingHero.vue'
import LandingNav from '@/components/landing/LandingNav.vue'
import LandingPricing from '@/components/landing/LandingPricing.vue'

const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
</script>

<template>
    <div class="min-h-full bg-background text-foreground">
        <LandingNav @navigate="scrollTo" />
        <LandingHero @navigate="scrollTo" />
        <LandingFeatures />
        <LandingPricing />
        <LandingAbout />
        <LandingFooter />
    </div>
</template>

<style>
@keyframes landing-rise {
    from {
        opacity: 0;
        transform: translateY(18px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes landing-hero-zoom {
    from {
        transform: scale(1.06);
    }
    to {
        transform: scale(1);
    }
}
</style>
