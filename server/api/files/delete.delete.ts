import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const supabaseClient = await serverSupabaseClient(event);

  const fileId = getQuery(event).id as string;

  const s3Client = new S3Client({
    endpoint: process.env.R2_ENDPOINT,
    region: "auto",
    signatureVersion: "v4",
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
  });

  const deleteObject = async (bucketName: string, objectKey: string) => {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    try {
      await s3Client.send(command);
      const { error, data } = await supabaseClient
        .from("course_file")
        .delete()
        .eq("unique_file_name", fileId);

      if (error) {
        throw createError({
          statusCode: 500,
          statusMessage: error.message,
        });
      }
      return {
        statusCode: 204,
        body: data,
      };
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      });
    }
  };

  const response = await deleteObject(
    process.env.R2_BUCKET_NAME as string,
    fileId
  );

  return {
    statusCode: 200,
    body: response,
  };
});
