export function debounce(fn: (ev: UIEvent) => unknown) {
  let timerId: NodeJS.Timeout | null = null;
  return (ev: UIEvent) => {
    if (timerId) return;
    timerId = setTimeout(() => {
      fn(ev);
      timerId = null;
    }, 300);
  };
}
