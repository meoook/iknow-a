const PAGE_LOAD_VERSION = Date.now();

export const formatIconUrl = (iconPath?: string | null): string => {
  if (!iconPath) return `${import.meta.env.VITE_IMG_URL}/tmp/no_icon.png`;
  if (iconPath.startsWith('http://') || iconPath.startsWith('https://')) {
    return iconPath;
  }
  const cleanPath = iconPath.startsWith('/') ? iconPath.slice(1) : iconPath;
  const baseUrl = `${import.meta.env.VITE_IMG_URL}/${cleanPath}`;

  // If the path already has a version parameter (e.g. set by WebSocket update), keep it as is.
  if (baseUrl.includes('?v=')) {
    return baseUrl;
  }

  // Otherwise append the stable page-load session timestamp.
  // This ensures F5 / refresh fetches the latest image from server, while re-renders during the same session reuse the cached URL string.
  return `${baseUrl}?v=${PAGE_LOAD_VERSION}`;
};
