import { S3, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { fileName, fileType }: { fileName: string; fileType: string } = body;

  const uniqueFileName = `${randomUUID()}-${fileName}`;

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

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME,
    Key: uniqueFileName,
    ContentType: fileType,
  });

  try {
    const signedUrl = await getSignedUrl(s3Client, command, {
      expiresIn: 3600,
    });
    event.node.res.setHeader(
      "Access-Control-Allow-Origin",
      "http://localhost:3000"
    );
    event.node.res.setHeader("Access-Control-Allow-Methods", "GET, PUT, POST");
    event.node.res.setHeader("Access-Control-Allow-Headers", "*");
    return {
      signedUrl,
      fileName,
      uniqueFileName,
      fileType,
      fileUrl: `https://${process.env.R2_BUCKET_NAME}.${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${uniqueFileName}`,
      statusCode: 200,
    };
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error generating signed URL",
    });
  }
});
