import { useEffect, useState, type DependencyList } from "react"

type AsyncDataState<T> = {
  data: T
  isLoading: boolean
  error: Error | null
}

export function useAsyncData<T>(load: () => Promise<T>, initialData: T, dependencies: DependencyList = []) {
  const [reloadToken, setReloadToken] = useState(0)
  const [state, setState] = useState<AsyncDataState<T>>({
    data: initialData,
    isLoading: true,
    error: null,
  })

  useEffect(() => {
    let isCurrent = true

    setState((current) => ({ ...current, isLoading: true, error: null }))
    load()
      .then((data) => {
        if (isCurrent) {
          setState({ data, isLoading: false, error: null })
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setState((current) => ({
            ...current,
            isLoading: false,
            error: error instanceof Error ? error : new Error("Failed to load API data"),
          }))
        }
      })

    return () => {
      isCurrent = false
    }
    // The caller owns the dependency list so pages can keep API wiring minimal.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencies, reloadToken])

  return {
    ...state,
    reload: () => setReloadToken((token) => token + 1),
  }
}
