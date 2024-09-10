import { MULTIPLE_CHOICE_PROMPT } from "~/utils/prompts";

const AI_URL = `https://gateway.ai.cloudflare.com/v1/${process.env.CLOUDFLARE_ACCOUNT_ID}/${process.env.CLOUDFLARE_AI_GATEWAY_ID}/`;

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { fileContent, maxQuestions, difficulty } = body;

  const response = await $fetch(AI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: [
      {
        provider: "openai",
        endpoint: "chat/completions",
        headers: {
          Authorization: `Bearer ${process.env.OPEN_AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        query: {
          model: "gpt-4o-mini",
          stream: true,
          messages: [
            {
              role: "system",
              content: MULTIPLE_CHOICE_PROMPT(maxQuestions, difficulty),
            },
            {
              role: "user",
              content: fileContent,
            },
          ],
        },
      },
      {
        provider: "workers-ai",
        endpoint: "@cf/meta/llama-3.1-8b-instruct",
        headers: {
          Authorization: `Bearer ${process.env.CLOUDFLARE_AI_API_KEY}`,
          "Content-Type": "application/json",
        },
        query: {
          messages: [
            {
              role: "system",
              content: MULTIPLE_CHOICE_PROMPT(maxQuestions, difficulty),
            },
            {
              role: "user",
              content: fileContent,
            },
          ],
        },
      },
    ],
  });

  return response;
});
