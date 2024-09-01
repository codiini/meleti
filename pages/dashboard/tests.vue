<template>
  <div class="ml-64 p-8">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">Create New Test</h1>

    <UCard class="mb-8 pb-40">
      <template #header>
        <h2 class="text-xl font-semibold">Create New Test</h2>
      </template>
      <form @submit.prevent="handleTestCreation" class="space-y-6">
        <div class="grid grid-cols-2 gap-y-10 gap-x-6">
          <UFormGroup label="Choose Course" name="title">
            <!-- <template v-if="loadingStates.courseFileDetails" #help>
              Hang on while we fetch your course files.
            </template> -->
            <USelect
              @change="fetchCourseFileDetails"
              :loading="loadingStates.courseFileDetails"
              option-attribute="title"
              value-attribute="id"
              v-model="selectedCourse"
              :options="coursesList"
              placeholder="Select a Course"
            />
          </UFormGroup>

          <!-- Question Type -->
          <UFormGroup label="Question type" name="questionType">
            <USelect
              v-model="questionType"
              :options="questionTypeOptions"
              placeholder="Select question type"
              class="bg-gray-800 text-white"
            />
          </UFormGroup>

          <!-- Difficulty -->
          <UFormGroup label="Difficulty" name="difficulty">
            <USelect
              v-model="difficulty"
              :options="difficultyOptions"
              placeholder="Select difficulty"
              class="bg-gray-800 text-white"
            />
          </UFormGroup>

          <!-- Max Questions -->
          <UFormGroup name="maxQuestions">
            <template #label>
              Max Questions
              <UTooltip text="Set the maximum number of questions">
                <UBadge color="gray" class="ml-1">{{ maxQuestions }}</UBadge>
              </UTooltip>
            </template>
            <URange v-model="maxQuestions" :step="5" :min="5" :max="50" />
          </UFormGroup>

          <UFormGroup
            v-if="courseFileDetails?.length"
            label="Select Course Files"
            name="courseFiles"
          >
            <div class="space-y-3">
              <template
                v-for="{ unique_file_name, file_name } in courseFileDetails"
                :key="unique_file_name"
              >
                <UCheckbox
                  v-model="selectedCourseFiles"
                  :name="file_name"
                  :label="file_name"
                  :value="unique_file_name"
                />
              </template>
            </div>
          </UFormGroup>
        </div>

        <!-- Other test configuration options can be added here -->
        <UButton type="submit" color="primary" :disabled="!selectedCourse">
          Create Test
        </UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup>
const { fetchCourses, coursesList, getCourseFileDetails } = useCourses();
const supabase = useSupabaseClient();

const isLoading = ref(false);

const courseFileDetails = ref(null);
const selectedCourse = ref(null);
const selectedCourseFiles = ref([]);
const questionType = ref("multiple_choice");
const difficulty = ref("medium");
const maxQuestions = ref(20);
const loadingStates = reactive({
  courseFileDetails: false,
});

const questionTypeOptions = [
  {
    label: "Multiple Choice",
    value: "multiple_choice",
  },
  {
    label: "True or False",
    value: "true_or_false",
  },
  {
    label: "Open Ended",
    value: "open_ended",
  },
];

const difficultyOptions = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

const maxQuestionsOptions = [{ label: "Auto", value: "Auto" }];

const handleTestCreation = () => {
  isLoading.value = true;
};

const fetchCourseFileDetails = async () => {
  loadingStates.courseFileDetails = true;
  courseFileDetails.value = await getCourseFileDetails(selectedCourse.value);
  loadingStates.courseFileDetails = false;
};

async function retrieveFiles() {
  // Generate pre-signed URLs for each file
  const filesWithUrls = await Promise.all(
    selectedCourseFiles.map(async (file) => {
      const presignedUrl = await $fetch("/api/files/retrieve", {
        method: "PUT",
        body: {
          fileName: file,
        },
        headers: {
          "Content-Type": "application/json",
        },
      });
      console.log(presignedUrl);
      return { ...file, presignedUrl };
    })
  );

  console.log(filesWithUrls);
  return filesWithUrls;
}

onMounted(async () => {
  await fetchCourses();
});
</script>
