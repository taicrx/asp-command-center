const ASP_STATE = {
  aspMonthly: [],
  antibiogram: [],
  charts: {}
};

const ASP_LABELS = {
  Total_Carbapenem_DDD_num: "Total carbapenem DDD",
  Meropenem_DDD_num: "Meropenem DDD",
  Imipenem_DDD_num: "Imipenem DDD",
  Ertapenem_DDD_num: "Ertapenem DDD",
  Doripenem_DDD_num: "Doripenem DDD",
  Vancomycin_DDD_num: "Vancomycin DDD",
  Teicoplanin_DDD_num: "Teicoplanin DDD",
  CRKP_Rate_num: "CRKP rate",
  CRAB_Rate_num: "CRAB rate",
  CRPA_Rate_num: "CRPA rate",
  CREC_Rate_num: "CREC rate",
  MRSA_Rate_num: "MRSA rate",
  VRE_Rate_num: "VRE rate"
};

const ASP_UTILS = {
  setStatus(text) {
    document.getElementById("dataStatus").innerText = text;
  },

  toNum(v) {
    if (v === null || v === undefined || v === "") return null;
    const cleaned = String(v).replace("%", "").replace(",", "").trim();
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : null;
  },

  fmtPct(v) {
    if (v === null || v === undefined || Number.isNaN(v)) return "-";
    const num = Number(v);
    if (num <= 1) return `${(num * 100).toFixed(1)}%`;
    return `${num.toFixed(1)}%`;
  },

  fmtNum(v) {
    if (v === null || v === undefined || Number.isNaN(v)) return "-";
    return Number(v).toFixed(1);
  },

  escapeHtml(str) {
    return String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  },

  heatClass(v) {
    if (v === null || v === undefined) return "hm-na";
    const n = Number(v);
    if (n >= 90) return "hm-high";
    if (n >= 80) return "hm-good";
    if (n >= 70) return "hm-mid";
    if (n >= 50) return "hm-low";
    return "hm-poor";
  },

  renderChart(canvasId, config) {
    if (ASP_STATE.charts[canvasId]) ASP_STATE.charts[canvasId].destroy();
    ASP_STATE.charts[canvasId] = new Chart(document.getElementById(canvasId), config);
  },

  parseCSV(text) {
    const rows = [];
    let row = [];
    let cur = "";
    let inQuotes = false;

    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const next = text[i + 1];

      if (ch === '"' && inQuotes && next === '"') {
        cur += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === "," && !inQuotes) {
        row.push(cur);
        cur = "";
      } else if ((ch === "\n" || ch === "\r") && !inQuotes) {
        if (cur || row.length) {
          row.push(cur);
          rows.push(row);
        }
        row = [];
        cur = "";
        if (ch === "\r" && next === "\n") i++;
      } else {
        cur += ch;
      }
    }

    if (cur || row.length) {
      row.push(cur);
      rows.push(row);
    }

    const headers = rows.shift().map(h => h.trim());
    return rows
      .filter(r => r.some(x => String(x).trim() !== ""))
      .map(r => Object.fromEntries(headers.map((h, i) => [h, (r[i] || "").trim()])));
  },

  async fetchText(url) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.text();
  },

  changeFromPrevious(rows, key) {
    if (rows.length < 2) return null;
    const latest = rows[rows.length - 1][key];
    const prev = rows[rows.length - 2][key];
    if (latest === null || prev === null || prev === 0) return null;
    return ((latest - prev) / prev) * 100;
  }
};
