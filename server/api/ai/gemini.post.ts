import { VertexAI } from "@google-cloud/vertexai";
import { MULTIPLE_CHOICE_PROMPT } from "~/utils/prompts";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { fileContent, maxQuestions, difficulty } = body;

  const vertex_ai = new VertexAI({
    project: process.env.VERTEX_PROJECT,
    location: process.env.VERTEX_REGION,
  });

  const model = "gemini-1.5-flash-001";

  const generativeModel = vertex_ai.preview.getGenerativeModel({
    model: model,
    systemInstruction: {
      role: "system",
      parts: [
        {
          text: MULTIPLE_CHOICE_PROMPT(maxQuestions, difficulty),
        },
      ],
    },
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 1,
      topP: 0.95,
    },
  });

  const req = {
    contents: [
      {
        role: "user",
        parts: [{ text: fileContent }],
      },
    ],
  };

  try {
    const streamingResp = await generativeModel.generateContentStream(req);
    const aggregatedResponse = await streamingResp.response;

    return {
      aggregatedResponse,
    };
  } catch (error) {
    console.error("Error generating content:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error generating content",
    });
  }
});
