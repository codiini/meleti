<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-center dark:text-gray-100">
          Reset Your Password
        </h1>
      </template>
      <p class="text-gray-400 mb-4">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>
      <UForm
        ref="form"
        :schema="schema"
        :state="formState"
        @submit.prevent="handleResetPassword"
        class="space-y-4"
      >
        <UFormGroup label="Email" name="email">
          <UInput
            v-model="formState.email"
            type="email"
            placeholder="your@email.com"
          />
        </UFormGroup>
        <UButton type="submit" color="primary" :loading="isLoading" block
          >Send Reset Link</UButton
        >
      </UForm>
      <template #footer>
        <p class="text-center text-sm text-gray-600">
          Remember your password?
          <NuxtLink to="/auth/login" class="text-primary-600 hover:underline"
            >Log in</NuxtLink
          >
        </p>
      </template>
    </UCard>
  </div>
</template>

<script setup lang="ts">
import { z } from "zod";

const supabase = useSupabaseClient();
const toast = useToast();

definePageMeta({
  layout: "auth",
});

const formState = reactive({
  email: "",
});
const isLoading = ref(false);
const form = ref();

const schema = z.object({
  email: z.string().email("Invalid email"),
});

const handleResetPassword = async () => {
  form.value.validate();
  isLoading.value = true;
  const { error } = await supabase.auth.resetPasswordForEmail(formState.email, {
    redirectTo: `${window.location.origin}/auth/new-password`,
  });
  isLoading.value = false;
  if (error) {
    return toast.add({
      title: `${error.message}` || "An error occurred",
      icon: "i-heroicons-exclamation-circle",
      color: "red",
    });
  }
  toast.add({
    title: `We've sent you an email!`,
    description:
      "Check your inbox for further instructions to reset your password.",
    icon: "i-heroicons-check-badge-solid",
  });
};
</script>
