<template>
  <div class="lg:ml-64 lg:p-8 p-4">
    <div class="flex flex-col justify-between gap-y-2 items-start mb-6">
      <h2 class="text-3xl font-bold text-gray-800">Courses</h2>
      <p class="text-base text-gray-500 max-w-xs">
        Explore and manage your courses, including their details and materials &#128218;
      </p>
    </div>

    <template v-if="loadingStates.fetch">
      <!-- Skeleton Loader -->
      <UCard class="mb-8">
        <template #header>
          <div class="flex justify-between items-center">
            <USkeleton class="h-6 w-32" />
            <USkeleton class="h-10 w-36" />
          </div>
        </template>
        <div class="space-y-4">
          <div v-for="i in 5" :key="i" class="flex items-center space-x-4">
            <USkeleton class="h-6 w-1/4" />
            <USkeleton class="h-6 w-1/3" />
            <USkeleton class="h-6 w-1/3" />
            <USkeleton class="h-6 w-1/3" />
          </div>
        </div>
      </UCard>
    </template>

    <!-- Course List -->
    <template v-else>
      <UCard v-if="coursesList.length > 0" class="mb-8">
        <template #header>
          <div class="flex justify-between items-center">
            <h2 class="text-xl font-semibold">Your Courses</h2>
            <UButton color="primary" @click="showAddCourseModal = true"
              >Add New Course</UButton
            >
          </div>
        </template>
        <UTable :columns="courseColumns" :rows="coursesList">
          <template #actions-data="{ row }">
            <UButton color="primary" variant="ghost" @click="editCourse(row)"
              >Edit</UButton
            >
          </template>
        </UTable>
      </UCard>

      <!-- No Courses Message -->
      <UCard v-else class="w-full py-4">
        <template #header>
          <div class="flex flex-col items-center text-center gap-y-4">
            <h3 class="text-lg font-semibold">
              You haven't added any courses yet.
            </h3>
            <p>You can add a new course by clicking the button below.</p>

            <UButton
              @click="showAddCourseModal = true"
              size="xl"
              icon="i-heroicons-plus"
              label="Add Your First Course"
              class="flex items-center justify-center h-12"
            />
          </div>
        </template>
      </UCard>
    </template>

    <!-- Add/Edit Course Modal -->
    <!-- TODO: Refactor this to a separate component -->
    <UModal v-model="showAddCourseModal" prevent-close>
      <UCard v-if="showAddCourseModal">
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
          <UFormGroup
            v-if="editingCourse"
            label="Course Materials"
            name="courseMaterials"
          >
            <template v-if="courseForm.materials?.length == 0">
              <p class="text-gray-400">No study materials uploaded yet.</p>
            </template>
            <template v-else>
              <ul class="flex flex-col space-y-2 mb-4">
                <li
                  v-for="{
                    id,
                    unique_file_name,
                    deleting,
                    file_name,
                  } in courseForm.materials"
                  :key="id"
                  class="flex items-center gap-x-2"
                >
                  <UBadge
                    color="green"
                    variant="solid"
                    class="flex items-center space-x-2"
                    >{{ file_name }}</UBadge
                  >
                  <UButton
                    :disabled="deleting"
                    color="red"
                    variant="ghost"
                    @click="deleteMaterial(id, unique_file_name)"
                  >
                    <UIcon
                      v-if="deleting"
                      name="i-heroicons-arrow-path"
                      class="w-5 h-5 animate-spin"
                    />
                    <UIcon
                      v-else
                      name="i-heroicons-trash-20-solid"
                      class="w-5 h-5"
                    />
                  </UButton>
                </li>
              </ul>
            </template>
          </UFormGroup>
          <UFormGroup label="Upload Study Materials" name="courseMaterials">
            <template #help>
              <div class="flex flex-col gap-y-1">
                <div class="flex items-center gap-x-1">
                  <UIcon
                    name="i-heroicons-exclamation-circle"
                    class="w-5 h-5"
                  />
                  Max. file upload size of 4mb
                </div>
                <div
                  v-if="courseForm.materials?.length == 2"
                  class="flex items-center gap-x-1"
                >
                  <UIcon
                    name="i-heroicons-exclamation-circle"
                    class="w-5 h-5"
                  />
                  You can only add 2 materials to a course.
                </div>
              </div>
            </template>
            <UInput
              :disabled="isFileUploading || courseForm.materials?.length == 2"
              @change="handleFileUpload($event)"
              type="file"
              accept=".pdf"
              icon="i-heroicons-folder"
              placeholder="Upload study materials"
              class="cursor-pointer"
            />
          </UFormGroup>
          <UButton
            type="submit"
            :loading="loadingStates.save || isFileUploading"
            color="primary"
            block
          >
            {{ isFileUploading ? `Uploading...` : `Save Course` }}
          </UButton>
          <UButton
            v-if="editingCourse"
            :loading="loadingStates.delete"
            @click="handleDelete"
            color="red"
            block
            >Delete Course
          </UButton>
        </form>
      </UCard>
    </UModal>
  </div>
</template>

<script setup lang="ts">
import type { Course, CourseFile } from "@/types/courses";
const toast = useToast();

useHead({
  title: "Meleti | Courses",
});

const showAddCourseModal = ref(false);
const editingCourse = ref(false);
const courseForm = reactive<Course>({
  id: "",
  title: "",
  description: "",
  materials: [],
});
const isFileUploading = ref(false);

const {
  coursesList,
  fetchCourses,
  deleteCourse,
  updateCourse,
  createCourse,
  loadingStates,
  getCourseFileDetails,
  deleteCourseFile,
} = useCourses();

const courseColumns = [
  { key: "title", label: "Course Title" },
  { key: "description", label: "Description" },
  { key: "actions", label: "Actions" },
];

const editCourse = async (course: Course) => {
  editingCourse.value = true;
  Object.assign(courseForm, course);
  await fetchCourseFiles(course.id);
  showAddCourseModal.value = true;
};

const deleteMaterial = async (id: string, unique_file_name: string) => {
  courseForm.materials = courseForm?.materials?.map((material: CourseFile) =>
    material.id === id ? { ...material, deleting: true } : material
  );
  try {
    await deleteCourseFile(unique_file_name);
  } finally {
    courseForm.materials = courseForm?.materials?.map((material: CourseFile) =>
      material.id === id ? { ...material, deleting: false } : material
    );
  }

  await fetchCourseFiles(courseForm.id);
};

const closeModal = () => {
  editingCourse.value = false;
  showAddCourseModal.value = false;
  Object.assign(courseForm, {
    id: "",
    title: "",
    description: "",
    materials: [],
  });
};

const saveCourse = async () => {
  if (!courseForm.title || !courseForm.description) {
    return toast.add({
      title: "Incomplete fields",
      description: "Please fill in all the required fields and try again",
      icon: "i-heroicons-exclamation-circle",
    });
  }

  if (editingCourse.value) {
    await updateCourse(courseForm.id, courseForm.title, courseForm.description);
  } else {
    await createCourse(courseForm.title, courseForm.description);
  }
  fetchCourses();
  closeModal();
};

const handleDelete = async () => {
  await deleteCourse(courseForm.id);
  closeModal();
};

const handleFileUpload = async (file: (string | Blob)[]) => {
  isFileUploading.value = true;

  const formData = new FormData();
  formData.append("file", file[0]);

  try {
    const { statusCode }: { statusCode: number } = await $fetch(
      "/api/files/upload",
      {
        method: "POST",
        body: formData,
        params: {
          courseId: courseForm.id,
        },
      }
    );

    if (statusCode == 200) {
      await fetchCourseFiles(courseForm.id);
      toast.add({
        title: "File Uploaded",
        description: "Your file has been uploaded successfully.",
        icon: "i-heroicons-check-circle",
      });
    }
  } catch (e: any) {
    toast.add({
      title: "Upload Failed",
      description:
        e.statusMessage ||
        "There was an error uploading your file. Please try again.",
      icon: "i-heroicons-exclamation-circle",
      color: "red",
    });
  } finally {
    isFileUploading.value = false;
  }
};

const fetchCourseFiles = async (id: string) => {
  const courseFiles = await getCourseFileDetails(id);
  courseForm.materials =
    courseFiles?.map((file: CourseFile) => ({
      ...file,
      deleting: false,
    })) || [];
};

const route = useRoute();

watch(
  () => route.query,

  () => {
    if (route.query.new) {
      showAddCourseModal.value = true;
    }
  },
  { immediate: true }
);

onMounted(async () => {
  await fetchCourses();
});
</script>
