<template>
  <div class="ml-64 p-8">
    <h2 class="text-3xl font-bold mb-8 text-gray-800">Create New Test</h2>

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
          <UFormGroup label="Test Type" name="testType">
            <USelect
              v-model="formState.testType"
              :options="testTypeOptions"
              placeholder="Select question type"
            />
          </UFormGroup>

          <!-- Difficulty -->
          <UFormGroup label="Difficulty" name="difficulty">
            <USelect
              v-model="formState.difficulty"
              :options="difficultyOptions"
              placeholder="Select difficulty"
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
                v-model="formState.selectedFile"
                value-attribute="unique_file_name"
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
          :loading="loadingStates.testCreation"
          type="submit"
          color="primary"
          size="xl"
          class="w-full h-16 text-center flex items-center justify-center"
          :disabled="!formState.selectedCourse"
        >
          Generate Test
          <svg
            xmlns="http://www.w3.org/2000/svg"
            xmlns:xlink="http://www.w3.org/1999/xlink"
            fill="#000000"
            height="20px"
            width="20px"
            version="1.1"
            id="Capa_1"
            viewBox="0 0 489.059 489.059"
            xml:space="preserve"
          >
            <path
              d="M481.211,443.368L224.809,186.946l55.817-17.364c3.88-1.196,6.736-4.509,7.38-8.528c0.642-4.018-1.058-8.051-4.383-10.385  l-56.798-40.165c-9.814-6.913-15.56-18.2-15.417-30.172l0.916-69.519c0.051-4.06-2.23-7.796-5.837-9.647  c-3.608-1.844-7.976-1.483-11.225,0.962l-55.73,41.584c-9.588,7.163-22.117,9.136-33.439,5.294L40.246,26.678  c-3.848-1.315-8.118-0.322-11.007,2.55c-2.868,2.872-3.847,7.138-2.563,10.987l22.376,65.862c3.8,11.343,1.828,23.837-5.325,33.438  L2.131,195.245c-2.418,3.272-2.819,7.628-0.977,11.236c1.859,3.633,5.599,5.887,9.688,5.84l69.502-0.898  c11.971-0.153,23.244,5.582,30.174,15.366l40.149,56.807c2.373,3.32,6.401,5.021,10.412,4.387c4.025-0.632,7.314-3.497,8.518-7.378  l17.375-55.805l256.389,256.422c5.243,5.221,12.094,7.836,18.908,7.836c6.885,0,13.73-2.615,18.943-7.836  C491.671,470.772,491.671,453.826,481.211,443.368z"
            />
          </svg>
        </UButton>
      </form>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const { fetchCourses, coursesList } = useCourses();
const toast = useToast();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const generatedQuestions = ref([]);

const formState = reactive({
  title: "",
  difficulty: "medium",
  maxQuestions: 10,
  testType: "multiple_choice",
  courseFiles: [],
  selectedCourse: "",
  selectedFile: "",
  duration: 1800,
  description: "",
});

const loadingStates = reactive({
  fileUploads: false,
  courseFileDetails: false,
  testCreation: false,
});

const testTypeOptions = [
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

  try {
    const { data } = await $fetch("/api/tests/generate", {
      method: "POST",
      body: {
        fileId: formState.selectedFile,
        maxQuestions: formState.maxQuestions,
        difficulty: formState.difficulty,
        courseId: formState.selectedCourse,
        title: formState.title,
        testType: formState.testType,
        duration: formState.duration,
        description: formState.description,
        userId: user.value?.id,
      },
    });

    generatedQuestions.value = data.questions;

    toast.add({
      title: "Test created successfully",
      description: "Test created successfully, taking you to the test page...",
      color: "green",
      callback: () => {
        navigateTo(`/dashboard/tests/play/${data.id}`);
      },
    });
  } catch (error) {
    console.error("Error generating test:", error);
    toast.add({
      title: "Error while generating test",
      icon: "i-heroicons-exclamation-circle",
      description: error.message,
      color: "red",
    });
  } finally {
    loadingStates.testCreation = false;
  }
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

onMounted(async () => {
  await fetchCourses();
});
</script>
