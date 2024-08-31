import type { Course } from "~/types/courses";

export const useCourses = (courseForm: Ref<Course>) => {
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
    let { data, error } = await supabase.from("courses").select("*");
    loadingStates.fetch = false;
    coursesList.value = data as Course[];
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

  const deleteCourse = async () => {
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
        color: "red",
      });
    }
    await fetchCourses();
    toast.add({
      title: "Course Deleted Successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
  };

  const updateCourse = async () => {
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
        color: "red",
      });
    }
    toast.add({
      title: "Course Updated Successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
  };

  const createCourse = async () => {
    loadingStates.save = true;
    const { data, error } = await supabase
      .from("courses")
      .insert([
        {
          title: courseForm.value.title,
          description: courseForm.value.description,
          user_id: user.value?.id,
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
        color: "red",
      });
    }
    toast.add({
      title: "Course Added Successfully!",
      icon: "i-heroicons-check-badge-solid",
    });
  };

  return {
    fetchCourses,
    deleteCourse,
    coursesList,
    loadingStates,
    updateCourse,
    createCourse,
  };
};
