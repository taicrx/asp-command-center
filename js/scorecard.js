const ASP_SCORECARD = {
  init() {
    this.fillSelectors();
    this.render();
  },

  fillSelectors() {
    const rows = ASP_STATE.kpiTrend;
    const groups = [...new Set(rows.map(r => r.MetricGroup))].filter(Boolean).sort();
    const groupSelect = document.getElementById("scorecardGroupSelect");
    groupSelect.innerHTML = `<option value="all">All groups</option>` + groups.map(g => `<option value="${g}">${g}</option>`).join("");

    const metrics = [...new Set(rows.map(r => r.MetricName))].filter(Boolean).sort();
    const metricSelect = document.getElementById("scorecardMetricSelect");
    metricSelect.innerHTML = metrics.map(m => `<option value="${m}">${m}</option>`).join("");
    if (metrics.includes("MRSA rate")) metricSelect.value = "MRSA rate";
  },

  filtered() {
    const group = document.getElementById("scorecardGroupSelect").value;
    const loc = document.getElementById("scorecardLocationSelect").value;
    const measure = document.getElementById("scorecardMeasureSelect").value;
    return ASP_STATE.kpiTrend.filter(r =>
      (group === "all" || r.MetricGroup === group) &&
      (loc === "all" || r.Location === loc) &&
      (measure === "all" || r.MeasureType === measure)
    );
  },

  latestByMetric(rows) {
    const map = {};
    rows.forEach(r => {
      const key = `${r.MetricName}|${r.Location}`;
      if (!map[key] || r.YYYYMM > map[key].YYYYMM) map[key] = r;
    });
    return Object.values(map).sort((a,b) => a.MetricGroup.localeCompare(b.MetricGroup) || a.MetricName.localeCompare(b.MetricName));
  },

  render() {
    if (!ASP_STATE.kpiTrend.length) {
      document.getElementById("scorecardCards").innerHTML = `<div class="small">Fact_KPI_Trend not loaded. Add FACT_KPI_TREND_CSV_URL in config.js.</div>`;
      return;
    }
    const latest = this.latestByMetric(this.filtered()).slice(0, 36);
    document.getElementById("scorecardCards").innerHTML = latest.map(r => {
      const cls = r.MeasureType === "DDD" ? "ddd" : (r.Value >= 80 ? "high" : r.Value >= 50 ? "mid" : "low");
      const value = r.MeasureType === "DDD" ? ASP_UTILS.fmtNum(r.Value) : ASP_UTILS.fmtPct(r.Value);
      return `<article class="scorecard-card ${cls}">
        <div class="scorecard-title">${r.MetricName}</div>
        <div class="scorecard-value">${value}</div>
        <div class="scorecard-meta">${r.PeriodROC} · ${r.Location || "-"}<br>${r.Organism || ""} ${r.Drug ? "· " + r.Drug : ""}</div>
      </article>`;
    }).join("");
    this.renderTrend();
  },

  renderTrend() {
    const metric = document.getElementById("scorecardMetricSelect").value;
    const loc = document.getElementById("scorecardTrendLocationSelect").value;
    let rows = ASP_STATE.kpiTrend.filter(r => r.MetricName === metric && (loc === "all" || r.Location === loc))
      .sort((a,b) => a.YYYYMM.localeCompare(b.YYYYMM));
    const labels = rows.map(r => r.PeriodROC);
    ASP_UTILS.renderChart("scorecardTrendChart", {
      type: "line",
      data: {
        labels,
        datasets: [{
          label: metric,
          data: rows.map(r => r.Value)
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
        scales: { y: { title: { display: true, text: rows[0] && rows[0].MeasureType === "DDD" ? "DDD" : "%" } } }
      }
    });
  }
};
