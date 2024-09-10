async function retrieveSignedUrl(file: string) {
  const { data } = await $fetch("/api/files/retrieve", {
    method: "PUT",
    body: {
      fileName: file,
    },
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(data);
  return { presignedUrl: data };
}

async function downloadFile(url: string): Promise<any> {
  const response = await $fetch(url, {
    method: "GET",
  });
  return response;
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { fileId } = body;

    console.log("FileId: ", fileId);

    const { presignedUrl } = await retrieveSignedUrl(fileId);

    const fileContent = await downloadFile(presignedUrl);

    if (!fileContent) {
      throw createError({
        statusCode: 500,
        statusMessage: "Error processing file",
      });
    }
    return {
      statusCode: 200,
      content: fileContent,
    } as {
      statusCode: number;
      content: string;
    };
  } catch (error) {
    console.error("Error processing files:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Error processing files",
    });
  }
});
