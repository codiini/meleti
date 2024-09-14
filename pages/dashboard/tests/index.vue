<template>
  <div class="lg:ml-64 lg:p-8 p-4">
    <div class="flex flex-col justify-between gap-y-2 items-start mb-4">
      <h2 class="text-3xl font-bold text-gray-800">Tests</h2>
      <p class="text-base text-gray-500 max-w-md">
        Manage your personal test library, where you can view, launch, and
        organize all your created tests at a glance &#129299;
      </p>
    </div>

    <div class="flex justify-end pb-4" v-if="tests.length > 0">
      <UButton
        size="xl"
        to="/dashboard/tests/new"
        icon="i-heroicons-plus"
        label="Create New Test"
        class="flex items-center justify-center h-12 w-full lg:w-auto"
      />
    </div>

    <div class="w-full" v-if="tests.length == 0 && !loading">
      <UCard class="w-full py-4">
        <template #header>
          <div class="flex flex-col items-center text-center gap-y-4">
            <h3 class="text-lg font-semibold">
              You haven't created any tests yet
            </h3>
            <p>You can create a new test by clicking the button below.</p>

            <UButton
              size="xl"
              to="/dashboard/tests/new"
              icon="i-heroicons-plus"
              label="Create New Test"
              class="flex items-center justify-center h-12"
            />
          </div>
        </template>
      </UCard>
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
              <div class="flex justify-between mt-4">
                <div class="flex gap-x-2">
                  <div class="h-8 bg-gray-400 rounded w-20"></div>
                  <div class="h-8 bg-gray-400 rounded w-20"></div>
                </div>

                <div>
                  <div class="h-8 bg-gray-400 rounded w-10"></div>
                </div>
              </div>
            </template>
          </UCard>
        </div>
      </template>

      <!-- Test Cards -->

      <template v-else>
        <UCard
          v-for="{
            id,
            title,
            questions,
            course_id,
            description,
            deleting,
          } in tests"
          :key="id"
          :title="title"
          class="dark:bg-gray-900"
        >
          <template #header>
            <div class="flex justify-between items-center">
              <span>{{ course_id.title }}</span>
              <span>{{ questions.length }} questions</span>
            </div>
          </template>
          <div class="h-20">
            <h3 class="text-lg font-semibold">
              {{ title }}
            </h3>
            <p>{{ description }}</p>
          </div>
          <template #footer>
            <div class="flex justify-between">
              <div class="flex gap-x-2">
                <UButton
                  disabled
                  label="Edit"
                  variant="outline"
                  class="w-20 flex justify-center"
                />
                <UButton
                  :to="`/dashboard/tests/play/${id}`"
                  label="Start"
                  color="primary"
                  class="w-20 flex justify-center"
                />
              </div>

              <UButton v-if="deleting" disabled color="red" variant="ghost">
                <UIcon
                  size="18"
                  name="i-heroicons-arrow-path-20-solid"
                  class="animate-spin flex items-end"
                />
              </UButton>

              <UButton
                v-else
                color="red"
                @click="deleteTest(id)"
                icon="i-heroicons-trash-20-solid"
                class="flex items-end"
                variant="ghost"
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
const user = useSupabaseUser();
const toast = useToast();

useHead({
  title: "Meleti | Tests",
});

const tests = ref([]);
const loading = ref(true);

const fetchTests = async () => {
  const { data, error } = await supabase
    .from("tests")
    .select("*, course_id(title)")
    .eq("created_by", user.value?.id);
  if (error) {
    console.error("Error fetching tests:", error);
  } else {
    tests.value = data;
    tests.value = tests.value.map((test) => ({
      ...test,
      deleting: false,
    }));
  }
  loading.value = false;
};

const deleteTest = async (id: string) => {
  tests.value = tests.value.map((test) =>
    test.id === id ? { ...test, deleting: true } : test
  );
  const { error } = await supabase
    .from("tests")
    .delete()
    .eq("id", id)
    .eq("created_by", user.value?.id);

  if (error) {
    toast.add({
      title: "Error Deleting Test",
      description:
        "There was an error deleting the selected test. Please try again later.",
      icon: "i-heroicons-exclamation-circle",
      color: "red",
    });
  }
  await fetchTests();
  toast.add({
    title: "Test deleted Successfully",
    icon: "i-heroicons-check-circle",
  });
};

onMounted(async () => {
  await fetchTests();
});
</script>
