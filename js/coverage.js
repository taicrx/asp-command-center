const ASP_COVERAGE = {
  syndromeMap: {
    uti: {
      label: "UTI",
      organisms: ["Escherichia coli", "Klebsiella pneumoniae", "Proteus mirabilis"],
      drugs: ["CRO", "CAZ", "FEP", "TZP", "CIP", "LVX", "ETP", "IPM", "MEM", "SXT"]
    },
    pneumonia: {
      label: "Pneumonia / HAP",
      organisms: ["Pseudomonas aeruginosa", "Acinetobacter baumannii", "Klebsiella pneumoniae", "Staphylococcus aureus"],
      drugs: ["CAZ", "FEP", "TZP", "IPM", "MEM", "LVX", "TGC", "VA", "LZD"]
    },
    bsi: {
      label: "Bloodstream infection",
      organisms: ["Escherichia coli", "Klebsiella pneumoniae", "Pseudomonas aeruginosa", "Staphylococcus aureus", "Enterococcus faecium", "Enterococcus faecalis"],
      drugs: ["CRO", "FEP", "TZP", "IPM", "MEM", "VA", "LZD", "DAP"]
    },
    iai: {
      label: "Intra-abdominal infection",
      organisms: ["Escherichia coli", "Klebsiella pneumoniae", "Bacteroides fragilis", "Enterococcus faecalis"],
      drugs: ["CRO", "TZP", "ETP", "IPM", "MEM", "TGC"]
    }
  },

  render() {
    if (!ASP_STATE.antibiogram.length) return;

    const syndrome = document.getElementById("syndromeSelect").value;
    const minCount = Number(document.getElementById("minCountSelect").value);
    const config = this.syndromeMap[syndrome];

    const selectedRows = ASP_HEATMAP.getSelectedRows()
      .filter(r =>
        config.organisms.some(o =>
          r.Organism.toLowerCase().includes(o.toLowerCase())
        )
      )
      .filter(r => r.IsolateCount === null || r.IsolateCount >= minCount);

    const cards = config.drugs.map(drug => {
      const rowsForDrug = selectedRows.filter(r => r.Drug === drug);
      const weighted = this.weightedSusceptibility(rowsForDrug);
      const totalN = rowsForDrug.map(r => r.IsolateCount || 0).reduce((a, b) => a + b, 0);
      return { drug, weighted, totalN, rows: rowsForDrug.length, rowsForDrug };
    }).filter(x => x.weighted !== null)
      .sort((a, b) => b.weighted - a.weighted);

    this.renderCards(cards, config);
    this.renderDetail(cards);
  },

  weightedSusceptibility(rows) {
    if (!rows.length) return null;

    let weightedSum = 0;
    let weightTotal = 0;

    rows.forEach(r => {
      const n = r.IsolateCount || 1;
      if (r.SusceptibilityPercent !== null) {
        weightedSum += r.SusceptibilityPercent * n;
        weightTotal += n;
      }
    });

    if (!weightTotal) return null;
    return weightedSum / weightTotal;
  },

  renderCards(cards, config) {
    const container = document.getElementById("coverageContainer");
    const rec = document.getElementById("coverageRecommendation");

    if (!cards.length) {
      container.innerHTML = `<div class="small">No coverage matrix data available for selected criteria.</div>`;
      rec.innerHTML = "";
      return;
    }

    const top = cards[0];
    const second = cards[1];

    rec.innerHTML =
      `<strong>${config.label} local empirical coverage estimate</strong><br>` +
      `Highest estimated coverage: <strong>${top.drug} (${ASP_UTILS.fmtPct(top.weighted)})</strong>` +
      (second ? `<br>Second option: <strong>${second.drug} (${ASP_UTILS.fmtPct(second.weighted)})</strong>` : "") +
      `<br><span class="small">Interpret with syndrome severity, source control, renal function, prior MDRO, colonization history, allergy, and institutional policy.</span>`;

    container.innerHTML = cards.map(c => `
      <div class="coverage-card ${ASP_UTILS.heatClass(c.weighted)}">
        <div class="coverage-drug">${c.drug}</div>
        <div class="coverage-value">${ASP_UTILS.fmtPct(c.weighted)}</div>
        <div class="coverage-note">Weighted coverage · n=${c.totalN || "-"} · rows=${c.rows}</div>
      </div>
    `).join("");
  },

  renderDetail(cards) {
    const container = document.getElementById("coverageDetailContainer");

    if (!cards.length) {
      container.innerHTML = "";
      return;
    }

    const html = [
      `<table>`,
      `<thead><tr><th>Drug</th><th>Weighted coverage</th><th>Total isolate count</th><th>Organism rows used</th></tr></thead>`,
      `<tbody>`
    ];

    cards.forEach(c => {
      html.push(`<tr><td>${c.drug}</td><td>${ASP_UTILS.fmtPct(c.weighted)}</td><td>${c.totalN || "-"}</td><td>${c.rows}</td></tr>`);
    });

    html.push(`</tbody></table>`);
    container.innerHTML = html.join("");
  }
};
