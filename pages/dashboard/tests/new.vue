<template>
  <div class="ml-64 p-8">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">Create New Test</h1>

    <UCard class="mb-8 pb-40">
      <template #header>
        <h2 class="text-xl font-semibold">Create New Test</h2>
      </template>
      <form @submit.prevent="handleTestCreation" class="space-y-6">
        <div class="grid grid-cols-2 gap-y-10 gap-x-6">
          <UFormGroup label="Title" name="title">
            <UInput
              type="text"
              v-model="formState.title"
              placeholder="Eg: Calculus Practice"
            />
          </UFormGroup>
          <UFormGroup label="Choose Course" name="title">
            <USelect
              @change="fetchCourseFiles"
              :loading="loadingStates.courseFileDetails"
              option-attribute="title"
              value-attribute="id"
              v-model="formState.selectedCourse"
              :options="coursesList"
              placeholder="Select a Course"
            />
          </UFormGroup>

          <!-- Question Type -->
          <UFormGroup label="Question type" name="questionType">
            <USelect
              v-model="formState.questionType"
              :options="questionTypeOptions"
              placeholder="Select question type"
              class="bg-gray-800 text-white"
            />
          </UFormGroup>

          <!-- Difficulty -->
          <UFormGroup label="Difficulty" name="difficulty">
            <USelect
              v-model="formState.difficulty"
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
                <UBadge color="gray" class="ml-1">{{
                  formState.maxQuestions
                }}</UBadge>
              </UTooltip>
            </template>
            <URange
              v-model="formState.maxQuestions"
              :step="5"
              :min="5"
              :max="20"
            />
          </UFormGroup>

          <UFormGroup label="Test Duration" name="duration">
            <USelect
              v-model="formState.duration"
              :options="durationOptions"
              option-attribute="label"
              placeholder="Select test duration"
            />
          </UFormGroup>

          <UFormGroup label="Course Files">
            <div
              v-if="
                formState.selectedCourse && formState.courseFiles.length > 0
              "
              class="space-y-2"
            >
              <URadioGroup
                v-model="formState.selectedFiles"
                value-attribute="id"
                option-attribute="file_name"
                :options="formState.courseFiles"
              />
            </div>
            <p
              v-else-if="
                formState.selectedCourse && formState.courseFiles.length === 0
              "
              class="text-gray-500 italic"
            >
              No files uploaded for this course yet.
            </p>
            <p v-else class="text-gray-500 italic">
              Select a course to view available files.
            </p>
          </UFormGroup>
        </div>

        <UButton
          type="submit"
          color="primary"
          :disabled="!formState.selectedCourse"
        >
          Create Test
        </UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { fetchCourses, coursesList } = useCourses();
// const toast = useToast();
const supabase = useSupabaseClient();

// const questions = ref(null);

const formState = reactive({
  title: "",
  difficulty: "medium",
  maxQuestions: 20,
  questionType: "multiple_choice",
  courseFiles: [],
  selectedCourse: "",
  selectedFiles: [],
  duration: 1800,
});

const loadingStates = reactive({
  fileUploads: false,
  courseFileDetails: false,
  testCreation: false,
});

const questionTypeOptions = [
  {
    label: "Multiple Choice",
    value: "multiple_choice",
  },
  {
    label: "True or False",
    value: "true_or_false",
    disabled: true,
  },
  {
    label: "Open Ended",
    value: "open_ended",
    disabled: true,
  },
];

const durationOptions = [
  { value: 900, label: "15 minutes" },
  { value: 1800, label: "30 minutes" },
  { value: 2700, label: "45 minutes" },
  { value: 3600, label: "1 hour" },
  { value: 5400, label: "1.5 hours" },
  { value: 7200, label: "2 hours" },
];

const difficultyOptions = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
];

const handleTestCreation = async () => {
  loadingStates.testCreation = true;

  
  // const { data, error } = await supabase
  //   .from("tests")
  //   .insert([
  //     {
  //       course_id: formState.selectedCourse,
  //       title: formState.title,
  //       questions: questions,
  //     },
  //   ])
  //   .select();

  // if (error) {
  //   console.error("Error creating test:", error);
  // } else {
  //   console.log("Test created successfully:", data);
  // }
  // loadingStates.testCreation = true;
};

const fetchCourseFiles = async () => {
  loadingStates.courseFileDetails = true;
  const { data, error } = await supabase
    .from("course_files")
    .select("*")
    .eq("course_id", formState.selectedCourse);

  if (error) {
    console.error("Error fetching Study files:", error);
  } else {
    formState.courseFiles = data;
  }
  loadingStates.courseFileDetails = false;
};

// const sendToServer = async (base64Data: string | []) => {
//   const response = await $fetch("/api/ai/gemini", {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//     },
//     body: {
//       documents: base64Data,
//       questionType: questionType.value,
//       maxQuestions: maxQuestions.value,
//     },
//   });

//   return response.aggregatedResponse.candidates[0].content.parts[0].text;
// };

onMounted(async () => {
  await fetchCourses();
});
</script>
