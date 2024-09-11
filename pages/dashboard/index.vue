<template>
  <div class="ml-64 p-8">
    <!-- Header -->
    <header class="mb-8">
      <h1 class="text-3xl font-bold dark:text-gray-800">
        Welcome {{ computedUserName }}!
      </h1>
      <p class="dark:text-gray-600">Your AI-powered exam preparation toolkit</p>
    </header>

    <!-- Quick Actions -->
    <div class="grid grid-cols-2 md:grid-cols-2 gap-6 mb-8">
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Add new Course</h2>
        </template>
        <UButton
          to="/dashboard/courses?new=true"
          icon="i-heroicons-plus"
          label="Add Course"
          color="primary"
        />
      </UCard>
      <UCard>
        <template #header>
          <h2 class="text-lg font-semibold">Create New Test</h2>
        </template>
        <UButton
          to="/dashboard/tests/new"
          icon="i-heroicons-clock-solid"
          label="New Test"
          color="primary"
        />
      </UCard>
    </div>

    <!-- Recent Activity -->
    <UCard class="mb-8">
      <template #header>
        <h2 class="text-xl font-semibold">Recent Activity</h2>
      </template>
      <UTable :columns="columns" :rows="rows" />
    </UCard>

    <!-- Performance Overview -->
    <UCard>
      <template #header>
        <h2 class="text-xl font-semibold">Performance Overview</h2>
      </template>
      <!-- Add a chart component here -->
      <div class="h-64 flex items-center justify-center">
        <DashboardPerformanceChart
          v-if="testResults.length > 0"
          :testResults="testResults"
        />
      </div>
    </UCard>
  </div>
</template>

<script lang="ts" setup>
const user = useSupabaseUser();
const { getTestResults } = useTests();

const computedUserName = computed(() => user.value?.user_metadata.firstname);
const testResults = ref([]);

const columns = [
  { key: "date", label: "Date" },
  { key: "test", label: "Test" },
  { key: "course", label: "Course" },
  { key: "score", label: "Score" },
];

const rows = ref([]);

onBeforeMount(async () => {
  testResults.value = await getTestResults();
  rows.value = testResults.value.slice(0, 3).map((test: any) => ({
    date: formatDate(test.completed_at),
    test: test.tests.title,
    course: test.tests.course_id.title,
    score: `${test.score}%`,
  }));
});
</script>
