<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <h1 class="text-2xl font-bold text-center dark:text-gray-100">
        Login to your account
      </h1>
    </template>
    <UForm
      ref="form"
      :schema="schema"
      :state="formState"
      class="space-y-4"
      @submit.prevent="handleLogin"
    >
      <UFormGroup label="Email" name="email">
        <UInput
          v-model="formState.email"
          type="email"
          placeholder="your@email.com"
        />
      </UFormGroup>
      <UFormGroup label="Password" name="password">
        <div class="relative">
          <UInput
            v-model="formState.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="••••••••"
          />
          <UButton
            :icon="showPassword ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
            variant="ghost"
            color="gray"
            size="xs"
            class="absolute right-2 top-1/2 -translate-y-1/2"
            @click="showPassword = !showPassword"
          />
        </div>
      </UFormGroup>
      <div class="flex items-center justify-between">
        <UCheckbox v-model="formState.rememberMe" label="Remember me" />
        <NuxtLink
          to="/auth/forgot-password"
          class="text-sm text-primary-600 hover:underline"
        >
          Forgot password?
        </NuxtLink>
      </div>
      <UButton type="submit" color="primary" :loading="isLoading" block
        >Log In</UButton
      >
    </UForm>
    <template #footer>
      <p class="text-center text-sm text-gray-600">
        Don't have an account?
        <NuxtLink to="/auth/register" class="text-primary-600 hover:underline"
          >Register</NuxtLink
        >
      </p>
    </template>
  </UCard>
</template>

<script lang="ts" setup>
import { z } from "zod";

const supabase = useSupabaseClient();
const toast = useToast();

definePageMeta({
  layout: "auth",
});

useHead({
  title: "Meleti | Log In",
});

const isLoading = ref(false);
const showPassword = ref(false);
const form = ref();

const formState = reactive({
  email: "",
  password: "",
  rememberMe: false,
});

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string(),
});

const handleLogin = async () => {
  form.value.validate();
  isLoading.value = true;
  const { error } = await supabase.auth.signInWithPassword({
    email: formState.email,
    password: formState.password,
  });

  isLoading.value = false;
  if (error)
    return toast.add({
      title: `${error.message}` || "An error occurred",
      icon: "i-heroicons-exclamation-circle",
      color: "red",
    });

  toast.add({
    title: "Sign in Successful",
    description: "Redirecting you to your dashboard...",
    icon: "i-heroicons-check-badge-solid",
    timeout: 2000,
    callback: () => navigateTo("/dashboard"),
  });
};
</script>
