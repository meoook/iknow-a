export const formatIconUrl = (iconPath?: string | null): string => {
  if (!iconPath) return `${import.meta.env.VITE_IMG_URL}/tmp/no_icon.png`;
  return `${import.meta.env.VITE_IMG_URL}/${iconPath}?v=${Date.now()}`;
};
