import { AwsClient } from "aws4fetch";
import { randomUUID } from "crypto";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { fileName, fileType }: { fileName: string; fileType: string } = body;

  const uniqueFileName = `${randomUUID()}-${fileName}`;

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
  url.pathname = uniqueFileName;
  url.searchParams.set("X-Amz-Expires", "3600");

  try {
    const signedUrl = await s3Client.sign(new Request(url, { method: "PUT" }), {
      aws: {
        signQuery: true
      },
    })

    return {
      signedUrl: signedUrl.url,
      fileName,
      uniqueFileName,
      fileType,
      fileUrl: `https://${process.env.R2_BUCKET_NAME}.${process.env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com/${uniqueFileName}`,
      statusCode: 200,
    };
  } catch (error: any) {
    console.error("Error generating signed URL:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
