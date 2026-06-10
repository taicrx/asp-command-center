const ASP_AWARE={render(){let rows=ASP_STATE.aware;if(!rows.length){document.getElementById("awareBrief").innerText="AWaRe data not loaded. Add FACT_AWARE_CSV_URL in config.js.";return}let latest=rows.at(-1),fmt=ASP_UTILS.fmtPct;document.getElementById("awareAccess").innerText=fmt(latest.Access);document.getElementById("awareWatch").innerText=fmt(latest.Watch);document.getElementById("awareReserve").innerText=fmt(latest.Reserve);document.getElementById("awareAccessNote").innerText=latest.Access>=60?"WHO target ≥60%: achieved":"WHO target ≥60%: below target by "+(60-latest.Access).toFixed(1)+" pp";document.getElementById("awareWatchNote").innerText="Watch pressure: "+fmt(latest.Watch);document.getElementById("awareReserveNote").innerText=latest.Reserve<5?"Reserve <5%: on target":"Reserve ≥5%: review restricted use";ASP_UTILS.renderChart("awareStackedChart",{type:"bar",data:{labels:rows.map(r=>r.Year),datasets:[{label:"Access",data:rows.map(r=>r.Access),backgroundColor:"#6aa84f"},{label:"Watch",data:rows.map(r=>r.Watch),backgroundColor:"#f1c232"},{label:"Reserve",data:rows.map(r=>r.Reserve),backgroundColor:"#ff5b5b"}]},options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{position:"top"},tooltip:{callbacks:{label:c=>`${c.dataset.label}: ${Number(c.raw).toFixed(2)}%`}}},scales:{x:{stacked:true},y:{stacked:true,min:0,max:100,ticks:{callback:v=>v+"%"},title:{display:true,text:"Share of antibiotic consumption"}}}}});let first=rows[0];document.getElementById("awareBrief").innerText=`AWaRe Summary

${first.Year} → ${latest.Year}

Access: ${fmt(first.Access)} → ${fmt(latest.Access)} (${(latest.Access-first.Access>=0?"+":"")}${(latest.Access-first.Access).toFixed(1)} pp)
Watch: ${fmt(first.Watch)} → ${fmt(latest.Watch)} (${(latest.Watch-first.Watch>=0?"+":"")}${(latest.Watch-first.Watch).toFixed(1)} pp)
Reserve: ${fmt(first.Reserve)} → ${fmt(latest.Reserve)} (${(latest.Reserve-first.Reserve>=0?"+":"")}${(latest.Reserve-first.Reserve).toFixed(1)} pp)

Interpretation:
${latest.Access>=60?"Access target is achieved.":"Access remains below the WHO 60% target."}
${latest.Watch>35?"Watch proportion remains high; stewardship review is recommended.":"Watch proportion is relatively controlled."}
Reserve use is stable and should remain restricted.`}};
