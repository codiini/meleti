export const convertFileToBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = (error) => reject(error);
  });
};

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toISOString().split("T")[0];
}
