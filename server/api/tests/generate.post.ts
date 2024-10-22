import { randomUUID } from "crypto";
import { serverSupabaseClient } from "#supabase/server";
import { Question } from "~/types/questions";

export default defineEventHandler(async (event) => {
  const supabaseClient = await serverSupabaseClient(event);
  const body = await readBody(event);
  const userId = (await supabaseClient.auth.getUser()).data.user?.id;

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const {
    fileId,
    maxQuestions,
    difficulty,
    courseId,
    title,
    testType,
    duration,
    description,
  } = body;

  try {
    const { content } = await $fetch("/api/files/retrieve-download", {
      method: "POST",
      body: {
        fileId,
      },
    });

    const { aggregatedResponse } = await $fetch("/api/ai/gemini", {
      method: "POST",
      body: {
        fileContent: content,
        maxQuestions,
        difficulty,
      },
    });


    const questionsWithId = aggregatedResponse.map((question: Question) => ({
      ...question,
      id: randomUUID(),
    }));

    const { data, error } = await supabaseClient
      .from("tests")
      .insert([
        {
          course_id: courseId,
          title,
          questions: questionsWithId,
          description,
          test_type: testType,
          duration,
          created_by: userId,
        },
      ])
      .select();

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      });
    }

    return {
      statusCode: 200,
      data: data[0],
    };
  } catch (error: any) {
    console.error("error: ", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Error generating test questions",
    });
  }
});
