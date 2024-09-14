<template>
  <UCard class="w-full max-w-md">
    <template #header>
      <h1 class="text-2xl font-bold text-center text-gray-100">
        Set New Password
      </h1>
    </template>

    <UForm
      ref="form"
      :schema="schema"
      :state="formState"
      @submit.prevent="handleSubmit"
      class="space-y-4"
    >
      <UFormGroup label="New Password" name="password">
        <UInput
          v-model="formState.password"
          type="password"
          placeholder="Enter your new password"
          autocomplete="new-password"
        />
      </UFormGroup>
      <UFormGroup label="Confirm New Password" name="confirmPassword">
        <UInput
          v-model="formState.confirmPassword"
          type="password"
          placeholder="Confirm your new password"
          autocomplete="new-password"
        />
      </UFormGroup>
      <UButton type="submit" color="primary" block :loading="isLoading">
        Reset Password
      </UButton>
    </UForm>

    <template #footer>
      <p class="text-center text-sm text-gray-400">
        Remember your password?
        <NuxtLink to="/auth/login" class="text-primary-400 hover:underline">
          Log in
        </NuxtLink>
      </p>
    </template>
  </UCard>
</template>

<script setup lang="ts">
import { z } from "zod";

const supabase = useSupabaseClient();
const toast = useToast();

definePageMeta({
  layout: "auth",
});

const isLoading = ref(false);
const form = ref();

const formState = reactive({
  password: "",
  confirmPassword: "",
});

const schema = z.object({
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

const handleSubmit = async () => {
  form.value.validate();
  isLoading.value = true;
  try {
    const { error } = await supabase.auth.updateUser({
      password: formState.password,
    });
    await supabase.auth.signOut();
    if (error) {
      return toast.add({
        title: "Password Reset Failed",
        description:
          error.message ||
          "An error occurred while resetting your password. Please try again.",
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
    }

    toast.add({
      title: "Password Reset Successful",
      description:
        "Your password has been successfully reset. You can now log in with your new password.",
      icon: "i-heroicons-check-circle",
      callback: () => navigateTo("/auth/login"),
    });
  } catch (error) {
    toast.add({
      title: "Password Reset Failed",
      description:
        error.message ||
        "An error occurred while resetting your password. Please try again.",
      icon: "i-heroicons-exclamation-circle",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};
</script>
