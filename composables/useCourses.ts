import type { Course } from "~/types/courses";

export const useCourses = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const toast = useToast();

  const coursesList = ref<Course[]>([]);

  const loadingStates = reactive({
    save: false,
    delete: false,
    fetch: false,
  });

  const fetchCourses = async () => {
    loadingStates.fetch = true;
    let { data, error } = await supabase
      .from("courses")
      .select("*")
      .eq("user_id", user.value?.id);
    loadingStates.fetch = false;
    //set a deleting state on each course
    coursesList.value = data as Course[];

    coursesList.value?.map((course: Course) => ({
      ...course,
      deleting: false,
    }));

    if (error) {
      return toast.add({
        title: "Error Fetching Courses",
        description:
          "There was an error fetching your courses. Please try again later.",
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
    }
  };

  const deleteCourse = async (id: string) => {
    loadingStates.delete = true;
    const { error } = await supabase
      .from("courses")
      .delete()
      .eq("id", id)
      .eq("user_id", user.value?.id);

    loadingStates.delete = false;
    if (error) {
      return toast.add({
        title: "Error Deleting Course",
        description:
          "There was an error deleting the selected course. Please try again later.",
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
    }
    await fetchCourses();
    toast.add({
      title: "Course Deleted Successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
  };

  const updateCourse = async (
    id: string,
    title: string,
    description: string
  ) => {
    loadingStates.save = true;
    const { error } = await supabase
      .from("courses")
      .update({
        title: title,
        description: description,
      })
      .eq("id", id)
      .eq("user_id", user.value?.id)
      .select();
    loadingStates.save = false;
    if (error) {
      return toast.add({
        title: "Error Updating Course",
        description:
          "There was an error updating the selected course. Please try again later.",
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
    }
    toast.add({
      title: "Course Updated Successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
  };

  const createCourse = async (title: string, description: string) => {
    loadingStates.save = true;
    const colorCode = generateUniqueColors(1000);
    const { error } = await supabase
      .from("courses")
      .insert([
        {
          title: title,
          description: description,
          user_id: user.value?.id,
          color_code: colorCode,
        },
      ])
      .select();
    loadingStates.save = false;
    if (error) {
      toast.add({
        title: "Error While Adding Course",
        description:
          "There was an error while adding the course. Please try again later.",
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
      return;
    }
    toast.add({
      title: "Course Added Successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
  };

  const getCourseFileDetails = async (id: string) => {
    const { data, error } = await supabase
      .from("course_files")
      .select(`id, unique_file_name, file_name`)
      .eq("user_id", user.value?.id)
      .match({
        course_id: id ?? coursesList.value[0]?.id,
      });

    if (error) {
      toast.add({
        title: "Error Fetching Study Materials",
        description:
          "There was an error fetching your study materials. Please try again later.",
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
      return;
    }

    return data;
  };

  const deleteCourseFile = async (id: string) => {
    try {
      await $fetch("/api/files/delete", {
        method: "DELETE",
        params: {
          id,
        },
      });

      toast.add({
        title: "Study Material Deleted Successfully!",
        icon: "i-heroicons-check-badge-solid",
      });
    } catch (e: any) {
      toast.add({
        title: "Error Deleting Study Material",
        description: e.statusMessage,
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });
    }
  };
  return {
    fetchCourses,
    deleteCourse,
    coursesList,
    loadingStates,
    updateCourse,
    createCourse,
    getCourseFileDetails,
    deleteCourseFile,
  };
};
