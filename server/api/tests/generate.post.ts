import { randomUUID } from "crypto";
import { serverSupabaseClient } from "#supabase/server";
import { Question } from "~/types/questions";

const cleanOutput = (output: string) => {
  const cleanJsonString = output.replace(/^```json\n|\n```$/g, "").trim();
  return JSON.parse(cleanJsonString);
};

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const {
    fileId,
    maxQuestions,
    difficulty,
    courseId,
    title,
    testType,
    duration,
    description,
    userId,
  } = body;

  const supabaseClient = await serverSupabaseClient(event);

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

    console.log("aggregatedResponse: ", aggregatedResponse);

    const cleanedResponse = cleanOutput(
      aggregatedResponse?.candidates[0].content.parts[0].text
    );

    cleanedResponse.forEach((question: Question) => {
      question.id = randomUUID();
    });

    const { data, error } = await supabaseClient
      .from("tests")
      .insert([
        {
          course_id: courseId,
          title,
          questions: cleanedResponse,
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
    console.log("error: ", error);
    throw createError({
      statusCode: 500,
      statusMessage:
        error.statusMessage ||
        error.message ||
        "Error generating test questions",
    });
  }
});
