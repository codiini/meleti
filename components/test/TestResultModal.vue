<template>
  <UModal v-model="props.isOpen" @close="closeModal" prevent-close>
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <h3 class="text-xl font-semibold">Test Results</h3>
          <UIcon
            size="28"
            name="i-heroicons-check-badge-20-solid"
            class="text-green-500"
          />
        </div>
      </template>

      <div class="flex flex-col gap-2">
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-check-circle" class="text-green-500" />
          <span>Correct Answers: {{ props.correctAnswers }}</span>
        </div>
        <div class="flex items-center gap-2">
          <UIcon name="i-heroicons-x-circle" class="text-red-500" />
          <span>Wrong Answers: {{ props.wrongAnswers }}</span>
        </div>

        <p class="mb-2">
          You scored {{ props.score }} out of {{ props.totalQuestions }} ({{
            (props.score / props.totalQuestions) * 100
          }}%)
        </p>

        <div>
          <UButton to="/dashboard/tests" color="primary">
            Go Back to Test Dashboard
          </UButton>
        </div>
      </div>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const props = defineProps<{
  isOpen: boolean;
  score: number;
  totalQuestions: number;
  duration: number;
  correctAnswers: number;
  wrongAnswers: number;
}>();

const emit = defineEmits<{
  (event: "close"): void;
}>();

const closeModal = () => {
  emit("close");
};
</script>
