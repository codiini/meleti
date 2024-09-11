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
  }: {
    testId: string;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    timeTaken: number;
    duration: number;
  }) => {
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

  return {
    saveTestResults,
  };
};
