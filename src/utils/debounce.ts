export function debounce(fn: () => unknown) {
  let timerId: NodeJS.Timeout | null = null;
  return () => {
    if (timerId) return;
    timerId = setTimeout(() => {
      fn();
      timerId = null;
    }, 300);
  };
}
