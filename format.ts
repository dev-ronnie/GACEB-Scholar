export function ugx(n: number) {
  return "Sh. " + Number(n).toLocaleString("en-UG");
}

export function fmtNum(n: string) {
  return /^0\d{9}$/.test(n) ? n.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3") : n;
}

export function planLen(hours: number) {
  if (hours === 24) return "24 hours";
  if (hours === 8760) return "365 days";
  return `${hours / 24} days`;
}

export function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function monthMatrix(year: number, month: number) {
  const first = new Date(year, month, 1);
  const startPad = (first.getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startPad; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function dupMsg(message: string) {
  return /duplicate|unique/i.test(message)
    ? "That transaction ID was already submitted."
    : message;
}

export function prettyDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  return new Date(y, m - 1, d).toLocaleDateString("en-UG", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
