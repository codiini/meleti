type TestResults = {
  testId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeTaken: number;
  duration: number;
};

export const useTests = () => {
  const supabase = useSupabaseClient();
  const user = useSupabaseUser();
  const toast = useToast();

  const saveTestResults = async ({
    testId,
    score,
    totalQuestions,
    correctAnswers,
    timeTaken,
    duration,
  }: TestResults) => {
    try {
      const { error } = await supabase.from("test_results").insert({
        user_id: user.value?.id,
        test_id: testId,
        score: score,
        total_questions: totalQuestions,
        correct_answers: correctAnswers,
        time_taken: timeTaken,
        duration: duration,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      toast.add({
        title: "Test Results",
        description: "There was an error saving your test results",
        color: "red",
      });
    }
  };

  const getTestResults = async () => {
    try {
      const { data, error } = await supabase
        .from("test_results")
        .select("*, tests(course_id(id, title, color_code), title)")
        .eq("user_id", user.value?.id)
        .order("completed_at", { ascending: false });
      // .limit(limit); // TODO: Implement limit and pagination

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      toast.add({
        title: "Test Results",
        description: "There was an error fetching your test results",
        color: "red",
      });

      throw error;
    }
  };

  const deleteTest = async (testId: string) => {
    try {
      const { error } = await supabase.from("tests").delete().eq("id", testId);

      if (error) {
        throw error;
      }

      toast.add({
        title: "Test Deleted Successfully!",
        icon: "i-heroicons-check-badge-20-solid",
      });

      return { error };
    } catch (e: any) {
      toast.add({
        title: "Test Results",
        description: e.statusMessage,
        icon: "i-heroicons-exclamation-circle",
        color: "red",
      });

      throw e;
    }
  };
  return {
    saveTestResults,
    getTestResults,
    deleteTest,
  };
};
