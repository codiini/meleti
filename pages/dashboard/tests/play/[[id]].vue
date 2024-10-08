<template>
  <div class="relative lg:ml-64 lg:p-8 p-4">
    <div class="flex flex-col max-w-fit my-6">
      <UButton
        to="/dashboard/tests"
        icon="i-heroicons-arrow-long-left-16-solid"
        color="black"
        variant="ghost"
        class="text-gray-900 w-full"
      >
        Go Back
      </UButton>
      <div class="px-6 py-3">
        <h1 class="text-3xl font-bold text-gray-800">
          {{ testInfo.title }}
        </h1>
        <p>
          {{ testInfo.description }}
        </p>
      </div>
    </div>

    <!-- Add loading state -->
    <TestPageSkeletonLoader v-if="isLoadingQuestions" />
    <!-- Questions List and Timer -->
    <div
      v-else-if="testInfo.questions.length"
      class="flex flex-col lg:flex-row"
    >
      <!-- Timer (Sticky on all screens) -->
      <div
        class="w-full lg:w-40 lg:order-2 lg:ml-4 mb-4 lg:mb-0 sticky top-0 z-10 bg-white lg:bg-transparent"
      >
        <div class="sticky top-4 z-10">
          <div
            class="text-2xl text-gray-900 font-bold rounded border-2 border-gray-900 p-2 w-full flex items-center justify-center"
            :class="{
              'bg-red-500': testTimer <= 119,
            }"
          >
            {{ formattedTime }}
          </div>
        </div>
      </div>

      <!-- Questions -->
      <div class="flex-1 lg:order-1 space-y-4">
        <UCard
          v-for="({ id, question, options }, index) in testInfo.questions"
          :key="id"
          class="rounded-lg"
        >
          <template #header>
            <div class="text-xl font-semibold">
              {{ index + 1 }}). {{ question }}
            </div>
          </template>

          <div class="space-y-4">
            <template
              v-for="{ value, label } in options"
              :key="`${id}-${value}`"
            >
              <URadio
                v-model="userAnswers[id]"
                :label="`${value}). ${label}`"
                :value="value"
                class="items-center"
              />
            </template>
          </div>

          <template #footer>
            <div class="flex items-center justify-start gap-x-2">
              <UTooltip text="Flag this question">
                <UButton
                  disabled
                  icon="i-heroicons-flag"
                  color="primary"
                  variant="outline"
                />
              </UTooltip>
            </div>
          </template>
        </UCard>

        <!-- Submit Button -->
        <div class="mt-8 flex items-center justify-center">
          <UButton
            class="w-full flex items-center justify-center sm:w-auto px-8"
            @click="submitAnswers"
            color="primary"
            size="xl"
            :disabled="!allQuestionsAnswered"
          >
            Submit Answers
          </UButton>
        </div>
      </div>
    </div>
  </div>

  <TestResultModal
    :isOpen="showResults"
    :score="testScore"
    :totalQuestions="testInfo.questions.length"
    :duration="testInfo.duration"
    :correctAnswers="testScore"
    :wrongAnswers="testInfo.questions.length - testScore"
  />

  <TestLeaveTestModal
    :isOpen="isLeaveTestModalOpen"
    @close="isLeaveTestModalOpen = false"
    @leave="leaveTest"
  />
</template>

<script setup lang="ts">
import type {
  RouteLocationNormalizedLoadedGeneric,
  RouteLocationNormalizedGeneric,
} from "#vue-router";

import { useTests } from "~/composables/useTests";
import type { Question, TestInfo } from "~/types/questions";

type TypeSelectedOption = keyof typeof userAnswers.value;

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const { saveTestResults } = useTests();
const route = useRoute();

const isLoadingQuestions = ref(false);

const testInfo: TestInfo = reactive({
  id: "",
  duration: 0,
  title: "",
  description: "",
  questions: [],
});

const testTimer = ref(0);

const startTime = ref(0);
const endTime = ref(0);

const testScore = ref(0);
const showResults = ref(false);
const isQuizCompleted = ref(false);

const userAnswers = ref({});
const isLeaveTestModalOpen = ref(false);

const formattedTime = computed(() => {
  const minutes = Math.floor(testTimer.value / 60);
  const seconds = testTimer.value % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
});

const allQuestionsAnswered = computed(() => {
  return Object.keys(userAnswers.value).length === testInfo.questions.length;
});

let timer;

onMounted(async () => {
  try {
    isLoadingQuestions.value = true;
    await fetchTestInfo();
    initializeTimer();
  } catch (error) {
    console.error(error);
  } finally {
    isLoadingQuestions.value = false;
  }
});

onUnmounted(() => {
  removeTimer();
});

const initializeTimer = () => {
  const storedStartTime = localStorage.getItem(`${route.params.id}_s`);
  const storedEndTime = localStorage.getItem(`${route.params.id}_e`);

  if (storedStartTime && storedEndTime) {
    startTime.value = parseInt(storedStartTime);
    endTime.value = parseInt(storedEndTime);
    const now = Date.now();
    const remainingDuration = Math.max(0, endTime.value - now);
    testTimer.value = Math.floor(remainingDuration / 1000);
  } else {
    startTime.value = Date.now();
    endTime.value = startTime.value + testTimer.value * 1000;
    localStorage.setItem(`${route.params.id}_s`, startTime.value.toString());
    localStorage.setItem(`${route.params.id}_e`, endTime.value.toString());
  }

  timer = setInterval(() => {
    const now = Date.now();
    const remainingDuration = Math.max(0, endTime.value - now);
    testTimer.value = Math.floor(remainingDuration / 1000);

    if (testTimer.value <= 0) {
      removeTimer();
      submitAnswers();
    }
  }, 1000);
};

const removeTimer = () => {
  clearInterval(timer);
  localStorage.removeItem(`${route.params.id}_s`);
  localStorage.removeItem(`${route.params.id}_e`);
};

const submitAnswers = () => {
  if (testScore.value) {
    return;
  }

  const timeTaken = Date.now() - startTime.value;
  const timeTakenInSeconds = Math.floor(timeTaken / 1000);

  testInfo.questions.map((question: Question) => {
    const correctAnswer = question.correctAnswer;
    const userAnswer = userAnswers.value[
      question.id as TypeSelectedOption
    ] as string;

    const isCorrect = userAnswer === correctAnswer;
    if (isCorrect) {
      testScore.value++;
    }
  });
  showAnswers(timeTakenInSeconds);
};

const showAnswers = async (timeTakenInSeconds: number) => {
  const totalQuestions = testInfo.questions.length;
  const scorePercentage = Math.round((testScore.value / totalQuestions) * 100);

  isQuizCompleted.value = true;

  await saveTestResults({
    testId: testInfo.id,
    score: scorePercentage,
    totalQuestions,
    correctAnswers: testScore.value,
    timeTaken: timeTakenInSeconds,
    duration: testInfo.duration,
  });

  showResults.value = true;
};

const fetchTestInfo = async () => {
  const { data, error } = await supabase
    .from("tests")
    .select("*")
    .eq("id", route.params.id)
    .eq("created_by", user.value?.id);

  if (error) {
    console.error(error);
  }
  Object.assign(testInfo, data[0]);
  testTimer.value = data[0].duration;
};

const intendedRoute = ref("");

const userCanLeave = ref(false);
const leaveTest = () => {
  userCanLeave.value = true;
  if (intendedRoute.value) {
    navigateTo(intendedRoute.value);
  } else {
    navigateTo("/dashboard/tests");
  }
};

onBeforeRouteLeave(
  (
    to: RouteLocationNormalizedGeneric,
    from: RouteLocationNormalizedLoadedGeneric
  ) => {
    const currentRoute = useRoute();

    if (
      from.name === currentRoute.name &&
      !userCanLeave.value &&
      !isQuizCompleted.value
    ) {
      intendedRoute.value = to.fullPath;
      isLeaveTestModalOpen.value = true;
      return false;
    }

    return true;
  }
);
</script>
