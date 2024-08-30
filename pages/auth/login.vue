<template>
  <div class="min-h-screen flex items-center justify-center">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-center text-gray-100">
          Login to your account
        </h1>
      </template>
      <form @submit.prevent="handleLogin" class="space-y-4">
        <UFormGroup label="Email" name="email">
          <UInput v-model="email" type="email" placeholder="your@email.com" />
        </UFormGroup>
        <UFormGroup label="Password" name="password">
          <UInput v-model="password" type="password" placeholder="••••••••" />
        </UFormGroup>
        <div class="flex items-center justify-between">
          <UCheckbox v-model="rememberMe" label="Remember me" />
          <NuxtLink
            to="/auth/forgot-password"
            class="text-sm text-primary-600 hover:underline"
          >
            Forgot password?
          </NuxtLink>
        </div>
        <UButton type="submit" color="primary" block>Log In</UButton>
      </form>
      <template #footer>
        <p class="text-center text-sm text-gray-600">
          Don't have an account?
          <NuxtLink to="/auth/register" class="text-primary-600 hover:underline"
            >Register</NuxtLink
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
const password = ref("");
const rememberMe = ref(false);

const handleLogin = () => {
  console.log("Login attempt", {
    email: email.value,
    password: password.value,
    rememberMe: rememberMe.value,
  });
};
</script>
