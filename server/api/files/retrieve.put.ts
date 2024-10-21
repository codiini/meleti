import { AwsClient } from "aws4fetch";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { fileName } = body;

  const s3Client = new AwsClient({
    service: "s3",
    region: "auto",
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  });

  const url = new URL(
    `https://${process.env.R2_BUCKET_NAME}.${
      process.env.CLOUDFLARE_ACCOUNT_ID
    }.r2.cloudflarestorage.com`
  );
  url.pathname = fileName;
  url.searchParams.set("X-Amz-Expires", "3600");

  try {
    const response = await s3Client
      .sign(new Request(url, { method: "GET" }), {
        aws: {
          signQuery: true,
        },
      })
     
    return {
      statusCode: 200,
      data: response.url,
    };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error generating signed URL",
    });
  }
});
