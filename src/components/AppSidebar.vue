<script setup lang="ts">
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenuButton,
    SidebarMenuItem
    // SidebarHeader,
} from '@/components/ui/sidebar'
import { HomeIcon, ScrollTextIcon, StoreIcon, UserIcon } from 'lucide-vue-next';
import SidebarMenu from './ui/sidebar/SidebarMenu.vue';
import { useRoute } from 'vue-router';

const menuItems = [
    {
        name: "Home",
        icon: HomeIcon,
        url: "/dashboard/"
    },
    {
        name: "Users",
        icon: UserIcon,
        url: "/dashboard/users"
    },

    {
        name: "Company",
        icon: StoreIcon,
        url: "/dashboard/company"
    }
]

const route = useRoute()

</script>

<template>
    <Sidebar>
        <div class="flex h-15 items-center border-b px-4 gap-2">
            <ScrollTextIcon />
            <h2 class="font-semibold "> Custom Invoice creator </h2>
        </div>
        <SidebarContent>
            <SidebarGroup>
                <SidebarGroupLabel> Application </SidebarGroupLabel>
                <SidebarGroupContent>
                    <SidebarMenu>
                        <SidebarMenuItem v-for="item in menuItems" :key="item.name">
                            <SidebarMenuButton asChild>
                                <router-link :to="item.url">
                                    <component :is="item.icon" />
                                    <span>{{ item.name }}</span>
                                </router-link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarGroupContent>
            </SidebarGroup>

        </SidebarContent>
        <SidebarFooter />
    </Sidebar>
</template>
