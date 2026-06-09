const ASP_AI = {
  renderAll() {
    this.renderBriefs();
    this.renderPrompt();
  },

  renderBriefs() {
    const rows = ASP_STATE.aspMonthly;
    if (!rows.length) return;

    const latest = rows[rows.length - 1];
    const crkpDelta = ASP_UTILS.changeFromPrevious(rows, "CRKP_Rate_num");
    const crabDelta = ASP_UTILS.changeFromPrevious(rows, "CRAB_Rate_num");
    const carbDelta = ASP_UTILS.changeFromPrevious(rows, "Total_Carbapenem_DDD_num");
    const mrsaDelta = ASP_UTILS.changeFromPrevious(rows, "MRSA_Rate_num");

    const riskNotes = [];

    if (latest.CRKP_Rate_num !== null && latest.CRKP_Rate_num >= 20) {
      riskNotes.push("CRKP rate ≥ 20%：建議檢視 carbapenem empirical use 與 de-escalation 流程。");
    }
    if (latest.CRAB_Rate_num !== null && latest.CRAB_Rate_num >= 30) {
      riskNotes.push("CRAB rate 偏高：建議追蹤 ICU / respiratory care unit cluster 與感染管制策略。");
    }
    if (latest.MRSA_Rate_num !== null && latest.MRSA_Rate_num >= 50) {
      riskNotes.push("MRSA rate 偏高：建議同步檢視 anti-MRSA agents 使用壓力與採檢來源。");
    }
    if (carbDelta !== null && carbDelta > 15) {
      riskNotes.push("Total carbapenem DDD 較前期增加 >15%：建議列入 ASP morning review。");
    }

    const brief =
`ASP Stewardship Brief

Latest period: ${latest.YYYYMM}

Key indicators:
- CRKP: ${ASP_UTILS.fmtPct(latest.CRKP_Rate_num)} ${this.deltaText(crkpDelta)}
- CRAB: ${ASP_UTILS.fmtPct(latest.CRAB_Rate_num)} ${this.deltaText(crabDelta)}
- CRPA: ${ASP_UTILS.fmtPct(latest.CRPA_Rate_num)}
- MRSA: ${ASP_UTILS.fmtPct(latest.MRSA_Rate_num)} ${this.deltaText(mrsaDelta)}
- VRE: ${ASP_UTILS.fmtPct(latest.VRE_Rate_num)}
- Total carbapenem DDD: ${ASP_UTILS.fmtNum(latest.Total_Carbapenem_DDD_num)} ${this.deltaText(carbDelta)}
- Vancomycin DDD: ${ASP_UTILS.fmtNum(latest.Vancomycin_DDD_num)}
- Teicoplanin DDD: ${ASP_UTILS.fmtNum(latest.Teicoplanin_DDD_num)}

Suggested ASP focus:
${riskNotes.length ? riskNotes.map(x => "- " + x).join("\n") : "- No major rule-based alert detected. Continue routine monitoring."}

Interpretation note:
This is a rule-based preliminary summary. It supports ASP pharmacist review and should not be used as an automatic treatment directive.`;

    document.getElementById("aiBrief").innerText = brief;
    document.getElementById("executiveBrief").innerText = brief;
  },

  renderPrompt() {
    const rows = ASP_STATE.aspMonthly;
    if (!rows.length) return;

    const latest = rows[rows.length - 1];

    const prompt =
`請以抗生素管理計畫（ASP）臨床藥師角度，根據以下本院彙總資料，產生一份 ASP Morning Brief。

資料期間：${latest.YYYYMM}

最新指標：
CRKP rate: ${ASP_UTILS.fmtPct(latest.CRKP_Rate_num)}
CRAB rate: ${ASP_UTILS.fmtPct(latest.CRAB_Rate_num)}
CRPA rate: ${ASP_UTILS.fmtPct(latest.CRPA_Rate_num)}
CREC rate: ${ASP_UTILS.fmtPct(latest.CREC_Rate_num)}
MRSA rate: ${ASP_UTILS.fmtPct(latest.MRSA_Rate_num)}
VRE rate: ${ASP_UTILS.fmtPct(latest.VRE_Rate_num)}

抗生素使用：
Total carbapenem DDD: ${ASP_UTILS.fmtNum(latest.Total_Carbapenem_DDD_num)}
Meropenem DDD: ${ASP_UTILS.fmtNum(latest.Meropenem_DDD_num)}
Imipenem DDD: ${ASP_UTILS.fmtNum(latest.Imipenem_DDD_num)}
Ertapenem DDD: ${ASP_UTILS.fmtNum(latest.Ertapenem_DDD_num)}
Doripenem DDD: ${ASP_UTILS.fmtNum(latest.Doripenem_DDD_num)}
Vancomycin DDD: ${ASP_UTILS.fmtNum(latest.Vancomycin_DDD_num)}
Teicoplanin DDD: ${ASP_UTILS.fmtNum(latest.Teicoplanin_DDD_num)}

請輸出：
1. 本月重點摘要
2. 可能的 ASP 風險訊號
3. 需要追蹤的抗藥性趨勢
4. 建議介入策略
5. 需要避免過度推論的地方

請注意：這是彙總資料，不能直接推論個別病人的治療。`;

    document.getElementById("aiPromptBox").value = prompt;
  },

  deltaText(delta) {
    if (delta === null) return "";
    return `(${delta >= 0 ? "+" : ""}${delta.toFixed(1)}% vs previous)`;
  },

  copyPrompt() {
    const box = document.getElementById("aiPromptBox");
    box.select();
    document.execCommand("copy");
  }
};
