const ASP_AI={renderAll(){this.brief();this.prompt()},brief(){let rows=ASP_STATE.aspMonthly;if(!rows.length)return;let r=rows.at(-1),chg=k=>ASP_UTILS.change(rows,k),d=x=>x===null?"":`(${x>=0?"+":""}${x.toFixed(1)}% vs previous)`;let notes=[];if(r.CRKP_Rate_num>=20)notes.push("CRKP rate ≥20%：review carbapenem empirical use and de-escalation.");if(r.CRAB_Rate_num>=30)notes.push("CRAB high：check ICU/RCU cluster and infection-control actions.");if(r.MRSA_Rate_num>=50)notes.push("MRSA high：review anti-MRSA agent pressure and culture source.");if((chg("Total_Carbapenem_DDD_num")||0)>15)notes.push("Total carbapenem DDD increased >15%：include in ASP morning review.");let aware=ASP_STATE.aware.at(-1);if(aware&&aware.Access<60)notes.push("AWaRe Access remains below 60% target; review Watch-to-Access shift opportunities.");let text=`ASP Stewardship Brief

Latest period: ${r.YYYYMM}

Key indicators:
- CRKP: ${ASP_UTILS.fmtPct(r.CRKP_Rate_num)} ${d(chg("CRKP_Rate_num"))}
- CRAB: ${ASP_UTILS.fmtPct(r.CRAB_Rate_num)} ${d(chg("CRAB_Rate_num"))}
- CRPA: ${ASP_UTILS.fmtPct(r.CRPA_Rate_num)}
- MRSA: ${ASP_UTILS.fmtPct(r.MRSA_Rate_num)} ${d(chg("MRSA_Rate_num"))}
- VRE: ${ASP_UTILS.fmtPct(r.VRE_Rate_num)}
- Total carbapenem DDD: ${ASP_UTILS.fmtNum(r.Total_Carbapenem_DDD_num)} ${d(chg("Total_Carbapenem_DDD_num"))}
${aware?`- Latest AWaRe: Access ${ASP_UTILS.fmtPct(aware.Access)}, Watch ${ASP_UTILS.fmtPct(aware.Watch)}, Reserve ${ASP_UTILS.fmtPct(aware.Reserve)}`:""}

Suggested ASP focus:
${notes.length?notes.map(x=>"- "+x).join("\n"):"- No major rule-based alert detected. Continue routine monitoring."}

Note: This is a rule-based preliminary summary for ASP pharmacist review.`;document.getElementById("aiBrief").innerText=text},prompt(){let r=ASP_STATE.aspMonthly.at(-1);if(!r)return;let aware=ASP_STATE.aware.at(-1);document.getElementById("aiPromptBox").value=`請以 ASP 臨床藥師角度，根據本院彙總資料產生 ASP Morning Brief。

資料期間：${r.YYYYMM}
CRKP rate: ${ASP_UTILS.fmtPct(r.CRKP_Rate_num)}
CRAB rate: ${ASP_UTILS.fmtPct(r.CRAB_Rate_num)}
CRPA rate: ${ASP_UTILS.fmtPct(r.CRPA_Rate_num)}
CREC rate: ${ASP_UTILS.fmtPct(r.CREC_Rate_num)}
MRSA rate: ${ASP_UTILS.fmtPct(r.MRSA_Rate_num)}
VRE rate: ${ASP_UTILS.fmtPct(r.VRE_Rate_num)}

Total carbapenem DDD: ${ASP_UTILS.fmtNum(r.Total_Carbapenem_DDD_num)}
Vancomycin DDD: ${ASP_UTILS.fmtNum(r.Vancomycin_DDD_num)}
Teicoplanin DDD: ${ASP_UTILS.fmtNum(r.Teicoplanin_DDD_num)}
${aware?`AWaRe: Access ${ASP_UTILS.fmtPct(aware.Access)}, Watch ${ASP_UTILS.fmtPct(aware.Watch)}, Reserve ${ASP_UTILS.fmtPct(aware.Reserve)}`:""}

請輸出：1.重點摘要 2.風險訊號 3.需追蹤趨勢 4.建議介入 5.避免過度推論。`},copyPrompt(){let b=document.getElementById("aiPromptBox");b.select();document.execCommand("copy")}};