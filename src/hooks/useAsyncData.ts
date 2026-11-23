import { useCallback, useEffect, useState } from "react";
import { getErrorMessage } from "../utils/error.utils";

interface AsyncState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export interface AsyncData<T> extends AsyncState<T> {
  /** Re-runs the loader (keeps current data visible while loading). */
  reload: () => void;
  /** Replaces data locally (e.g. with the response of a mutation). */
  setData: (data: T) => void;
}

/**
 * Runs `loader` on mount and whenever it changes (memoize it with useCallback).
 * Pass `null` to skip loading (e.g. while a required id is missing).
 */
export function useAsyncData<T>(loader: (() => Promise<T>) | null): AsyncData<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    error: null,
    isLoading: loader !== null,
  });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (!loader) return;
    let active = true;
    loader()
      .then((data) => {
        if (active) setState({ data, error: null, isLoading: false });
      })
      .catch((err: unknown) => {
        if (active) {
          setState((prev) => ({
            ...prev,
            error: getErrorMessage(err, "No se pudieron cargar los datos."),
            isLoading: false,
          }));
        }
      });
    return () => {
      active = false;
    };
  }, [loader, version]);

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: true }));
    setVersion((v) => v + 1);
  }, []);

  const setData = useCallback((data: T) => {
    setState({ data, error: null, isLoading: false });
  }, []);

  return { ...state, reload, setData };
}
