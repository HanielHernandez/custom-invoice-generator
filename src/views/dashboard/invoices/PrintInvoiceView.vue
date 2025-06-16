<script setup lang="ts">
import Button from '@/components/ui/button/Button.vue'
import Skeleton from '@/components/ui/skeleton/Skeleton.vue'
import { useCompanyStore } from '@/stores/companyStore'
import { useInvoiceStore } from '@/stores/InvoiceStore'
import { CheckSquare, PrinterIcon } from 'lucide-vue-next'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'


const route = useRoute()
const invoices = useInvoiceStore()
const companyStore = useCompanyStore()

const { invoice, fetching } = storeToRefs(invoices)
const { company } = storeToRefs(companyStore)

onMounted(async () => {
  const id = Array.isArray(route.params.id) ? route.params.id.join() : route.params.id
  await Promise.all([invoices.find(id), companyStore.fetchCompany()])

  // window.print()
})


const formatDate = (timestamp?: number): string => {
  if (!timestamp) return new Date().toLocaleDateString()
  return new Date(timestamp).toLocaleDateString()
}

const print = () => {
  window.print()
}


</script>
<template>
  <div class="w-full max-w-180 mx-auto ">

    <div class="text-center mb-4">
      <Button variant="ghost" @click="print" class="print:hidden">
        <PrinterIcon /> <span>Print for your records</span>
      </Button>
    </div>

    <div class="fetching" v-if="fetching && !invoice">
      <Skeleton class="w-full h-180" />
    </div>


    <!---->
    <div class=" mx-auto p-6  text-sm z-20 relative" v-if="invoice && company">
      <!-- Header -->
      <img class="absolute w-1/2 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-20"
        :src="company.logoUrl" />

      <div class="flex flex-col mb-4">
        <div class="flex justify-between items-center">
          <img :src="company.logoUrl" alt="Company Logo" class="h-20 w-auto mb-2" />

          <div class="text-right">
            <p> <span class="font-bold">Date:</span> {{
              formatDate(invoice.createdAt) }}</p>
            <p> <span class="font-bold">Estimate:</span> {{ invoice.stimates
            }}
            </p>
            <div class="mt-2 text-right flex flex-col gap-2">
              <p>
                <b>Services</b>
              </p>
              <div v-for="service in invoice.services" :key="service"
                class="text-green-600 font-semibold flex items-center gap-2 justify-end">
                <CheckSquare />
                <span> {{ service.toUpperCase() }}
                </span>

              </div>
            </div>
          </div>
        </div>
        <div class="flex justify-between">
          <div>
            <p class="font-bold">Contractor</p>
            <p class="font-bold">{{ company.name }}</p>
            <p><span class="font-bold">Address:</span> {{ company.address }}</p>
            <p><span class="font-bold">City,State,Zip: </span> {{ company.zipcode }}</p>
            <p><span class="font-bold">Phone</span>{{ company.phoneNumber }}</p>
          </div>


          <!-- Client Info -->
          <div>
            <p class="font-bold">Client Name: {{ invoice.customerName }}</p>
            <p><b>Address:</b> {{ invoice.customerAddres }}</p>
            <p><b>City, State, Zip:</b> {{ invoice.city }}, {{ invoice.state }} {{ invoice.zip }}</p>
            <p><b>Phone:</b> {{ invoice.phone }}</p>
          </div>

        </div>


      </div>

      <table class="w-full border-t">
        <thead>
          <tr>
            <th>
              <p class="font-semibold border-b py-4 text-left c">Project Description</p>
            </th>
            <th>
              <p class="font-semibold border-b py-4 text-right">Amount</p>
            </th>
          </tr>
        </thead>

        <tbody>
          <tr>
            <td>
              <p class="py-4">
                {{ invoice.description }}
              </p>
            </td>
            <td>

            </td>
          </tr>
        </tbody>
      </table>


      <!-- Total -->
      <div class="text-right text-lg font-bold">
        Total: <br> ${{ invoice.total }}
      </div>

      <div class="text-center text-sm mb-6">
        <p> <b>Than you for your preference!</b> </p>
        <p>if you have any question concerning this document</p>
        <p class="font-bold"> {{ company.email || "franciscopainting@gmail.com" }}</p>
        <p class="text-sm">Materials: <span class="font-semibold">{{ invoice.materials ? '✔ Company' : 'Client'
        }}</span></p>
      </div>

      <!-- Terms -->
      <div class="mt-4 text-sm ">
        <p v-html="company.terms"></p>
      </div>

      <!-- Signatures -->
      <div class="flex justify-between items-end mt-8">
        <div class="text-center">
          <div class="border-t border-black w-40 mx-auto"></div>
          <p class="mt-1 text-xs">Signature Client</p>
        </div>
        <div class="text-center">
          <p :src="company.signature" alt="Signature" class="font-great-vibes text-4xl h-10 mb-1">{{
            company.signature }}</p>
          <div class="border-t border-black w-40 mx-auto"></div>
          <p class="mt-1 text-xs">Signature Company</p>
        </div>
      </div>
    </div>



  </div>
</template>
<style lang="css"></style>
