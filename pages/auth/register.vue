<template>
  <div>
    <UForm
      ref="form"
      :schema="schema"
      :state="formState"
      class="space-y-4 min-h-screen w-full flex items-center justify-center"
      @submit="handleRegister"
    >
      <UCard class="w-full max-w-md">
        <template #header>
          <h1 class="text-2xl font-bold text-center dark:text-gray-100">
            Create your Account
          </h1>
        </template>
        <form @submit.prevent="handleRegister" class="space-y-4">
          <UFormGroup label="Full Name" name="fullName">
            <UInput v-model="formState.fullName" placeholder="John Doe" />
          </UFormGroup>
          <UFormGroup label="Email" name="email">
            <UInput
              v-model="formState.email"
              type="email"
              placeholder="your@email.com"
            />
          </UFormGroup>
          <UFormGroup label="Password" name="password">
            <UInput
              v-model="formState.password"
              type="password"
              placeholder="••••••••"
            />
          </UFormGroup>
          <UFormGroup label="Confirm Password" name="confirmPassword">
            <UInput
              v-model="formState.confirmPassword"
              type="password"
              placeholder="••••••••"
            />
          </UFormGroup>
          <UButton type="submit" color="primary" :loading="isLoading" block
            >Register</UButton
          >
        </form>
        <template #footer>
          <p class="text-center text-sm text-gray-600">
            Already have an account?
            <NuxtLink to="/auth/login" class="text-primary-600 hover:underline"
              >Log in</NuxtLink
            >
          </p>
        </template>
      </UCard>
    </UForm>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";

const supabase = useSupabaseClient();
const toast = useToast();

definePageMeta({
  layout: "auth",
});

useHead({
  title: "Meleti | Register",
});

const formState = reactive({
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
});

const form = ref(null);

const schema = z.object({
  email: z.string().email("Invalid email"),
  password: z
    .string()
    .min(8, "Must be at least 8 characters")
    .refine((value: string) => {
      formState.password = value;
      return true;
    }),
  confirmPassword: z
    .string()
    .min(8, "Re-enter your password to confirm it")
    .refine(
      (value: string) => value === formState.password,
      "Passwords do not match"
    ),
});

const isLoading = ref(false);

const handleRegister = async () => {
  form.value.validate();
  isLoading.value = true;
  const { error } = await supabase.auth.signUp({
    password: formState.password,
    email: formState.email,
    options: {
      data: {
        firstname: formState.fullName.split(" ")[0],
        surname: formState.fullName.split(" ")[1],
      },
      emailRedirectTo: `${window.location.origin}/auth/confirm`,
    },
  });
  isLoading.value = false;
  if (error) {
    return toast.add({
      title: "An error occurred",
      description: "Please fill in the form to try again",
      icon: "i-heroicons-exclamation-circle",
      color: "red",
    });
  }
  toast.add({
    title: "Signup Successful!",
    description: "Open the email we sent you to verify your account!",
    icon: "i-heroicons-check-badge-solid",
  });

  clearForm();
};

const clearForm = () => {
  formState.fullName = "";
  formState.email = "";
  formState.password = "";
  formState.confirmPassword = "";
};
</script>
