import type { Metadata } from "next";
import QuizPage from "@/components/academy/QuizPage";

export const metadata: Metadata = {
  title: "Airmation Academy — Quiz (Internal)",
  description: "A random 10-question knowledge check on Airmation's business and drone-show tech.",
  robots: { index: false, follow: false },
};

export default function InternalQuizPage() {
  return <QuizPage />;
}
