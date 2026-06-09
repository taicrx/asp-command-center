const ASP_CHARTS = {
  renderAll() {
    this.renderKpis();
    this.renderOverviewMdro();
    this.renderCarbapenemPressure();
    this.renderAntiMrsaPressure();
    this.renderCorrelation();
  },

  labels() {
    return ASP_STATE.aspMonthly.map(r => r.YYYYMM);
  },

  renderKpis() {
    const rows = ASP_STATE.aspMonthly;
    if (!rows.length) return;

    const latest = rows[rows.length - 1];
    const fPct = ASP_UTILS.fmtPct;
    const fNum = ASP_UTILS.fmtNum;

    document.getElementById("kpiCRKP").innerText = fPct(latest.CRKP_Rate_num);
    document.getElementById("kpiCRAB").innerText = fPct(latest.CRAB_Rate_num);
    document.getElementById("kpiCRPA").innerText = fPct(latest.CRPA_Rate_num);
    document.getElementById("kpiMRSA").innerText = fPct(latest.MRSA_Rate_num);
    document.getElementById("kpiVRE").innerText = fPct(latest.VRE_Rate_num);
    document.getElementById("kpiCarbapenem").innerText = fNum(latest.Total_Carbapenem_DDD_num);
    document.getElementById("kpiVancomycin").innerText = fNum(latest.Vancomycin_DDD_num);
    document.getElementById("kpiTeicoplanin").innerText = fNum(latest.Teicoplanin_DDD_num);
  },

  renderOverviewMdro() {
    const labels = this.labels();
    const rows = ASP_STATE.aspMonthly;

    ASP_UTILS.renderChart("overviewMdroChart", {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "CRKP", data: rows.map(r => r.CRKP_Rate_num) },
          { label: "CRAB", data: rows.map(r => r.CRAB_Rate_num) },
          { label: "CRPA", data: rows.map(r => r.CRPA_Rate_num) },
          { label: "MRSA", data: rows.map(r => r.MRSA_Rate_num) },
          { label: "VRE", data: rows.map(r => r.VRE_Rate_num) }
        ]
      },
      options: this.lineOptions("Rate")
    });
  },

  renderCarbapenemPressure() {
    const labels = this.labels();
    const rows = ASP_STATE.aspMonthly;

    ASP_UTILS.renderChart("carbapenemPressureChart", {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Total carbapenem DDD", data: rows.map(r => r.Total_Carbapenem_DDD_num), yAxisID: "yDDD" },
          { label: "CRKP", data: rows.map(r => r.CRKP_Rate_num), yAxisID: "yRate" },
          { label: "CRAB", data: rows.map(r => r.CRAB_Rate_num), yAxisID: "yRate" },
          { label: "CRPA", data: rows.map(r => r.CRPA_Rate_num), yAxisID: "yRate" },
          { label: "CREC", data: rows.map(r => r.CREC_Rate_num), yAxisID: "yRate" }
        ]
      },
      options: this.dualAxisOptions("DDD", "Rate")
    });
  },

  renderAntiMrsaPressure() {
    const labels = this.labels();
    const rows = ASP_STATE.aspMonthly;

    ASP_UTILS.renderChart("antiMrsaPressureChart", {
      type: "line",
      data: {
        labels,
        datasets: [
          { label: "Vancomycin DDD", data: rows.map(r => r.Vancomycin_DDD_num), yAxisID: "yDDD" },
          { label: "Teicoplanin DDD", data: rows.map(r => r.Teicoplanin_DDD_num), yAxisID: "yDDD" },
          { label: "MRSA", data: rows.map(r => r.MRSA_Rate_num), yAxisID: "yRate" },
          { label: "VRE", data: rows.map(r => r.VRE_Rate_num), yAxisID: "yRate" }
        ]
      },
      options: this.dualAxisOptions("DDD", "Rate")
    });
  },

  renderCorrelation() {
    const rows = ASP_STATE.aspMonthly;
    if (!rows.length) return;

    const xKey = document.getElementById("corrX").value;
    const yKey = document.getElementById("corrY").value;

    const points = rows
      .filter(r => r[xKey] !== null && r[yKey] !== null)
      .map(r => ({ x: r[xKey], y: r[yKey], period: r.YYYYMM }));

    ASP_UTILS.renderChart("customCorrelationChart", {
      type: "scatter",
      data: {
        datasets: [{
          label: `${ASP_LABELS[xKey]} vs ${ASP_LABELS[yKey]}`,
          data: points
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: "bottom" },
          tooltip: {
            callbacks: {
              label: ctx => {
                const p = ctx.raw;
                return `${p.period}: ${ASP_LABELS[xKey]} ${ASP_UTILS.fmtNum(p.x)}, ${ASP_LABELS[yKey]} ${ASP_UTILS.fmtPct(p.y)}`;
              }
            }
          }
        },
        scales: {
          x: { title: { display: true, text: ASP_LABELS[xKey] } },
          y: { title: { display: true, text: ASP_LABELS[yKey] } }
        }
      }
    });

    document.getElementById("corrSummary").innerText =
      `Showing ${points.length} paired monthly observations. Exploratory relationship only; correlation does not imply causality.`;
  },

  lineOptions(yTitle) {
    return {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { position: "bottom" } },
      scales: { y: { title: { display: true, text: yTitle } } }
    };
  },

  dualAxisOptions(leftTitle, rightTitle) {
    return {
      responsive: true,
      interaction: { mode: "index", intersect: false },
      plugins: { legend: { position: "bottom" } },
      scales: {
        yDDD: {
          type: "linear",
          position: "left",
          title: { display: true, text: leftTitle }
        },
        yRate: {
          type: "linear",
          position: "right",
          title: { display: true, text: rightTitle },
          grid: { drawOnChartArea: false }
        }
      }
    };
  }
};
