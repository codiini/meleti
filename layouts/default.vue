<template>
  <div class="min-h-screen bg-gray-100">
    <div class="flex relative">
      <TheSideBar></TheSideBar>
      <UserMenu class="absolute right-0"></UserMenu>
    </div>
    <slot />
  </div>
</template>

<script setup>
import UserMenu from "@/components/dashboard/UserMenu.vue";
</script>
