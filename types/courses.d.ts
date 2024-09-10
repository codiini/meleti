export type Course = {
  id: string;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  materials: CourseFile[];
};

export type CourseFile = {
  id: string;
  unique_file_name: string;
  file_name: string;
  deleting?: boolean;
};
