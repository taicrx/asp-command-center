const ASP_DATA = {
  drugNameMap: {
    AM: "Ampicillin",
    AM10: "Ampicillin 10",
    AN: "Amikacin",
    C: "Chloramphenicol",
    CAZ: "Ceftazidime",
    CC: "Clindamycin",
    CIP: "Ciprofloxacin",
    CMZ: "Cefmetazole",
    CRO: "Ceftriaxone",
    CTX: "Cefotaxime",
    DAP: "Daptomycin",
    DOR: "Doripenem",
    VRC: "Voriconazole",
    ETP: "Ertapenem",
    FEP: "Cefepime",
    FLO: "Flomoxef",
    FOX: "Cefoxitin",
    GM: "Gentamicin",
    IPM: "Imipenem",
    LVX: "Levofloxacin",
    LZD: "Linezolid",
    MEM: "Meropenem",
    MEN: "Meropenem",
    MXF: "Moxifloxacin",
    MET: "Metronidazole",
    MI: "Minocycline",
    OX: "Oxacillin",
    P: "Penicillin",
    PIP: "Piperacillin",
    RA: "Rifampicin",
    SAM: "Ampicillin/Sulbactam",
    SFP: "Cefoperazone/Sulbactam",
    SXT: "Trimethoprim/Sulfamethoxazole",
    TEC: "Teicoplanin",
    TGC: "Tigecycline",
    TZP: "Piperacillin/Tazobactam",
    VA: "Vancomycin",
    VAN: "Vancomycin",
    CL: "Colistin",
    CFM: "Cefixime",
    FCT: "FCT",
    CZ: "Cefazolin",
    CZA: "Ceftazidime/Avibactam",
    E: "Erythromycin",
    STS: "Streptomycin-synergy",
    G120: "Gentamicin 120",
    TE: "Tetracycline",
    CAS: "Caspofungin",
    FLU: "Fluconazole",
    FP: "FP",
    ZA: "ZA"
  },

  drugDisplay(d, name) {
    const code = this.normalizeDrug(d || "");
    const nm = this.drugNameMap[code] || name || code;
    return nm ? `${nm} (${code})` : code;
  },

  async loadAll() {
    const a = ASP_CONFIG.FACT_ASP_MONTHLY_CSV_URL;
    const g = ASP_CONFIG.FACT_ANTIBIOGRAM_CSV_URL;
    const w = ASP_CONFIG.FACT_AWARE_CSV_URL;
    const k = ASP_CONFIG.FACT_KPI_TREND_CSV_URL;
    const p = ASP_CONFIG.FACT_ASP_PERIOD_CSV_URL;

    if (!a || a.includes("REPLACE_WITH")) {
      throw new Error("Missing Fact_ASP_Monthly CSV URL in config.js");
    }

    ASP_UTILS.setStatus("Loading Fact_ASP_Monthly...");
    ASP_STATE.aspMonthly = this.cleanAsp(
      ASP_UTILS.parseCSV(await ASP_UTILS.fetchText(a))
    );
    if (!ASP_STATE.aspMonthly.length) {
      throw new Error("No valid rows in Fact_ASP_Monthly");
    }

    if (g && !g.includes("REPLACE_WITH")) {
      ASP_UTILS.setStatus("Loading Fact_Antibiogram_Master...");
      ASP_STATE.antibiogram = this.cleanAg(
        ASP_UTILS.parseCSV(await ASP_UTILS.fetchText(g))
      );
    } else {
      ASP_STATE.antibiogram = [];
    }

    if (w && !w.includes("REPLACE_WITH")) {
      ASP_UTILS.setStatus("Loading Fact_AWaRe...");
      ASP_STATE.aware = this.cleanAware(
        ASP_UTILS.parseCSV(await ASP_UTILS.fetchText(w))
      );
    } else {
      ASP_STATE.aware = [];
    }

    if (k && !k.includes("REPLACE_WITH")) {
      ASP_UTILS.setStatus("Loading Fact_KPI_Trend...");
      ASP_STATE.kpiTrend = this.cleanKPI(
        ASP_UTILS.parseCSV(await ASP_UTILS.fetchText(k))
      );
    } else {
      ASP_STATE.kpiTrend = [];
    }

    if (p && !p.includes("REPLACE_WITH")) {
      ASP_UTILS.setStatus("Loading Fact_ASP_Period...");
      ASP_STATE.aspPeriod = this.cleanASPPeriod(
        ASP_UTILS.parseCSV(await ASP_UTILS.fetchText(p))
      );
    } else {
      ASP_STATE.aspPeriod = [];
    }
  },

  cleanAsp(rows) {
    const n = ASP_UTILS.toNum;
    return rows.map(r => {
      const me = n(r.Meropenem_DDD);
      const im = n(r.Imipenem_DDD);
      const et = n(r.Ertapenem_DDD);
      const dor = n(r.Doripenem_DDD);
      const va = n(r.Vancomycin_DDD);
      const tec = n(r.Teicoplanin_DDD);

      return {
        ...r,
        YYYYMM: r.YYYYMM || r.Date || "",
        CRKP_Rate_num: n(r.CRKP_Rate),
        CRAB_Rate_num: n(r.CRAB_Rate),
        CRPA_Rate_num: n(r.CRPA_Rate),
        CREC_Rate_num: n(r.CREC_Rate),
        MRSA_Rate_num: n(r.MRSA_Rate),
        VRE_Rate_num: n(r.VRE_Rate),
        Meropenem_DDD_num: me,
        Imipenem_DDD_num: im,
        Ertapenem_DDD_num: et,
        Doripenem_DDD_num: dor,
        Vancomycin_DDD_num: va,
        Teicoplanin_DDD_num: tec,
        Total_Carbapenem_DDD_num: [me, im, et, dor]
          .filter(x => x !== null)
          .reduce((sum, x) => sum + x, 0)
      };
    }).filter(r => r.YYYYMM);
  },

  cleanAg(rows) {
    return rows.map(r => {
      const drug = this.normalizeDrug(r.Drug || "");
      const org = this.normalizeOrg(r.StandardOrganism || r.Organism || "");
      const s = ASP_UTILS.toNum(r.SusceptibilityPercent);

      return {
        Year: String(r.Year || ""),
        Period: r.Period || "",
        SourceCategory: r.SourceCategory || "",
        Organism: org,
        StandardOrganism: org,
        ResistancePhenotype: r.ResistancePhenotype || "",
        Drug: drug,
        DrugName: this.drugNameMap[drug] || r.DrugName || "",
        DrugDisplay: this.drugDisplay(drug, this.drugNameMap[drug] || r.DrugName || ""),
        IsolateCount: ASP_UTILS.toNum(r.IsolateCount),
        SusceptibilityPercent: s,
        Location: r.Location || "Hospital"
      };
    }).filter(r =>
      r.Year &&
      r.Period &&
      r.Organism &&
      r.Drug &&
      r.SusceptibilityPercent !== null
    );
  },

  cleanAware(rows) {
    return rows.map(r => ({
      Year: String(r.Year || r.年度 || ""),
      Access: ASP_UTILS.toNum(r.Access),
      Watch: ASP_UTILS.toNum(r.Watch),
      Reserve: ASP_UTILS.toNum(r.Reserve)
    })).filter(r =>
      r.Year &&
      r.Access !== null &&
      r.Watch !== null &&
      r.Reserve !== null
    ).sort((a, b) => Number(a.Year) - Number(b.Year));
  },

  cleanKPI(rows) {
    return rows.map(r => ({
      YYYYMM: String(r.YYYYMM || ""),
      GregorianYear: String(r.GregorianYear || ""),
      ROCYear: String(r.ROCYear || ""),
      Half: r.Half || "",
      Period: r.Period || "",
      PeriodROC: r.PeriodROC || "",
      MetricNo: String(r.MetricNo || ""),
      MetricGroup: r.MetricGroup || "",
      MetricName: r.MetricName || "",
      MeasureType: r.MeasureType || "",
      Drug: r.Drug || "",
      Organism: r.Organism || "",
      Location: r.Location || "",
      Value: ASP_UTILS.toNum(r.Value)
    })).filter(r =>
      r.YYYYMM &&
      r.MetricName &&
      r.Value !== null
    );
  },

  cleanASPPeriod(rows) {
    const keys = [
      "Meropenem_DDD",
      "Imipenem_DDD",
      "Ertapenem_DDD",
      "Doripenem_DDD",
      "Total_Carbapenem_DDD",
      "Vancomycin_DDD",
      "MRSA_Rate",
      "SA_Oxacillin_S",
      "CRAB_Rate",
      "Acinetobacter_IPM_S_All",
      "Pseudomonas_IPM_S_All",
      "Pseudomonas_CAZ_S_All",
      "Ecoli_CRO_S_All"
    ];

    return rows.map(r => {
      const o = {
        YYYYMM: String(r.YYYYMM || ""),
        GregorianYear: String(r.GregorianYear || ""),
        ROCYear: String(r.ROCYear || ""),
        Half: r.Half || "",
        Period: r.Period || "",
        PeriodROC: r.PeriodROC || ""
      };
      keys.forEach(k => {
        o[k] = ASP_UTILS.toNum(r[k]);
      });
      return o;
    }).filter(r => r.YYYYMM);
  },

  normalizeDrug(x) {
    return String(x).trim().toUpperCase();
  },

  normalizeOrg(x) {
    let s = String(x || "").replace(/^\d+\s*/, "").trim();
    return s
      .replace(/Escheric\.?coli/i, "Escherichia coli")
      .replace(/Klebsiel\.?pneumoniae/i, "Klebsiella pneumoniae")
      .replace(/Pseudomo\.?aeruginosa/i, "Pseudomonas aeruginosa")
      .replace(/Acinetob\.?baumannii/i, "Acinetobacter baumannii");
  }
};
