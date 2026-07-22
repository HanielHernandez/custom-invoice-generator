<script setup lang="ts">
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar
    // SidebarHeader,
} from '@/components/ui/sidebar'
import {
    ChevronsUpDown,
    ContactIcon,
    CreditCardIcon,
    HomeIcon,
    LogOut,
    ScrollTextIcon,
    StoreIcon,
    UserIcon
} from 'lucide-vue-next'
import SidebarMenu from './ui/sidebar/SidebarMenu.vue'
import { useRole, type Role } from '@/composable/useRole'
import { useFlagsmith } from '@/composables/useFlagsmith'
import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger
} from './ui/dropdown-menu'
import { useAuthStore } from '@/stores/authStore'
import { useRoute, useRouter } from 'vue-router'

type MenuItem = {
    name: string
    url: string
    icon: unknown
    role: Role
    requiresClientsFlag?: boolean
    requiresPlansFlag?: boolean
    /** When set, only show if Auth custom claim matches (no profile fallback). */
    requiresClaimRole?: Role
}
const authStore = useAuthStore()
const { user } = storeToRefs(authStore)
const router = useRouter()
const { clients, plans, getFlagsmith } = useFlagsmith()

getFlagsmith()

const showClients = computed(() => clients.value)
const showPlans = computed(() => plans.value)

const menuItems: MenuItem[] = [
    {
        name: 'Home',
        icon: HomeIcon,
        url: '/dashboard/',
        role: 'any'
    },
    {
        name: 'Users',
        icon: UserIcon,
        url: '/dashboard/users',
        role: 'admin'
    },
    {
        name: 'Clients',
        icon: ContactIcon,
        url: '/dashboard/clients',
        role: 'any',
        requiresClientsFlag: true
    },
    {
        name: 'Plans',
        icon: CreditCardIcon,
        url: '/dashboard/plans',
        role: 'admin',
        requiresPlansFlag: true,
        requiresClaimRole: 'admin'
    },
    {
        name: 'Company',
        icon: StoreIcon,
        url: '/dashboard/company',
        role: 'any'
    }
]

const { role, claimRole } = useRole()

const availableItems = computed(() => {
    if (role == null) return []
    return menuItems.filter((x) => {
        if (x.requiresClientsFlag && !showClients.value) return false
        if (x.requiresPlansFlag && !showPlans.value) return false
        if (x.requiresClaimRole && claimRole.value !== x.requiresClaimRole) return false
        return x.role == 'any' ? true : x.role == role.value
    })
})

const onLogOutClick = async () => {
    await authStore.logout()
    router.push('/auth/signin')
}

const route = useRoute()
const { setOpenMobile } = useSidebar()

watch(route, () => {
    setOpenMobile(false)
})
</script>

<template>
    <Sidebar collapsible="offcanvas">
        <div class="flex h-15 items-center border-b px-4 gap-2">
            <ScrollTextIcon />
            <h2 class="font-semibold">Custom Invoice creator</h2>
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
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <DropdownMenu>
                        <DropdownMenuTrigger as-child>
                            <SidebarMenuButton
                                size="lg"
                                v-if="user"
                                class="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                            >
                                <Avatar class="h-8 w-8 rounded-lg">
                                    <AvatarImage
                                        :src="user.photoURL || ''"
                                        :alt="user.displayName"
                                    />
                                    <AvatarFallback class="rounded-lg">
                                        {{ user.displayName || 'NA' }}
                                    </AvatarFallback>
                                </Avatar>
                                <div class="grid flex-1 text-left text-sm leading-tight">
                                    <span class="truncate font-semibold">{{
                                        user.displayName
                                    }}</span>
                                    <span class="truncate text-xs">{{ user.email }}</span>
                                </div>
                                <ChevronsUpDown class="ml-auto size-4" />
                            </SidebarMenuButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>My Account</DropdownMenuLabel>

                            <DropdownMenuItem @click="onLogOutClick">
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
    </Sidebar>
</template>
