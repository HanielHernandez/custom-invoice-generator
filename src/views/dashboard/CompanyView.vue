<script setup lang="ts">
import AtText from '@/components/atoms/AtText.vue';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import CardContent from '@/components/ui/card/CardContent.vue';
import CardDescription from '@/components/ui/card/CardDescription.vue';
import { toTypedSchema } from '@vee-validate/zod';
import { useForm } from 'vee-validate';
import { z } from 'zod';

export const CompanySchema = z.object({
    name: z.string().min(1, 'Company name is required'),
    phoneNumber: z.string().min(1, 'Phone number is required'),
    zicode: z.string().min(1, 'Zip code is required'),
    address: z.string().min(1, 'Address is required'),
    logoUrl: z.string().url('Logo must be a valid URL'),
    signature: z.string().min(1, 'Signature is required'),
    terms: z.string().min(1, 'Terms are required'),
    tags: z.array(z.string()).default([]),
});

const { handleSubmit, errors, defineField, values } = useForm({
    validationSchema: toTypedSchema(CompanySchema),
    initialValues: {
        name: '',
        phoneNumber: '',
        zicode: '',
        address: '',
        logoUrl: '',
        signature: '',
        terms: '',
        tags: [],
    }
});

const [name] = defineField('name');
const [phoneNumber] = defineField('phoneNumber');
const [zicode] = defineField('zicode');
const [address] = defineField('address');
const [logoUrl] = defineField('logoUrl');
const [signature] = defineField('signature');
const [terms] = defineField('terms');
const [tags] = defineField('tags');


const onsubmit = () => {

}
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
                <div>
                    <Label for="name">Company Name</Label>
                    <Input id="name" v-model="name" />
                    <p class="text-sm text-red-500">{{ errors.name }}</p>
                </div>

                <div>
                    <Label for="phoneNumber">Phone Number</Label>
                    <Input id="phoneNumber" v-model="phoneNumber" />
                    <p class="text-sm text-red-500">{{ errors.phoneNumber }}</p>
                </div>

                <div>
                    <Label for="zicode">Zip Code</Label>
                    <Input id="zicode" v-model="zicode" />
                    <p class="text-sm text-red-500">{{ errors.zicode }}</p>
                </div>

                <div>
                    <Label for="address">Address</Label>
                    <Textarea id="address" v-model="address" />
                    <p class="text-sm text-red-500">{{ errors.address }}</p>
                </div>

                <div>
                    <Label for="logoUrl">Logo URL</Label>
                    <Input id="logoUrl" v-model="logoUrl" />
                    <p class="text-sm text-red-500">{{ errors.logoUrl }}</p>
                </div>

                <div>
                    <Label for="signature">Signature</Label>
                    <Input id="signature" v-model="signature" />
                    <p class="text-sm text-red-500">{{ errors.signature }}</p>
                </div>

                <div>
                    <Label for="terms">Terms</Label>
                    <Textarea id="terms" v-model="terms" />
                    <p class="text-sm text-red-500">{{ errors.terms }}</p>
                </div>

                <div>
                    <Label for="tags">Tags (comma-separated)</Label>
                    <Input id="tags" v-model="tags"
                        @blur="tags = tags?.split(',').map(t => t.trim()).filter(Boolean)" />
                    <p class="text-sm text-red-500">{{ errors.tags }}</p>
                </div>

                <Button type="submit">Save Company</Button>
            </CardContent>
        </Card>
    </div>
</template>
<style lang="scss"></style>
