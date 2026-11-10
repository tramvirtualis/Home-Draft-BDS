import { useState, type FormEvent } from "react";
import { getErrorMessage } from "../../api";
import { adminRagService } from "../../services/rag/adminRagService";
import type { RagAskResponse } from "../../types/rag/rag.types";

// Số [n] AI trích trong câu trả lời
const citedIndexes = (answer: string) => new Set([...answer.matchAll(/\[(\d+)\]/g)].map((m) => Number(m[1])));

// Tab Hỏi thử: gửi câu hỏi và giữ câu trả lời kèm các đoạn AI đã lấy
export function useRagAsk() {
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [result, setResult] = useState<RagAskResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!question.trim() || asking) return;
    setAsking(true);
    setError(null);
    try {
      setResult(await adminRagService.ask(question.trim()));
    } catch (err) {
      setResult(null);
      setError(getErrorMessage(err));
    } finally {
      setAsking(false);
    }
  };

  const cited = result ? citedIndexes(result.answer) : new Set<number>();

  return { question, setQuestion, asking, result, error, submit, cited };
}
