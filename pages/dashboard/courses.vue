<template>
  <div class="ml-64 p-8">
    <h1 class="text-3xl font-bold mb-8 text-gray-800">Course Management</h1>

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
    </template>

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
              @change="handleFileUpload($event)"
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
import type { Course } from "@/types/courses";

const toast = useToast();
const supabase = useSupabaseClient();

const showAddCourseModal = ref(false);
const editingCourse = ref(null);
const courseForm = ref({
  title: "",
  description: "",
  materials: "",
});
const isFileUploading = ref(false);

const {
  coursesList,
  fetchCourses,
  deleteCourse,
  updateCourse,
  createCourse,
  loadingStates,
} = useCourses(courseForm);

const courseColumns = [
  { key: "title", label: "Course Title" },
  { key: "description", label: "Description" },
  { key: "materialCount", label: "Materials" },
  { key: "actions", label: "Actions" },
];

const editCourse = (course: Course) => {
  editingCourse.value = course;
  courseForm.value = { ...course };
  showAddCourseModal.value = true;
};

const closeModal = () => {
  showAddCourseModal.value = false;
  editingCourse.value = null;
  courseForm.value = { name: "", description: "", materials: [] };
};

const saveCourse = async () => {
  if (!courseForm.value.title || !courseForm.value.description) {
    return toast.add({
      title: "Incomplete fields",
      description: "Please fill in all the required fields and try again",
      icon: "i-heroicons-exclamation-circle",
    });
  }

  if (editingCourse.value) {
    await updateCourse();
  } else {
    await createCourse();
  }
  fetchCourses();
  closeModal();
};

const handleDelete = async () => {
  await deleteCourse();
  closeModal();
};

const handleFileUpload = async (file: (string | Blob)[]) => {
  isFileUploading.value = true;
  try {
    // Get pre-signed URL
    const data = await $fetch("/api/files/upload", {
      method: "PUT",
      body: {
        fileName: file[0].name,
        fileType: file[0].type,
      },
    });

    const { signedUrl, fileUrl, fileName, uniqueFileName, fileType } = data;

    console.log("presignedURL:", data);

    await $fetch(signedUrl, {
      method: "PUT",
      body: file[0],
      headers: {
        "Content-Type": file[0].type,
      },
    });

    courseForm.value.materialUrl = fileUrl;

    const { data: materialData, error } = await supabase
      .from("course_files")
      .insert([
        {
          course_id: courseForm.value.id,
          file_name: fileName,
          unique_file_name: uniqueFileName,
          file_url: fileUrl,
          file_type: fileType,
        },
      ])
      .select();

    console.log(materialData);

    toast.add({
      title: "File Uploaded",
      description: "Your file has been uploaded successfully.",
      icon: "i-heroicons-check-circle",
    });
  } catch (error) {
    toast.add({
      title: "Upload Failed",
      description: "There was an error uploading your file. Please try again.",
      icon: "i-heroicons-exclamation-circle",
    });
  } finally {
    isFileUploading.value = false;
  }
};

onMounted(async () => await fetchCourses());
</script>
