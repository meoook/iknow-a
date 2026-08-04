export const formatDisplayDate = (val?: string | number | null): string => {
  if (val === undefined || val === null || val === '') return '—';
  let ts = typeof val === 'string' && !isNaN(Number(val)) ? Number(val) : val;
  if (typeof ts === 'number') {
    const d = new Date(ts > 1e11 ? ts : ts * 1000);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${day}.${month}.${year}`;
    }
  }
  if (typeof val === 'string') {
    if (val.includes('T')) return val.split('T')[0];
    return val;
  }
  return String(val);
};
