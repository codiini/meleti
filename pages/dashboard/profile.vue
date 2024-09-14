<template>
  <div class="lg:ml-64 lg:p-8 p-4">
    <header class="mb-8">
      <h1 class="text-3xl font-bold dark:text-gray-800">Profile</h1>
    </header>

    <UCard v-if="isLoading" class="mb-8">
      <template #header>
        <div class="flex items-center space-x-4">
          <USkeleton class="w-16 h-16 rounded-full" />
          <div class="space-y-2">
            <USkeleton class="h-6 w-40" />
            <USkeleton class="h-4 w-32" />
          </div>
        </div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <USkeleton class="h-6 w-24 mb-2" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-3/4 mt-2" />
        </div>
        <div>
          <USkeleton class="h-6 w-24 mb-2" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-3/4 mt-2" />
          <USkeleton class="h-4 w-1/2 mt-2" />
        </div>
      </div>
      <template #footer>
        <USkeleton class="h-10 w-32" />
      </template>
    </UCard>

    <UCard v-else class="mb-8">
      <template #header>
        <div class="flex items-center space-x-4">
          <UAvatar :alt="joinName" size="xl" />
          <div>
            <h1 class="text-2xl font-bold">
              {{ user.user_metadata.firstname }}
              {{ user.user_metadata.surname }}
            </h1>
            <p class="text-gray-500">{{ user.email }}</p>
          </div>
        </div>
      </template>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 class="text-lg font-semibold mb-2">About</h2>
          <p>{{ user.about ? user.about : "No bio set" }}</p>
        </div>
        <div>
          <h2 class="text-lg font-semibold mb-2">Stats</h2>
          <ul>
            <li>Tests Created: {{ userStats.testsCreated }}</li>
            <li>Average Score: {{ userStats.averageScore }}%</li>
            <li>Courses Created: {{ userStats.coursesCreated }}</li>
          </ul>
        </div>
      </div>
      <template #footer>
        <UButton disabled color="primary" @click="editProfile"
          >Edit Profile</UButton
        >
      </template>
    </UCard>
  </div>
</template>

<script setup>
const user = useSupabaseUser();
const supabase = useSupabaseClient();

useHead({
  title: "Meleti | Profile",
});

const isLoading = ref(true);

const userStats = reactive({
  coursesCreated: 0,
  averageScore: 0,
  testsCreated: 0,
});

const editProfile = () => {
  // Implement edit profile functionality
  console.log("Edit profile clicked");
};

const joinName = computed(
  () =>
    `${user.value?.user_metadata.firstname} ${user.value?.user_metadata.surname}`
);

const fetchUserStats = async () => {
  const { data } = await supabase
    .from("courses")
    .select("id", { count: "exact" })
    .eq("user_id", user.value?.id);

  userStats.coursesCreated = data.length;

  const { data: tests } = await supabase
    .from("tests")
    .select("id", { count: "exact" })
    .eq("created_by", user.value?.id);

  userStats.testsCreated = tests.length;

  const { data: testResults } = await supabase
    .from("test_results")
    .select("score", { count: "exact" })
    .eq("user_id", user.value?.id);

  userStats.averageScore =
    testResults.reduce((acc, curr) => acc + curr.score, 0) / testResults.length;
};

onMounted(async () => {
  await fetchUserStats();
  isLoading.value = false;
});
</script>
