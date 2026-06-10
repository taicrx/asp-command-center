const ASP_AWARE = {
  render() {
    const rows = ASP_STATE.aware;
    const brief = document.getElementById("awareBrief");

    if (!rows.length) {
      if (brief) brief.innerText = "AWaRe data not loaded. Add FACT_AWARE_CSV_URL in config.js.";
      return;
    }

    this.renderStackedBar(rows);
    this.renderTrendCards(rows);
    this.renderRecommendations(rows);
  },

  renderStackedBar(rows) {
    ASP_UTILS.renderChart("awareStackedChart", {
      type: "bar",
      data: {
        labels: rows.map(r => r.Year),
        datasets: [
          { label: "Access", data: rows.map(r => r.Access), backgroundColor: "#4CAF50", borderWidth: 0 },
          { label: "Watch", data: rows.map(r => r.Watch), backgroundColor: "#F4C542", borderWidth: 0 },
          { label: "Reserve", data: rows.map(r => r.Reserve), backgroundColor: "#E74C3C", borderWidth: 0 }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { top: 10, right: 18, bottom: 8, left: 8 } },
        interaction: { mode: "index", intersect: false },
        plugins: {
          legend: {
            position: "top",
            labels: {
              boxWidth: 18,
              boxHeight: 18,
              padding: 18,
              font: { size: 14, weight: "bold" }
            }
          },
          tooltip: {
            callbacks: {
              title: ctx => `Year ${ctx[0].label}`,
              afterBody: () => ["", "WHO Target:", "Access ≥60%", "Reserve <5%"],
              label: ctx => `${ctx.dataset.label}: ${Number(ctx.raw).toFixed(2)}%`
            }
          }
        },
        scales: {
          x: {
            stacked: true,
            grid: { display: false },
            ticks: { font: { size: 14, weight: "bold" } }
          },
          y: {
            stacked: true,
            min: 0,
            max: 100,
            ticks: {
              callback: v => v + "%",
              font: { size: 13 }
            },
            title: {
              display: true,
              text: "Share of antibiotic utilization",
              font: { size: 14, weight: "bold" }
            }
          }
        }
      }
    });
  },

  renderTrendCards(rows) {
    const first = rows[0];
    const latest = rows[rows.length - 1];

    this.setTrend("awareAccessTrend", "awareAccessDelta", first.Access, latest.Access);
    this.setTrend("awareWatchTrend", "awareWatchDelta", first.Watch, latest.Watch);
    this.setTrend("awareReserveTrend", "awareReserveDelta", first.Reserve, latest.Reserve);
  },

  setTrend(mainId, deltaId, firstValue, latestValue) {
    const delta = latestValue - firstValue;
    document.getElementById(mainId).innerText =
      `${firstValue.toFixed(1)}% → ${latestValue.toFixed(1)}%`;
    document.getElementById(deltaId).innerText =
      `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} percentage points`;
  },

  renderRecommendations(rows) {
    const first = rows[0];
    const latest = rows[rows.length - 1];

    const accessText = latest.Access >= 60
      ? "Access utilization has reached the WHO ≥60% target. Continue monitoring to sustain this level."
      : "Increase Access antibiotic utilization to move toward the WHO target of ≥60%, especially in community-acquired infections when clinically appropriate.";

    const reserveText = latest.Reserve < 5
      ? "Reserve utilization remains below 5%. Continue protecting Reserve antibiotics through restriction and prospective review."
      : "Reserve utilization exceeds the suggested threshold. Review indications, approval workflow, and de-escalation opportunities.";

    const watchText = latest.Watch > 35
      ? "Watch antibiotics remain a major proportion of overall use and represent the primary stewardship opportunity."
      : "Watch antibiotic pressure appears relatively controlled; continue surveillance for rebound use.";

    document.getElementById("awareBrief").innerHTML = `
      <article class="recommendation-item">
        <strong>Access strategy</strong>
        ${accessText}
      </article>
      <article class="recommendation-item">
        <strong>Reserve protection</strong>
        ${reserveText}
      </article>
      <article class="recommendation-item">
        <strong>Watch review</strong>
        ${watchText}
      </article>
    `;
  }
};
