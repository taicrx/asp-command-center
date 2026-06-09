const ASP_HEATMAP = {
  drugsForHeatmap: [
    "CRO", "CAZ", "FEP", "TZP", "CIP", "LVX",
    "AN", "GM", "IPM", "MEM", "ETP", "TGC",
    "LZD", "VA", "TEC", "DAP", "OX", "SXT"
  ],

  initControls() {
    this.populatePeriodSelect();
    this.populateTrendSelectors();
  },

  renderAll() {
    this.renderHeatmap();
    ASP_COVERAGE.render();
    this.renderTrend();
  },

  populatePeriodSelect() {
    const select = document.getElementById("periodSelect");
    select.innerHTML = "";

    const periods = [...new Set(ASP_STATE.antibiogram.map(r => `${r.Year}|${r.Period}`))]
      .filter(x => x !== "|")
      .sort();

    periods.forEach(p => {
      const [year, period] = p.split("|");
      const opt = document.createElement("option");
      opt.value = p;
      opt.textContent = `${year} ${period}`;
      select.appendChild(opt);
    });

    if (periods.length) select.value = periods[periods.length - 1];
  },

  populateTrendSelectors() {
    const orgSelect = document.getElementById("trendOrganismSelect");
    const drugSelect = document.getElementById("trendDrugSelect");
    orgSelect.innerHTML = "";
    drugSelect.innerHTML = "";

    const organisms = [...new Set(ASP_STATE.antibiogram.map(r => r.Organism))].sort();
    const drugs = [...new Set(ASP_STATE.antibiogram.map(r => r.Drug))].sort();

    organisms.forEach(x => {
      const opt = document.createElement("option");
      opt.value = x;
      opt.textContent = x;
      orgSelect.appendChild(opt);
    });

    drugs.forEach(x => {
      const opt = document.createElement("option");
      opt.value = x;
      opt.textContent = x;
      drugSelect.appendChild(opt);
    });

    if (organisms.includes("Escherichia coli")) orgSelect.value = "Escherichia coli";
    if (drugs.includes("CRO")) drugSelect.value = "CRO";
  },

  getSelectedRows() {
    const select = document.getElementById("periodSelect");
    const key = select.value;
    const [year, period] = key.split("|");

    let rows = ASP_STATE.antibiogram.filter(r => r.Year === year && r.Period === period);
    const group = document.getElementById("organismGroup").value;

    if (group === "gnb") {
      rows = rows.filter(r =>
        /coli|klebsiella|pseudomonas|acinetobacter|proteus|serratia|enterobacter|citrobacter|morganella|providencia/i.test(r.Organism)
      );
    } else if (group === "gpc") {
      rows = rows.filter(r =>
        /staphylococcus|enterococcus|streptococcus/i.test(r.Organism)
      );
    } else if (group === "mdro") {
      rows = rows.filter(r =>
        /CRKP|CRAB|CRPA|CREC|MRSA|VRE|MDRAB/i.test(r.Organism)
      );
    }

    return rows;
  },

  renderHeatmap() {
    const rows = this.getSelectedRows();
    const organisms = [...new Set(rows.map(r => r.Organism))].slice(0, 24);
    const drugs = this.drugsForHeatmap.filter(d => rows.some(r => r.Drug === d));

    const container = document.getElementById("heatmapContainer");

    if (!organisms.length || !drugs.length) {
      container.innerHTML = `<div class="small">No heatmap data available for the selected period/group.</div>`;
      return;
    }

    const html = [
      `<table class="heatmap-table">`,
      `<thead><tr><th>Organism</th>${drugs.map(d => `<th>${d}</th>`).join("")}</tr></thead>`,
      `<tbody>`
    ];

    organisms.forEach(org => {
      html.push(`<tr><td>${ASP_UTILS.escapeHtml(org)}</td>`);
      drugs.forEach(drug => {
        const match = rows.find(r => r.Organism === org && r.Drug === drug);
        if (!match) {
          html.push(`<td class="heat-cell hm-na">-</td>`);
        } else {
          const cls = ASP_UTILS.heatClass(match.SusceptibilityPercent);
          html.push(`<td class="heat-cell ${cls}" title="n=${match.IsolateCount ?? "-"}">${ASP_UTILS.fmtPct(match.SusceptibilityPercent)}</td>`);
        }
      });
      html.push(`</tr>`);
    });

    html.push(`</tbody></table>`);
    container.innerHTML = html.join("");
  },

  renderTrend() {
    const org = document.getElementById("trendOrganismSelect").value;
    const drug = document.getElementById("trendDrugSelect").value;

    const rows = ASP_STATE.antibiogram
      .filter(r => r.Organism === org && r.Drug === drug)
      .sort((a, b) => `${a.Year}-${a.Period}`.localeCompare(`${b.Year}-${b.Period}`));

    ASP_UTILS.renderChart("antibiogramTrendChart", {
      type: "line",
      data: {
        labels: rows.map(r => `${r.Year} ${r.Period}`),
        datasets: [{ label: `${org} ${drug} susceptibility`, data: rows.map(r => r.SusceptibilityPercent) }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { title: { display: true, text: "Susceptibility %" } } }
      }
    });
  },

  renderTable(rows) {
    const tbody = document.querySelector("#antibiogramTable tbody");
    tbody.innerHTML = "";

    rows.forEach(r => {
      const tr = document.createElement("tr");
      ["Year", "Period", "Organism", "Drug", "IsolateCount", "SusceptibilityPercent", "Location"].forEach(k => {
        const td = document.createElement("td");
        td.innerText = k === "SusceptibilityPercent" ? ASP_UTILS.fmtPct(r[k]) : (r[k] ?? "");
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  },

  filterTable() {
    const q = document.getElementById("organismSearch").value.trim().toLowerCase();

    if (!ASP_STATE.antibiogram.length) {
      document.getElementById("antibiogramStatus").innerText =
        "Fact_Antibiogram 尚未載入。請確認 config.js CSV URL。";
      return;
    }

    if (!q) {
      this.renderTable(ASP_STATE.antibiogram.slice(0, 100));
      return;
    }

    const rows = ASP_STATE.antibiogram
      .filter(r => String(r.Organism || "").toLowerCase().includes(q))
      .slice(0, 200);

    this.renderTable(rows);
    document.getElementById("antibiogramStatus").innerText =
      `Search result: ${rows.length} rows shown.`;
  }
};
