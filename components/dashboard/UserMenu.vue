<template>
  <div class="p-6 dark:text-gray-900">
    <div class="flex justify-between items-center mb-8">
      <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
        <UButton color="black" variant="outline">
          <UAvatar :alt="joinName" size="sm"></UAvatar>
        </UButton>
      </UDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
const toast = useToast();
const client = useSupabaseClient();
const user = useSupabaseUser();

const logout = async () => {
  const { error } = await client.auth.signOut();
  if (error) {
    return toast.add({
      title: "Error while logging out",
      icon: "i-heroicons-check-badge-solid",
      color: "red",
    });
  }
  toast.add({
    title: "Log out Successful!",
    icon: "i-heroicons-check-badge-solid",
  });
  await navigateTo("/auth/login");
};

const items = [
  [
    {
      label: "Profile",
      icon: "i-heroicons-user-circle-20-solid",
      to: "/dashboard/profile",
    },
    {
      label: "Logout",
      icon: "i-heroicons-arrow-right-circle-20-solid",
      click: () => logout(),
    },
  ],
];

const joinName = computed(
  () =>
    `${user.value?.user_metadata.firstname} ${user.value?.user_metadata.surname}`
);
</script>
