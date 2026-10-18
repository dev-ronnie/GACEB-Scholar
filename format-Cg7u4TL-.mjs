//#region node_modules/.nitro/vite/services/ssr/assets/format-Cg7u4TL-.js
function ugx(n) {
	return "Sh. " + Number(n).toLocaleString("en-UG");
}
function fmtNum(n) {
	return /^0\d{9}$/.test(n) ? n.replace(/^(\d{4})(\d{3})(\d{3})$/, "$1 $2 $3") : n;
}
function planLen(hours) {
	if (hours === 24) return "24 hours";
	if (hours === 8760) return "365 days";
	return `${hours / 24} days`;
}
function isoDate(d) {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function monthMatrix(year, month) {
	const startPad = (new Date(year, month, 1).getDay() + 6) % 7;
	const days = new Date(year, month + 1, 0).getDate();
	const cells = [];
	for (let i = 0; i < startPad; i++) cells.push(null);
	for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
	while (cells.length % 7 !== 0) cells.push(null);
	return cells;
}
function dupMsg(message) {
	return /duplicate|unique/i.test(message) ? "That transaction ID was already submitted." : message;
}
function prettyDate(iso) {
	const [y, m, d] = iso.split("-").map(Number);
	if (!y || !m || !d) return iso;
	return new Date(y, m - 1, d).toLocaleDateString("en-UG", {
		day: "numeric",
		month: "long",
		year: "numeric"
	});
}
//#endregion
export { planLen as a, monthMatrix as i, fmtNum as n, prettyDate as o, isoDate as r, ugx as s, dupMsg as t };
