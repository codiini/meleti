import https from "https";
import path from "path";
import { IncomingMessage } from "http";
import { serverSupabaseClient } from "#supabase/server";

const API_KEY = process.env.PDF_CO_API_KEY as string;

type ConvertPdfToTextResponse = {
  url: string;
  status: "success" | "working" | "error";
};

async function getPresignedUrl(fileName: string): Promise<[string, string]> {
  try {
    const queryPath = `/v1/file/upload/get-presigned-url?contenttype=application/octet-stream&name=${path.basename(
      fileName
    )}`;
    const reqOptions = {
      host: "api.pdf.co",
      path: encodeURI(queryPath),
      headers: { "x-api-key": API_KEY },
    };

    // Send request
    const response = await new Promise<IncomingMessage>((resolve, reject) => {
      https.get(reqOptions, resolve).on("error", reject);
    });

    const data = await new Promise<string>((resolve) => {
      let rawData = "";
      response.on("data", (chunk) => {
        rawData += chunk;
      });
      response.on("end", () => resolve(rawData));
    });

    const parsedData = JSON.parse(data);

    if (!parsedData.error) {
      return [parsedData.presignedUrl, parsedData.url];
    } else {
      throw new Error(`getPresignedUrl(): ${parsedData.message}`);
    }
  } catch (error) {
    console.error("getPresignedUrl():", error);
    throw error;
  }
}

async function uploadFile(localFile: Buffer, uploadUrl: string): Promise<void> {
  try {
    const response = await $fetch(uploadUrl, {
      method: "PUT",
      body: localFile,
      headers: {
        "Content-Type": "application/octet-stream",
      },
    });
  } catch (error) {
    console.error("uploadFile() error:", error);
    throw error;
  }
}

async function convertPdfToText(
  apiKey: string,
  uploadedFileUrl: string,
  password: string,
  pages: string,
  destinationFile: string
): Promise<ConvertPdfToTextResponse | undefined> {
  const queryPath = `/v1/pdf/convert/to/text`;

  const jsonPayload = JSON.stringify({
    name: path.basename(destinationFile),
    password: password,
    pages: pages,
    url: uploadedFileUrl,
    async: true,
  });

  const reqOptions = {
    hostname: "api.pdf.co",
    method: "POST",
    path: queryPath,
    headers: {
      "x-api-key": apiKey,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(jsonPayload, "utf8"),
    },
  };

  try {
    const response = await new Promise<IncomingMessage>((resolve, reject) => {
      const req = https.request(reqOptions, resolve);
      req.on("error", reject);
      req.write(jsonPayload);
      req.end();
    });

    let rawData = "";
    for await (const chunk of response) {
      rawData += chunk;
    }

    const data = JSON.parse(rawData);

    if (data.error === false) {
      const result = await checkIfJobIsCompleted(
        data.jobId,
        data.resultFileUrl,
        destinationFile
      );
      return result as ConvertPdfToTextResponse;
    }
    return undefined;
  } catch (error) {
    console.error("convertPdfToText(): " + error);
  }
}

async function checkIfJobIsCompleted(
  jobId: string,
  resultFileUrl: string,
  destinationFile: string
): Promise<ConvertPdfToTextResponse | undefined> {
  const queryPath = `/v1/job/check`;

  let jsonPayload = JSON.stringify({
    jobid: jobId,
  });

  let reqOptions = {
    host: "api.pdf.co",
    path: queryPath,
    method: "POST",
    headers: {
      "x-api-key": API_KEY,
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(jsonPayload, "utf8"),
    },
  };

  try {
    const response = await new Promise<IncomingMessage>((resolve, reject) => {
      const req = https.request(reqOptions, resolve);
      req.on("error", reject);
      req.write(jsonPayload);
      req.end();
    });

    let rawData = "";
    for await (const chunk of response) {
      rawData += chunk;
    }

    const data = JSON.parse(rawData) as ConvertPdfToTextResponse;
    console.log(
      `Checking Job #${jobId}, Status: ${
        data.status
      }, Time: ${new Date().toLocaleString()}`
    );

    if (data.status === "working") {
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await checkIfJobIsCompleted(jobId, resultFileUrl, destinationFile);
    } else if (data.status === "success") {
      return data;
    } else {
      throw new Error(`Operation ended with status: "${data.status}".`);
    }
  } catch (error) {
    console.error("Error in checkIfJobIsCompleted:", error);
    throw error;
  }
}

export default defineEventHandler(async (event) => {
  const client = await serverSupabaseClient(event);
  const userId = (await client.auth.getUser()).data.user?.id;

  if (!userId) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized",
    });
  }

  const body = await readMultipartFormData(event);

  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing form data",
    });
  }

  const courseId = getQuery(event).courseId as string;

  const file = body.find((part) => part.name === "file");
  const fileName = (file?.filename as string).replace(".pdf", "");
  const fileData = file?.data;

  if (!fileData) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing file data",
    });
  }

  try {
    // 1. GET PRESIGNED URL
    const [uploadUrl, uploadedFileUrl] = await getPresignedUrl(fileName);

    // 2. UPLOAD THE FILE TO CLOUD
    await uploadFile(fileData, uploadUrl);

    // 3. CONVERT UPLOADED PDF FILE TO TEXT
    const { url } = await convertPdfToText(
      API_KEY,
      uploadedFileUrl,
      "",
      "",
      fileName
    );

    if (!url) {
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to convert PDF to text. Please try again later.",
      });
    }

    const textContent: string = await $fetch(url);

    const uploadData = await $fetch("/api/files/get-signed-url", {
      method: "PUT",
      body: {
        fileName: fileName,
        fileType: "text/plain",
      },
    });

    const {
      signedUrl,
      fileName: supabaseFileName,
      fileUrl,
      uniqueFileName,
      fileType,
    } = uploadData;

    try {
      await $fetch(signedUrl, {
        method: "PUT",
        body: textContent,
        headers: {
          "Content-Type": "text/plain",
        },
      });
    } catch (error: any) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      });
    }

    // 4. UPLOAD THE TEXT CONTENT TO SUPABASE
    const { data: materialData, error } = await client
      .from("course_files")
      .insert([
        {
          course_id: courseId,
          file_name: supabaseFileName,
          unique_file_name: uniqueFileName,
          file_url: fileUrl,
          file_type: fileType,
          user_id: userId,
        },
      ])
      .select();

    if (error) {
      throw createError({
        statusCode: 500,
        statusMessage: error.message,
      });
    }

    return {
      statusCode: 200,
      data: materialData[0],
    };
  } catch (error: any) {
    throw createError({
      statusCode: 500,
      statusMessage: error.message,
    });
  }
});
