<template>
  <div class="ml-64 p-8">
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-3xl font-bold text-gray-800">My Tests</h2>
    </div>

    <div class="flex justify-end pt-2 pb-4">
      <UButton
        size="xl"
        to="/dashboard/tests/new"
        icon="i-heroicons-plus"
        label="Create New Test"
        class="flex items-center justify-center h-12"
      />
    </div>
    <!-- Test List -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <!-- Loading Skeleton -->
      <template v-if="loading">
        <div v-for="n in 3" :key="n" class="animate-pulse">
          <UCard class="bg-gray-300 dark:bg-gray-700">
            <template #header>
              <div class="h-4 bg-gray-400 rounded w-3/4"></div>
            </template>
            <div class="h-6 bg-gray-400 rounded mt-2"></div>
            <template #footer>
              <div class="flex space-x-4 mt-4">
                <div class="h-8 bg-gray-400 rounded w-20"></div>
                <div class="h-8 bg-gray-400 rounded w-20"></div>
              </div>
            </template>
          </UCard>
        </div>
      </template>

      <!-- Test Cards -->

      <template v-else>
        <UCard
          v-for="test in tests"
          :key="test.id"
          :title="test.title"
          class="bg-white dark:bg-gray-900 text-white"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span>{{ formatDate(test.created_at) }}</span>
              <span>{{ test.questions.length }} questions</span>
            </div>
          </template>
          <div class="h-20">
            <h3 class="text-lg font-semibold">{{ test.title }}</h3>
            <p>{{ test?.description }}</p>
          </div>
          <template #footer>
            <div class="flex gap-x-2">
              <UButton
                disabled
                label="Edit"
                variant="outline"
                class="w-20 flex justify-center"
              />
              <UButton
                :to="`/dashboard/tests/play/${test.id}`"
                label="Start"
                color="primary"
                class="w-20 flex justify-center"
              />
            </div>
          </template>
        </UCard>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient();

const tests = ref([]);
const loading = ref(true);

onMounted(async () => {
  const { data, error } = await supabase.from("tests").select("*");
  if (error) {
    console.error("Error fetching tests:", error);
  } else {
    tests.value = data;
  }
  loading.value = false;
});
</script>
