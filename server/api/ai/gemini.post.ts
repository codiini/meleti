import { VertexAI } from "@google-cloud/vertexai";
import { ExternalAccountClient } from "google-auth-library";
import { getVercelOidcToken } from "@vercel/functions/oidc";
import { MULTIPLE_CHOICE_PROMPT } from "~/utils/prompts";

const GCP_PROJECT_ID = process.env.GCP_PROJECT_ID;
const GCP_PROJECT_NUMBER = process.env.GCP_PROJECT_NUMBER;
const GCP_SERVICE_ACCOUNT_EMAIL = process.env.GCP_SERVICE_ACCOUNT_EMAIL;
const GCP_WORKLOAD_IDENTITY_POOL_ID = process.env.GCP_WORKLOAD_IDENTITY_POOL_ID;
const GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID =
  process.env.GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID;

const authClient = ExternalAccountClient.fromJSON({
  type: "external_account",
  audience: `//iam.googleapis.com/projects/${GCP_PROJECT_NUMBER}/locations/global/workloadIdentityPools/${GCP_WORKLOAD_IDENTITY_POOL_ID}/providers/${GCP_WORKLOAD_IDENTITY_POOL_PROVIDER_ID}`,
  subject_token_type: "urn:ietf:params:oauth:token-type:jwt",
  token_url: "https://sts.googleapis.com/v1/token",
  service_account_impersonation_url: `https://iamcredentials.googleapis.com/v1/projects/-/serviceAccounts/${GCP_SERVICE_ACCOUNT_EMAIL}:generateAccessToken`,
  subject_token_supplier: {
    getSubjectToken: getVercelOidcToken,
  },
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { fileContent, maxQuestions, difficulty } = body;

  const vertex_ai = new VertexAI({
    project: process.env.VERTEX_PROJECT,
    location: process.env.VERTEX_REGION,
    googleAuthOptions: {
      authClient,
      projectId: GCP_PROJECT_ID,
    },
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
