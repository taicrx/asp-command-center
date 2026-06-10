const ASP_DRIVER = {
  pearson(xs, ys) {
    const pairs = xs.map((x,i) => [x, ys[i]]).filter(p => p[0] !== null && p[1] !== null && isFinite(p[0]) && isFinite(p[1]));
    if (pairs.length < 3) return null;
    const x = pairs.map(p => p[0]), y = pairs.map(p => p[1]);
    const mx = x.reduce((a,b)=>a+b,0)/x.length, my = y.reduce((a,b)=>a+b,0)/y.length;
    let num=0, dx=0, dy=0;
    for (let i=0;i<x.length;i++) { num += (x[i]-mx)*(y[i]-my); dx += (x[i]-mx)**2; dy += (y[i]-my)**2; }
    if (!dx || !dy) return null;
    return {r: num / Math.sqrt(dx*dy), n: pairs.length};
  },

  render() {
    if (!ASP_STATE.aspPeriod.length) {
      document.getElementById("driverSummary").innerHTML = `<div class="small">Fact_ASP_Period not loaded. Add FACT_ASP_PERIOD_CSV_URL in config.js.</div>`;
      return;
    }
    const exposure = document.getElementById("driverExposureSelect").value;
    const outcome = document.getElementById("driverOutcomeSelect").value;
    const maxLag = Number(document.getElementById("driverLagSelect").value);
    const rows = ASP_STATE.aspPeriod.slice().sort((a,b) => a.YYYYMM.localeCompare(b.YYYYMM));
    const results = [];
    for (let lag=0; lag<=maxLag; lag++) {
      const xs=[], ys=[];
      for (let i=0; i<rows.length-lag; i++) {
        xs.push(rows[i][exposure]);
        ys.push(rows[i+lag][outcome]);
      }
      const stat = this.pearson(xs, ys);
      results.push({lag, r: stat ? stat.r : null, n: stat ? stat.n : 0});
    }
    const valid = results.filter(x => x.r !== null);
    const best = valid.length ? valid.slice().sort((a,b) => Math.abs(b.r)-Math.abs(a.r))[0] : null;
    document.getElementById("driverSummary").innerHTML = best ? `
      <div class="driver-box"><strong>Strongest association</strong><span>r=${best.r.toFixed(2)}</span></div>
      <div class="driver-box"><strong>Best lag</strong><span>${best.lag} period(s)</span></div>
      <div class="driver-box"><strong>Paired observations</strong><span>${best.n}</span></div>
    ` : `<div class="small">Insufficient paired data.</div>`;

    ASP_UTILS.renderChart("driverLagChart", {
      type: "line",
      data: {
        labels: results.map(x => `Lag ${x.lag}`),
        datasets: [{
          label: `${exposure} → ${outcome}`,
          data: results.map(x => x.r)
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { position: "bottom" } },
        scales: {
          y: { min: -1, max: 1, title: { display: true, text: "Pearson r" } },
          x: { title: { display: true, text: "Lag period" } }
        }
      }
    });
  }
};
