type DebouncedFn<T extends (...args: never[]) => void> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => void;
};

export const debounce = <T extends (...args: never[]) => void>(
  func: T,
  delay: number,
): DebouncedFn<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  let lastArgs: Parameters<T> | undefined;

  const debounced = (...args: Parameters<T>): void => {
    lastArgs = args;
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
      timeoutId = undefined;
      lastArgs = undefined;
    }, delay);
  };

  debounced.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = undefined;
    lastArgs = undefined;
  };

  debounced.flush = () => {
    if (timeoutId !== undefined && lastArgs !== undefined) {
      clearTimeout(timeoutId);
      func(...lastArgs);
      timeoutId = undefined;
      lastArgs = undefined;
    }
  };

  return debounced;
};
