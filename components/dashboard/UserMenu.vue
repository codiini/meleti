<template>
  <div class="p-6 text-gray-900">
    <!-- User menu -->
    <div class="flex justify-between items-center mb-8">
      <UDropdown :items="items" :popper="{ placement: 'bottom-start' }">
        <UButton color="black" variant="outline" icon="i-heroicons-user-circle">
          Iniubong Obonguko
        </UButton>
      </UDropdown>
    </div>
  </div>
</template>

<script setup lang="ts">
const toast = useToast();
const client = useSupabaseClient();

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
    title: "Logging you out...",
    icon: "i-heroicons-check-badge-solid",
  });
  setTimeout(async () => {
    await navigateTo("/auth/login");
  }, 1000);
};

const items = [
  [
    {
      label: "Profile",
      avatar: {
        src: "https://avatars.githubusercontent.com/u/739984?v=4",
      },
    },
  ],
  [
    {
      label: "Edit",
      icon: "i-heroicons-pencil-square-20-solid",
      shortcuts: ["E"],
      click: () => {
        console.log("Edit");
      },
    },
    {
      label: "Duplicate",
      icon: "i-heroicons-document-duplicate-20-solid",
      shortcuts: ["D"],
      disabled: true,
    },
  ],
  [
    {
      label: "Archive",
      icon: "i-heroicons-archive-box-20-solid",
    },
    {
      label: "Logout",
      icon: "i-heroicons-arrow-right-circle-20-solid",
      click: () => logout(),
    },
  ],
];
</script>
