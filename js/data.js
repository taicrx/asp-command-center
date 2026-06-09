const ASP_DATA = {
  async loadAll() {
    const aspUrl = ASP_CONFIG.FACT_ASP_MONTHLY_CSV_URL;
    const agUrl = ASP_CONFIG.FACT_ANTIBIOGRAM_CSV_URL;

    if (!aspUrl || aspUrl.includes("REPLACE_WITH")) {
      throw new Error("Missing Fact_ASP_Monthly CSV URL in config.js");
    }

    ASP_UTILS.setStatus("Loading Fact_ASP_Monthly...");
    const aspCsv = await ASP_UTILS.fetchText(aspUrl);
    ASP_STATE.aspMonthly = this.cleanAspMonthly(ASP_UTILS.parseCSV(aspCsv));

    if (agUrl && !agUrl.includes("REPLACE_WITH")) {
      ASP_UTILS.setStatus("Loading Fact_Antibiogram...");
      const agCsv = await ASP_UTILS.fetchText(agUrl);
      ASP_STATE.antibiogram = this.cleanAntibiogram(ASP_UTILS.parseCSV(agCsv));
    } else {
      ASP_STATE.antibiogram = [];
    }
  },

  cleanAspMonthly(rows) {
    const toNum = ASP_UTILS.toNum;

    return rows.map(r => {
      const meropenem = toNum(r.Meropenem_DDD);
      const imipenem = toNum(r.Imipenem_DDD);
      const ertapenem = toNum(r.Ertapenem_DDD);
      const doripenem = toNum(r.Doripenem_DDD);
      const vancomycin = toNum(r.Vancomycin_DDD);
      const teicoplanin = toNum(r.Teicoplanin_DDD);

      return {
        ...r,
        YYYYMM: r.YYYYMM || r.Date || "",
        CRKP_Rate_num: toNum(r.CRKP_Rate),
        CRAB_Rate_num: toNum(r.CRAB_Rate),
        CRPA_Rate_num: toNum(r.CRPA_Rate),
        CREC_Rate_num: toNum(r.CREC_Rate),
        MRSA_Rate_num: toNum(r.MRSA_Rate),
        VRE_Rate_num: toNum(r.VRE_Rate),
        Meropenem_DDD_num: meropenem,
        Imipenem_DDD_num: imipenem,
        Ertapenem_DDD_num: ertapenem,
        Doripenem_DDD_num: doripenem,
        Vancomycin_DDD_num: vancomycin,
        Teicoplanin_DDD_num: teicoplanin,
        Total_Carbapenem_DDD_num:
          [meropenem, imipenem, ertapenem, doripenem]
            .filter(x => x !== null)
            .reduce((a, b) => a + b, 0)
      };
    }).filter(r => r.YYYYMM);
  },

  cleanAntibiogram(rows) {
    return rows.map(r => ({
      Year: r.Year || "",
      Period: r.Period || "",
      SourceCategory: r.SourceCategory || "",
      Organism: this.normalizeOrganism(r.StandardOrganism || r.Organism || ""),
      StandardOrganism: this.normalizeOrganism(r.StandardOrganism || r.Organism || ""),
      ResistancePhenotype: r.ResistancePhenotype || "",
      Drug: this.normalizeDrug(r.Drug || ""),
      IsolateCount: ASP_UTILS.toNum(r.IsolateCount),
      SusceptibilityPercent: ASP_UTILS.toNum(r.SusceptibilityPercent),
      Location: r.Location || ""
    })).filter(r => r.Organism && r.Drug && r.SusceptibilityPercent !== null);
  },

  normalizeDrug(x) {
    return String(x).trim().toUpperCase();
  },

  normalizeOrganism(x) {
    return String(x)
      .replace(/Escheric\.?coli/i, "Escherichia coli")
      .replace(/Klebsiel\.?pneumoniae/i, "Klebsiella pneumoniae")
      .replace(/Pseudomo\.?aeruginosa/i, "Pseudomonas aeruginosa")
      .replace(/Acinetob\.?baumannii/i, "Acinetobacter baumannii")
      .trim();
  }
};
