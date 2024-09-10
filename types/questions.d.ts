type Options = {
  id: string;
  text: string;
  isCorrect: boolean;
};

export type Question = {
  id: string;
  question: string;
  options: Options[];
  correctAnswer: string;
};

export type TestInfo = {
  id: string;
  duration: number;
  title: string;
  description: string;
  questions: Questions[];
};
