export const formatDisplayDate = (val?: string | number | null): string => {
  if (!val) return '';
  if (typeof val === 'number') {
    const d = new Date(val);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  if (typeof val === 'string' && val.includes('T')) {
    return val.split('T')[0];
  }
  return String(val);
};
