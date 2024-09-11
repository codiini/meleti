<template>
  <div class="ml-64 p-8 relative">
    <div class="flex flex-col max-w-fit">
      <UButton
        to="/dashboard/tests"
        icon="i-heroicons-arrow-long-left-16-solid"
        color="black"
        variant="ghost"
        class="text-gray-900 w-full"
      >
        Go Back
      </UButton>
      <div class="px-6">
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
    <!-- Questions List -->
    <div
      v-else-if="testInfo.questions.length"
      class="flex items-start justify-start"
    >
      <div class="space-y-4 p-6">
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
              <UButton
                disabled
                icon="i-heroicons-pencil-square"
                color="primary"
                variant="outline"
              />

              <UButton
                disabled
                icon="i-heroicons-flag"
                color="primary"
                variant="outline"
              />

              <UButton
                @click="clearSelectedOption(id)"
                icon="i-heroicons-arrow-uturn-left-solid"
                color="primary"
                variant="outline"
              />
            </div>
          </template>
        </UCard>
        <div class="mt-8 flex items-center justify-center">
          <UButton
            class="w-40 flex items-center justify-center"
            @click="submitAnswers"
            color="primary"
            size="xl"
            :disabled="!allQuestionsAnswered"
          >
            Submit Answers
          </UButton>
        </div>
      </div>

      <div class="sticky top-20">
        <div
          class="text-2xl text-gray-900 font-bold rounded border-2 border-gray-900 p-2 w-40 flex items-center justify-center"
          :class="{
            'bg-green-500': remainingTime > 0,
            'bg-red-500': remainingTime <= 59,
          }"
        >
          {{ formattedTime }}
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
const remainingTime = ref();
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
    .eq("id", route.params.id);

  if (error) {
    console.error(error);
  }
  Object.assign(testInfo, data[0]);
  testTimer.value = data[0].duration;
};

const clearSelectedOption = (id: TypeSelectedOption) => {
  delete userAnswers.value[id];
};

const userCanLeave = ref(false);
const leaveTest = () => {
  userCanLeave.value = true;
  navigateTo("/dashboard/tests");
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
      isLeaveTestModalOpen.value = true;
      return false;
    }

    return true;
  }
);
</script>
