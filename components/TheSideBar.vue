<template>
  <UVerticalNavigation
    :ui="{
      active: 'border-current font-medium',
      size: 'text-md',
      wrapper: 'pt-10 h-full px-2 bg-gray-300 z-50',
      base: 'my-4 py-3',
    }"
    class="fixed w-64 shadow-lg"
    :class="{
      'fixed w-64 shadow-lg z-40 transition-transform duration-300 ease-in-out transform': true,
      '-translate-x-full': !isOpen,
      'translate-x-0': isOpen,
    }"
    :links="links"
  >
    <template #default="{ link }">
      <span class="relative">{{ link.label }}</span>
    </template>
  </UVerticalNavigation>
</template>

<script lang="ts" setup>
defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (e: "close"): void;
}>();

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
  {
    label: "Interakt",
    icon: "i-heroicons-chat-bubble-left-right-20-solid",
    to: "",
    badge: "Coming Soon",
  },
];
</script>
