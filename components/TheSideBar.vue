<template>
  <UVerticalNavigation
    :ui="{
      active: 'text-primary-200 border-current font-medium',
      size: 'text-md',
      wrapper: 'pt-10 h-full px-2 bg-gray-300',
      base: 'my-4 py-3',
    }"
    class="fixed w-64 shadow-lg"
    :links="links"
  >
    <template #default="{ link }">
      <span class="relative">{{ link.label }}</span>
    </template>
  </UVerticalNavigation>
</template>

<script lang="ts" setup>
const links = [
  {
    label: "Home",
    icon: "i-heroicons-home",
    to: "/dashboard",
  },
  {
    label: "Courses",
    icon: "i-heroicons-command-line",
    to: "/dashboard/courses",
  },
  {
    label: "Tests",
    icon: "i-heroicons-presentation-chart-bar",
    to: "/dashboard/tests",
  },
  {
    label: "Flash Cards",
    icon: "i-heroicons-rectangle-stack-20-solid",
    to: "",
    badge: "Coming Soon",
  },
];
</script>
