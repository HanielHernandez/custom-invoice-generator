<script setup lang="ts">
import AtText from '@/components/atoms/AtText.vue';
import Button from '@/components/ui/button/Button.vue';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import CardContent from '@/components/ui/card/CardContent.vue';
import CardDescription from '@/components/ui/card/CardDescription.vue';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import Label from '@/components/ui/label/Label.vue';
import LoadingSpinner from '@/components/ui/LoadingSpinner.vue';
import Textarea from '@/components/ui/textarea/Textarea.vue';
import { auth, db, storage } from '@/lib/firebase';
import { useCompanyStore } from '@/stores/companyStore';
import { toTypedSchema } from '@vee-validate/zod';
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';

import { Upload } from 'lucide-vue-next';
import { storeToRefs } from 'pinia';
import { useForm } from 'vee-validate';
import { computed, onMounted, ref } from 'vue';
import { z } from 'zod';

const CompanySchema = z.object({
    name: z.string().min(1, 'Company name is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    zipcode: z.string().min(1, 'Zip code is required'),
    address: z.string().min(1, 'Address is required'),
    logoUrl: z.string(),
    signature: z.string().min(1, 'Signature is required'),
    terms: z.string().min(1, 'Terms are required'),
    tags: z.array(z.string()).default([]),
});

const { handleSubmit, setValues } = useForm({
    validationSchema: toTypedSchema(CompanySchema),
    initialValues: {
        name: '',
        phoneNumber: '',
        zipcode: '',
        address: '',
        logoUrl: '',
        signature: '',
        terms: '',
        tags: [],
    }
});
const user = computed(() => auth.currentUser)
const logoFile = ref<File | null>(null);
const signatureFile = ref<File | null>(null);
const logoPreview = ref('');
const signaturePreview = ref('');
const loading = ref(false);

const companyStore = useCompanyStore()

const { company } = storeToRefs(companyStore)

function handleFileUpload(e: Event, type: 'logo' | 'signature') {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    if (type === 'logo') {
        logoFile.value = file;
        logoPreview.value = url;
    } else {
        signatureFile.value = file;
        signaturePreview.value = url;
    }
}

onMounted(async () => {
    await companyStore.fetchCompany()
    if (company.value) {
        setValues(company.value)
        logoPreview.value = company.value.logoUrl
    }
})


const onSubmit = handleSubmit(async (values) => {
    loading.value = true;
    try {
        let logoUrl = company.value ? company.value.logoUrl : '';

        // Upload files to Firebase Storage
        if (logoFile.value) {
            const fileRef = storageRef(storage, `logos/${Date.now()}_${logoFile.value.name}`);
            await uploadBytes(fileRef, logoFile.value);
            logoUrl = await getDownloadURL(fileRef);
        }

        const payload = {
            ...values,
            logoUrl,
            uuid:
                user.value?.uid || "",
            createdAt: new Date(),
        }
        const action = company.value && company.value.id ? updateDoc(doc(db, 'companies', company.value.id || ""), payload) :
            addDoc(collection(db, `companies`), payload)
        // Save to Firestore
        await action

        alert('✅ Company saved!');
    } catch (error) {
        console.error('❌ Error saving company:', error);
        alert('Failed to save company');
    } finally {
        loading.value = false;
    }
});


</script>
<template>
    <div class="flex flex-col gap-4">
        <div>
            <at-text variant="h2"> Company Settings </at-text>
            <at-text variant="p">Manage your company information </at-text>
        </div>
        <Card>
            <CardHeader>
                <CardTitle>Company Information</CardTitle>
                <CardDescription>
                    Update your company details and contact information.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form @submit.prevent="onSubmit" class="space-y-6 ">
                    <div class="flex flex-wrap  gap-6 items-center">
                        <!-- <FormField name="logoUrl">
                            <FormItem>
                                <FormLabel>Logo</FormLabel>
                                <FormControl>
                                    <div class="relative w-full max-w-sm items-center">
                                        <Input type="file" accept="image/*"  class="pl-10"
                                            @change="handleFileUpload($event, 'logo')" />
                                        <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
                                            <Upload class="size-6 text-muted-foreground" />
                                        </span>
                                    </div>

                                </FormControl>

                                <FormMessage />
                            </FormItem>
                        </FormField> -->

                        <Label class="w-full">Logo</Label>
                        <img v-if="logoPreview" :src="logoPreview" class="mt-2 w-32 h-auto rounded" />

                        <div class="relative w-full max-w-sm items-center">
                            <Input type="file" accept="image/*" class="pl-10"
                                @change="handleFileUpload($event, 'logo')" />
                            <span class="absolute start-0 inset-y-0 flex items-center justify-center px-2">
                                <Upload class="size-6 text-muted-foreground" />
                            </span>
                        </div>
                    </div>

                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField v-slot="{ componentField }" name="name">
                            <FormItem>
                                <FormLabel>Company Name</FormLabel>
                                <FormControl>
                                    <Input v-bind="componentField" placeholder="Enter company name" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>

                        <FormField v-slot="{ componentField }" name="phoneNumber">
                            <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input v-bind="componentField" placeholder="Enter phone number" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        </FormField>
                    </div>


                    <FormField v-slot="{ componentField }" name="zipcode">
                        <FormItem>
                            <FormLabel>Zip Code</FormLabel>
                            <FormControl>
                                <Input v-bind="componentField" placeholder="Enter zip code" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="address">
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Textarea v-bind="componentField" placeholder="Enter address" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>


                    <FormField v-slot="{ componentField }" name="signature">
                        <FormItem>
                            <FormLabel>Signature</FormLabel>
                            <FormControl>
                                <Input v-bind="componentField" placeholder="Enter signature" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ componentField }" name="terms">
                        <FormItem>
                            <FormLabel>Terms</FormLabel>
                            <FormControl>
                                <Textarea v-bind="componentField" placeholder="Enter terms" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <FormField v-slot="{ value, handleChange }" name="tags">
                        <FormItem>
                            <FormLabel>Tags (comma-separated)</FormLabel>
                            <FormControl>
                                <Input :model-value="value?.join(', ')"
                                    @update:model-value="handleChange(($event as string).split(',').map(t => t.trim()).filter(Boolean))"
                                    placeholder="Enter tags, separated by commas" />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    </FormField>

                    <Button type="submit" size="lg">Save Company
                        <LoadingSpinner v-if="loading" />
                    </Button>
                </form>

            </CardContent>
        </Card>
    </div>
</template>
<style lang="scss"></style>
