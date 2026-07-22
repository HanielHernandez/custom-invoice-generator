<script setup lang="ts">
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table'
import { auth, db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { ExternalLinkIcon } from 'lucide-vue-next'
import { onMounted, ref } from 'vue'

type SubscriptionInvoice = {
    id: string
    stripeInvoiceId: string
    status: 'paid' | 'payment_failed'
    amountDue: number
    amountPaid: number
    currency: string
    hostedInvoiceUrl?: string | null
    invoicePdf?: string | null
    invoiceCreatedAt: number
}

const invoices = ref<SubscriptionInvoice[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase()
    }).format(amount / 100)

const formatDate = (timestamp: number) =>
    new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(timestamp))

const invoiceAmount = (invoice: SubscriptionInvoice) =>
    invoice.status === 'paid' ? invoice.amountPaid : invoice.amountDue

onMounted(async () => {
    const user = auth.currentUser
    if (!user) {
        error.value = 'You must be signed in to view billing invoices.'
        loading.value = false
        return
    }

    try {
        const snapshot = await getDocs(
            query(collection(db, 'subscription_invoices'), where('uid', '==', user.uid))
        )

        invoices.value = snapshot.docs
            .map((document) => ({
                ...(document.data() as Omit<SubscriptionInvoice, 'id'>),
                id: document.id
            }))
            .sort((a, b) => b.invoiceCreatedAt - a.invoiceCreatedAt)
    } catch (caughtError) {
        console.error('Unable to load subscription invoices:', caughtError)
        error.value =
            caughtError instanceof Error
                ? caughtError.message
                : 'Unable to load subscription invoices.'
    } finally {
        loading.value = false
    }
})
</script>

<template>
    <Card>
        <CardHeader>
            <CardTitle>Invoices</CardTitle>
            <CardDescription>View your subscription payment history and receipts.</CardDescription>
        </CardHeader>
        <CardContent class="pb-6">
            <div v-if="loading" class="flex min-h-32 items-center justify-center">
                <LoadingSpinner />
            </div>

            <p v-else-if="error" class="py-8 text-center text-sm text-destructive">
                {{ error }}
            </p>

            <p
                v-else-if="invoices.length === 0"
                class="py-8 text-center text-sm text-muted-foreground"
            >
                No subscription invoices yet.
            </p>

            <div v-else class="overflow-x-auto rounded-md border">
                <Table class="min-w-2xl">
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Invoice</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead class="text-right">Amount</TableHead>
                            <TableHead class="text-right">Receipt</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <TableRow v-for="invoice in invoices" :key="invoice.id">
                            <TableCell>{{ formatDate(invoice.invoiceCreatedAt) }}</TableCell>
                            <TableCell class="font-mono text-xs">
                                {{ invoice.stripeInvoiceId }}
                            </TableCell>
                            <TableCell>
                                <span
                                    :class="[
                                        'inline-flex rounded-full px-2.5 py-1 text-xs font-medium',
                                        invoice.status === 'paid'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-red-100 text-red-700'
                                    ]"
                                >
                                    {{ invoice.status === 'paid' ? 'Paid' : 'Payment failed' }}
                                </span>
                            </TableCell>
                            <TableCell class="text-right font-medium tabular-nums">
                                {{ formatAmount(invoiceAmount(invoice), invoice.currency) }}
                            </TableCell>
                            <TableCell class="text-right">
                                <a
                                    v-if="invoice.hostedInvoiceUrl || invoice.invoicePdf"
                                    :href="invoice.hostedInvoiceUrl || invoice.invoicePdf || '#'"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                                >
                                    View
                                    <ExternalLinkIcon class="size-3.5" />
                                </a>
                                <span v-else class="text-sm text-muted-foreground">—</span>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </CardContent>
    </Card>
</template>
