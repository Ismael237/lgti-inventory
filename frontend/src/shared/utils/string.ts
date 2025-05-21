export function truncateText(
    text: string,
    startLength: number = 6,
    endLength: number = 4,
    withEnd: boolean = true
): string {
    if (!text || text.length <= startLength + endLength + 3) {
        return text;
    }

    const start = text.slice(0, startLength);
    const end = withEnd ? text.slice(-endLength) : "";

    return `${start}...${end}`;
}

export const getSidebarWidth = (isAuthenticated: boolean) => {
  let sidebarWidth = 0;

  if (isAuthenticated) {
    sidebarWidth = 226;
  }
  return `${sidebarWidth}px`;
};