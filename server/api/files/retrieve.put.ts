import { S3, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { fileName } = body;
  console.log("Event: ", event);
  console.log("Body: ", body);

  const s3Client = new S3({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    signatureVersion: "v4",
    version: "2024-01-01",
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: fileName,
  });

  try {
    event.node.res.setHeader(
      "Access-Control-Allow-Origin",
      "http://localhost:3000"
    );
    event.node.res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST");
    event.node.res.setHeader("Access-Control-Allow-Headers", "*");
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });

    return signedUrl;
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error generating signed URL",
    });
  }
});
