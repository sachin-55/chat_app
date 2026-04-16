export const throttle = <T extends (...args: never[]) => void>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) & { cancel: () => void } => {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const throttled = (...args: Parameters<T>): void => {
    if (timeoutId === undefined) {
      func(...args); // fire immediately
      timeoutId = setTimeout(() => {
        timeoutId = undefined;
      }, limit);
    }
  };

  throttled.cancel = () => {
    clearTimeout(timeoutId);
    timeoutId = undefined;
  };

  return throttled;
};
