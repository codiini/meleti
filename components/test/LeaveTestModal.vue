<template>
  <UModal
    v-model="props.isOpen"
    title="Leave Test"
    description="Are you sure you want to leave the test?"
    @close="closeModal"
    prevent-clos
  >
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <h3 class="text-xl font-semibold">Leave Test</h3>
          <UIcon
            size="28"
            name="i-heroicons-question-mark-circle"
            class="text-red-500"
          />
        </div>
      </template>

      <p class="dark:text-gray-500">
        Are you sure you want to leave the test without submitting your answers?
      </p>

      <template #footer>
        <div class="flex items-center gap-4">
          <UButton color="red" variant="ghost" @click="leaveTest"
            >Leave</UButton
          >
          <UButton color="primary" @click="closeModal"> Stay </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  (event: "close"): void;
  (event: "leave"): void;
}>();

const closeModal = () => {
  emit("close");
};

const leaveTest = () => {
  emit("leave");
};
</script>
