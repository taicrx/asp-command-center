# AI ASP Command Center v4

A static GitHub Pages dashboard for ASP data visualization and Google Sites embedding.

## v4 Features

### Executive Dashboard
- CRKP / CRAB / CRPA / MRSA / VRE KPI
- Total carbapenem DDD
- Vancomycin / Teicoplanin DDD
- ASP Executive Brief

### Resistance Intelligence Center
- Carbapenem pressure vs CRKP / CRAB / CRPA / CREC
- Anti-MRSA pressure vs MRSA / VRE
- Custom correlation explorer

### Local Antibiogram Center
- Organism × Drug heatmap
- GNB / GPC / MDRO filters
- Organism-drug susceptibility trend
- Lookup table

### Empirical Therapy Assistant
- UTI
- Pneumonia / HAP
- Bloodstream infection
- Intra-abdominal infection
- Weighted empirical coverage matrix

### AI ASP Analyst
- Rule-based ASP brief
- Copyable GPT prompt for a richer narrative summary

---

## Required Google Sheet Tabs

### 1. Fact_ASP_Monthly

Required columns:

```text
YYYYMM
CRKP_Rate
CRAB_Rate
MRSA_Rate
VRE_Rate
Meropenem_DDD
Imipenem_DDD
Ertapenem_DDD
Doripenem_DDD
```

Recommended optional columns:

```text
CRPA_Rate
CREC_Rate
Vancomycin_DDD
Teicoplanin_DDD
```

### 2. Fact_Antibiogram

Required columns:

```text
Year
Period
Organism
Drug
IsolateCount
SusceptibilityPercent
Location
```

---

## Setup

1. Open your Google Sheet.
2. File → Share → Publish to web.
3. Publish `Fact_ASP_Monthly` as CSV.
4. Publish `Fact_Antibiogram` as CSV.
5. Open `config.js`.
6. Paste the two published CSV URLs:

```js
const ASP_CONFIG = {
  FACT_ASP_MONTHLY_CSV_URL:
    "PASTE_FACT_ASP_MONTHLY_CSV_URL_HERE",

  FACT_ANTIBIOGRAM_CSV_URL:
    "PASTE_FACT_ANTIBIOGRAM_CSV_URL_HERE"
};
```

7. Upload all files to GitHub.
8. Enable GitHub Pages.
9. Embed the GitHub Pages URL in Google Sites.

---

## Privacy

Use aggregated data only.

Do not include:
- MRN
- Patient names
- Full SOAP notes
- Bed number
- Birthday
- Raw culture reports linked to individual patients


## v4.1 fix

Fact_Antibiogram now prioritizes `StandardOrganism` over `Organism` for heatmap and lookup display.


## v4.2 debug

This version has the user's CSV URLs prefilled and displays exact load errors in the UI.
