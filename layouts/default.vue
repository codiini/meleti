<template>
  <div class="min-h-screen bg-gray-100">
    <div class="flex relative mb-16 lg:mb-0">
      <TheSideBar :isOpen="isSidebarOpen" @close="closeSidebar"></TheSideBar>
      <div class="flex items-center">
        <UButton
          @click="toggleSidebar"
          :icon="isSidebarOpen ? 'i-heroicons-x-mark' : 'i-heroicons-bars-3'"
          variant="ghost"
          size="md"
          class="text-black lg:hidden absolute top-6 left-2 z-[55] transition-all duration-300"
          :class="isSidebarOpen ? 'translate-x-64' : 'translate-x-0'"
        />
        <UserMenu class="absolute top-0 right-0"></UserMenu>
      </div>
    </div>
    <slot />
  </div>
</template>

<script setup>
import UserMenu from "@/components/dashboard/UserMenu.vue";

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebar = () => {
  if (window.innerWidth < 1024) {
    isSidebarOpen.value = false;
  }
};

onMounted(() => {
  isSidebarOpen.value = window.innerWidth >= 1024;
  window.addEventListener('resize', () => {
    isSidebarOpen.value = window.innerWidth >= 1024;
  });
});

onUnmounted(() => {
  window.removeEventListener('resize', () => {
    isSidebarOpen.value = window.innerWidth >= 1024;
  });
});
</script>
