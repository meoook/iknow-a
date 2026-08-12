export const formatDisplayDate = (val?: string | number | null): string => {
  if (val === undefined || val === null || val === '') return '—';

  // Numeric timestamp or string representation of a number
  let ts = typeof val === 'string' && !isNaN(Number(val)) ? Number(val) : val;
  if (typeof ts === 'number') {
    const d = new Date(ts > 1e11 ? ts : ts * 1000);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  if (typeof val === 'string') {
    const datePart = val.includes('T') ? val.split('T')[0] : val.split(' ')[0];

    // Handle DD.MM.YYYY format
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(datePart)) {
      const [d, m, y] = datePart.split('.');
      return `${y}-${m}-${d}`;
    }

    // Already YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
      return datePart;
    }

    const d = new Date(val);
    if (!isNaN(d.getTime())) {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }

    return datePart;
  }

  return String(val);
};
