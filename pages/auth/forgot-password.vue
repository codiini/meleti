<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-center text-gray-100">
          Reset Your Password
        </h1>
      </template>
      <p class="text-gray-400 mb-4">
        Enter your email address and we'll send you a link to reset your
        password.
      </p>
      <form @submit.prevent="handleResetPassword" class="space-y-4">
        <UFormGroup label="Email" name="email">
          <UInput v-model="email" type="email" placeholder="your@email.com" />
        </UFormGroup>
        <UButton type="submit" color="primary" block>Send Reset Link</UButton>
      </form>
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

<script setup>
definePageMeta({
  layout: "auth",
});

const email = ref("");

const handleResetPassword = () => {
  console.log("Password reset attempt", { email: email.value });
};
</script>
