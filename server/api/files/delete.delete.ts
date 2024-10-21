import { AwsClient } from "aws4fetch";
import { serverSupabaseClient } from "#supabase/server";

export default defineEventHandler(async (event) => {
  const supabaseClient = await serverSupabaseClient(event);
  const userId = (await supabaseClient.auth.getUser()).data.user?.id;

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const fileId = getQuery(event).id as string;

  const ENDPOINT =
    `${process.env.R2_ENDPOINT}/${process.env.R2_BUCKET_NAME}/${fileId}` as string;

  const s3Client = new AwsClient({
    service: "s3",
    region: "auto",
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  });

  const deleteObject = async () => {
    try {
      await s3Client.fetch(ENDPOINT, {
        method: "DELETE",
      });

      const { error } = await supabaseClient
        .from("course_files")
        .delete()
        .eq("unique_file_name", fileId)
        .eq("user_id", userId);

      if (error) {
        throw createError({
          statusCode: 500,
          statusMessage: error.message,
        });
      }
      return {
        statusCode: 204,
        statusMessage: 'File Deleted Successfully'
      };
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      });
    }
  };
  await deleteObject();
});
