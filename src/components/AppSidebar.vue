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
import { useRole, type Role } from '@/composable/useRole';
import { computed } from 'vue';

type MenuItem = {
    name: string,
    url: string,
    icon: unknown,
    role: Role
}

const menuItems: MenuItem[] =

    [
        {
            name: "Home",
            icon: HomeIcon,
            url: "/dashboard/",
            role: "any",
        },
        {
            name: "Users",
            icon: UserIcon,
            url: "/dashboard/users",
            role: "admin",
        },

        {
            name: "Company",
            icon: StoreIcon,
            url: "/dashboard/company",
            role: "any",
        }
    ]

const { role } = useRole()


const availableItems = computed(() => {
    if (role == null) return []
    return menuItems.filter(x => x.role == 'any' ? true : x.role == role.value)
})

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
                    <SidebarMenu v-if="role !== null">
                        <SidebarMenuItem v-for="item in availableItems" :key="item.name">
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
