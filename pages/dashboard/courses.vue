<template>
  <div class="ml-64 p-8">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">Course Management</h1>

    <!-- Course List -->
    <UCard v-if="courses.length > 0" class="mb-8">
      <template #header>
        <div class="flex justify-between items-center">
          <h2 class="text-xl font-semibold">Your Courses</h2>
          <UButton color="primary" @click="showAddCourseModal = true"
            >Add New Course</UButton
          >
        </div>
      </template>
      <UTable :columns="courseColumns" :rows="courses">
        <template #actions-data="{ row }">
          <UButton color="primary" variant="ghost" @click="editCourse(row)"
            >Edit</UButton
          >
        </template>
      </UTable>
    </UCard>

    <!-- No Courses Message -->
    <UCard v-else class="mb-8">
      <p class="text-center text-gray-400">
        You haven't added any courses yet.
      </p>
      <UButton
        color="primary"
        class="mt-4 mx-auto block"
        @click="showAddCourseModal = true"
      >
        Add Your First Course
      </UButton>
    </UCard>

    <!-- Add/Edit Course Modal -->
    <UModal v-model="showAddCourseModal" prevent-close>
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">
              {{ editingCourse ? "Edit Course" : "Add New Course" }}
            </h3>
            <UButton
              color="gray"
              variant="ghost"
              icon="i-heroicons-x-mark-20-solid"
              class="-my-1"
              @click="closeModal"
            />
          </div>
        </template>
        <form @submit.prevent="saveCourse" class="space-y-4">
          <UFormGroup label="Course Title" name="courseTitle">
            <UInput
              v-model="courseForm.title"
              placeholder="Enter course title"
            />
          </UFormGroup>
          <UFormGroup label="Course Description" name="courseDescription">
            <UTextarea
              v-model="courseForm.description"
              placeholder="Enter course description"
            />
          </UFormGroup>
          <UFormGroup label="Course Materials" name="courseMaterials">
            <UInput
              type="file"
              v-model="courseForm.materials"
              accept=".pdf,.doc,.docx,.txt"
              multiple
              icon="i-heroicons-folder"
              placeholder="Upload course materials"
            />
          </UFormGroup>
          <UButton
            type="submit"
            :loading="loadingStates.save"
            color="primary"
            block
            >Save Course</UButton
          >
          <UButton
            v-if="editingCourse"
            :loading="loadingStates.delete"
            @click="deleteCourse"
            color="red"
            block
            >Delete Course
          </UButton>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
const supabase = useSupabaseClient();
const toast = useToast();

const courses = ref([]);
const loadingStates = reactive({
  save: false,
  delete: false,
});
const isLoading = ref(false);
const showAddCourseModal = ref(false);
const editingCourse = ref(null);
const courseForm = ref({
  title: "",
  description: "",
  materials: [],
});

const courseColumns = [
  { key: "title", label: "Course Title" },
  { key: "description", label: "Description" },
  { key: "materialCount", label: "Materials" },
  { key: "actions", label: "Actions" },
];

const editCourse = (course) => {
  editingCourse.value = course;
  courseForm.value = { ...course };
  showAddCourseModal.value = true;
};

const closeModal = () => {
  showAddCourseModal.value = false;
  editingCourse.value = null;
  courseForm.value = { name: "", description: "", materials: [] };
};

const updateCourse = async () => {
  try {
    loadingStates.save = true;
    const { data, error } = await supabase
      .from("courses")
      .update({
        title: courseForm.value.title,
        description: courseForm.value.description,
      })
      .eq("id", courseForm.value.id)
      .select();
    loadingStates.save = false;
    if (error) {
      return toast.add({
        title: "Error Updating Course",
        description:
          "There was an error updating the selected course. Please try again later.",
        icon: "i-heroicons-exclamation-circle",
      });
    }
  } catch (error) {}
};

const saveCourse = async () => {
  try {
    if (editingCourse.value) {
      if (!courseForm.value.title || !courseForm.value.description) {
        return toast.add({
          title: "Incomplete fields",
          description: "Please fill in all the required fields and try again",
          icon: "i-heroicons-exclamation-circle",
        });
      }
      // Update existing course
      await updateCourse();
    } else {
      if (!courseForm.value.title || !courseForm.value.description) {
        return toast.add({
          title: "Incomplete fields",
          description: "Please fill in all the required fields and try again",
          icon: "i-heroicons-exclamation-circle",
        });
      }
      // Add new course
      loadingStates.save = true;
      const { data, error } = await supabase
        .from("courses")
        .insert([
          {
            title: courseForm.value.title,
            description: courseForm.value.description,
            user_id: "e5bc4f52-7d84-4df5-b143-5f914fbeea4b",
          },
        ])
        .select();
      loadingStates.save = false;
      if (error) {
        return toast.add({
          title: "Error While Adding Course",
          description:
            "There was an error while adding the course. Please try again later.",
          icon: "i-heroicons-exclamation-circle",
        });
      }

      toast.add({
        title: "Course Added Successfully!",
        icon: "i-heroicons-check-badge-solid",
      });
    }
    fetchCourses();
    closeModal();
  } catch (error) {}
};

const fetchCourses = async () => {
  try {
    let { data, error } = await supabase.from("courses").select("*");
    courses.value = data;
    if (error) {
      return toast.add({
        title: "Error Fetching Courses",
        description:
          "There was an error fetching your courses. Please try again later.",
        icon: "i-heroicons-exclamation-circle",
      });
    }
  } catch (error) {}
};

const deleteCourse = async () => {
  try {
    loadingStates.delete = true;
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", courseForm.value.id);

    loadingStates.delete = false;
    if (error) {
      return toast.add({
        title: "Error Deleting Course",
        description:
          "There was an error deleting the selected course. Please try again later.",
        icon: "i-heroicons-exclamation-circle",
      });
    }
    closeModal();
    fetchCourses();
    toast.add({
      title: "Course Deleted Successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
  } catch (error) {}
};

fetchCourses();
</script>
