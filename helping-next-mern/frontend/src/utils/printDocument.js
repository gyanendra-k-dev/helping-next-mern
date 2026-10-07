// Opens a clean print window for receipts / certificates. The user picks
// "Save as PDF" in the browser's print dialog to get a PDF copy.
export default function printDocument(title, bodyHtml) {
  const win = window.open("", "_blank", "width=820,height=900");
  if (!win) {
    alert("Please allow pop-ups for this site to download the document.");
    return;
  }
  win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${title}</title>
<style>
  body{font-family:Arial,Helvetica,sans-serif;color:#222;margin:0;padding:40px}
  .doc{max-width:680px;margin:0 auto;border:2px solid #222;padding:36px}
  h1{margin:0 0 4px;font-size:26px} h2{margin:24px 0 8px;font-size:18px}
  .muted{color:#666;font-size:13px} table{width:100%;border-collapse:collapse;margin-top:18px}
  td{padding:9px 0;border-bottom:1px solid #ddd;font-size:14px} td:first-child{color:#666;width:38%}
  .center{text-align:center} .big{font-size:30px;margin:18px 0}
  @media print{body{padding:0}}
</style></head><body>${bodyHtml}<script>window.onload=()=>{window.print()}<\/script></body></html>`);
  win.document.close();
}

export const escapeHtml = (v) =>
  String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
