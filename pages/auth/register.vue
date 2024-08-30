<template>
  <div class="min-h-screen flex items-center justify-center">
    <UCard class="w-full max-w-md">
      <template #header>
        <h1 class="text-2xl font-bold text-center text-gray-100">
          Create your Account
        </h1>
      </template>
      <form @submit.prevent="handleRegister" class="space-y-4">
        <UFormGroup label="Full Name" name="fullName">
          <UInput v-model="fullName" placeholder="John Doe" />
        </UFormGroup>
        <UFormGroup label="Email" name="email">
          <UInput v-model="email" type="email" placeholder="your@email.com" />
        </UFormGroup>
        <UFormGroup label="Password" name="password">
          <UInput v-model="password" type="password" placeholder="••••••••" />
        </UFormGroup>
        <UFormGroup label="Confirm Password" name="confirmPassword">
          <UInput
            v-model="confirmPassword"
            type="password"
            placeholder="••••••••"
          />
        </UFormGroup>
        <!-- <UCheckbox
          v-model="agreeTerms"
          label="I agree to the Terms and Conditions"
        /> -->
        <UButton type="submit" color="primary" block :disabled="!agreeTerms"
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
  </div>
</template>

<script setup>
definePageMeta({
  layout: "auth",
});

const fullName = ref("");
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const agreeTerms = ref(false);

const handleRegister = () => {
  console.log("Registration attempt", {
    fullName: fullName.value,
    email: email.value,
    password: password.value,
  });
};
</script>
