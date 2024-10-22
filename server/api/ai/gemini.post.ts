import { SchemaType, VertexAI } from "@google-cloud/vertexai";
import { MULTIPLE_CHOICE_PROMPT } from "~/utils/prompts";

export default defineEventHandler(async (event) => {
  const GOOGLE_APPLICATION_CREDENTIALS = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS as string
  );

  const body = await readBody(event);
  const { fileContent, maxQuestions, difficulty } = body;

  const vertex_ai = new VertexAI({
    project: process.env.VERTEX_PROJECT,
    location: process.env.VERTEX_REGION,
    googleAuthOptions: {
      credentials: GOOGLE_APPLICATION_CREDENTIALS,
    },
  });

  const model = "gemini-1.5-pro";

  const schema = {
    description: 'List of Questions',
    type: SchemaType.ARRAY,
    items: {
      type: SchemaType.OBJECT,
      properties: {
        question: {
          type: SchemaType.STRING,
          description: 'The question text',
        },
        options: {
          type: SchemaType.ARRAY,
          items: {
            type: SchemaType.OBJECT,
            properties: {
              label: {
                type: SchemaType.STRING,
                description: 'The display label for the option',
              },
              value: {
                type: SchemaType.STRING,
                description: 'The letter value associated with the option',
              },
            },
            required: ['label', 'value'], // Specify required fields for options
          },
        },
        explanation: {
          type: SchemaType.STRING,
          description: 'Explanation for the correct answer',
        },
        correctAnswer: {
          type: SchemaType.STRING,
          description: 'The correct answer to the question',
        },
      },
      required: ['question', 'options', 'explanation', 'correctAnswer'], // Specify required fields for the question
    },
  }

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
      responseSchema: schema,
      responseMimeType: "application/json",
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

    const formattedResponse = JSON.parse( aggregatedResponse?.candidates[0].content.parts[0].text);

    return {
      aggregatedResponse: formattedResponse,
    };
  } catch (error) {
    console.error("Error generating content:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error generating content",
    });
  }
});
