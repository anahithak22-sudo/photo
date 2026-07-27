import { useCallback, useState } from "react";

type Status = "idle" | "loading" | "error" | "success";

export function useAnalysis<T>() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<T | null>(null);

  const run = useCallback(async (fn: () => Promise<T>) => {
    setStatus("loading");
    setError(null);
    try {
      const result = await fn();
      setData(result);
      setStatus("success");
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
      setStatus("error");
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setData(null);
  }, []);

  return { status, error, data, run, reset };
}
