export const formatIconUrl = (
  iconPath?: string | null,
  cacheBuster: number | string | boolean = true
): string => {
  if (!iconPath) {
    return 'http://localhost/static/tmp/no_icon.png';
  }

  // Handle path with existing query params (e.g. "tmp/icon.webp?v=123456")
  const [pathPart, queryPart] = iconPath.split('?');

  let fullUrl = pathPart;
  if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
    let cleanPath = pathPart;
    if (cleanPath.startsWith('/')) cleanPath = cleanPath.slice(1);
    if (cleanPath.startsWith('static/')) cleanPath = cleanPath.replace(/^static\//, '');
    fullUrl = `http://localhost/static/${cleanPath}`;
  }

  let finalQuery = queryPart || '';
  if (cacheBuster && !finalQuery.includes('v=')) {
    const ts = typeof cacheBuster === 'number' || typeof cacheBuster === 'string' ? cacheBuster : Date.now();
    finalQuery = finalQuery ? `${finalQuery}&v=${ts}` : `v=${ts}`;
  }

  return finalQuery ? `${fullUrl}?${finalQuery}` : fullUrl;
};
