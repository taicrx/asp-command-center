const ASP_APP = {
  async loadAll() {
    try {
      ASP_UTILS.setStatus("Loading data...");
      await ASP_DATA.loadAll();

      ASP_CHARTS.renderAll();

      if (ASP_STATE.antibiogram.length) {
        document.getElementById("antibiogramStatus").innerText =
          `Fact_Antibiogram loaded: ${ASP_STATE.antibiogram.length} rows.`;
        ASP_HEATMAP.initControls();
        ASP_HEATMAP.renderAll();
        ASP_HEATMAP.renderTable(ASP_STATE.antibiogram.slice(0, 100));
      } else {
        document.getElementById("antibiogramStatus").innerText =
          "Missing Fact_Antibiogram CSV URL in config.js or no rows loaded.";
      }

      ASP_AI.renderAll();
      ASP_UTILS.setStatus("Data loaded.");
    } catch (err) {
      console.error(err);
      const message = err && err.message ? err.message : String(err);
      ASP_UTILS.setStatus("Load failed: " + message);
      const executiveBrief = document.getElementById("executiveBrief");
      if (executiveBrief) {
        executiveBrief.innerText =
          "Load failed.\n\nError detail:\n" + message +
          "\n\nCheck:\n1. config.js CSV URLs\n2. Google Sheet publish-to-web setting\n3. Required column headers\n4. Browser Console for line number";
      }
    }
  },

  initTabs() {
    document.querySelectorAll(".tab").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".tab").forEach(x => x.classList.remove("active"));
        document.querySelectorAll(".page").forEach(x => x.classList.remove("active-page"));

        btn.classList.add("active");
        document.getElementById(btn.dataset.target).classList.add("active-page");
      });
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  ASP_APP.initTabs();
  ASP_APP.loadAll();
});
