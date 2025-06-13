<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import * as z from "zod"
import { useForm } from 'vee-validate';
import { FormField } from '@/components/ui/form';
import FormItem from '@/components/ui/form/FormItem.vue';
import FormLabel from '@/components/ui/form/FormLabel.vue';
import FormControl from '@/components/ui/form/FormControl.vue';
import FormMessage from '@/components/ui/form/FormMessage.vue';
import Button from '@/components/ui/button/Button.vue';
import Input from '@/components/ui/input/Input.vue';
import Card from '@/components/ui/card/Card.vue';
import CardHeader from '@/components/ui/card/CardHeader.vue';
import CardTitle from '@/components/ui/card/CardTitle.vue';
import { CardContent, CardDescription } from '@/components/ui/card';
import { auth } from '@/lib/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from 'vue-router';

const router = useRouter()

const validationSchema = toTypedSchema(z.object({
  email: z.string().email(),
  password: z.string()
}))


const { handleSubmit, isSubmitting } = useForm({
  validationSchema
})

const onSubmit = handleSubmit(async ({ email, password }) => {

  try {
    await signInWithEmailAndPassword(auth, email, password)
    router.push("/dashboard")

  } catch (e) {
    console.error(e)
  }
})
</script>
<template>
  <Card class="w-full max-w-120">

    <CardHeader class="text-center">
      <CardTitle>Welcome back</CardTitle>
      <CardDescription>Enter your credentials to access your account</CardDescription>
    </CardHeader>
    <CardContent>

      <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
        <FormField v-slot="{ componentField }" name="email">
          <FormItem>
            <FormLabel>Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="name@example.com" v-bind="componentField" />
            </FormControl>

            <FormMessage />
          </FormItem>
        </FormField>
        <FormField v-slot="{ componentField }" name="password">
          <FormItem>
            <FormLabel>Password</FormLabel>
            <FormControl>
              <Input type="password" placeholder="Your password" v-bind="componentField" />
            </FormControl>

            <FormMessage />
          </FormItem>
        </FormField>

        <Button type="submit" size="lg">
          Sign In <span class="animate-spin border-4 border-neutral-300 border-t-white w-6 h-6 rounded-full "
            v-if="isSubmitting"> </span>
        </Button>

      </form>
    </CardContent>



  </Card>

</template>
<style lang="scss"></style>
