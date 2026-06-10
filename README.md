# AI ASP Command Center v5

## v5 fixes and upgrades

- Fixed duplicated X-axis in Trend Explorer by aggregating rows by Year/Period before plotting.
- Added DrugName display, e.g. `Ceftriaxone (CRO)`.
- Added Multi-Year Antibiogram Trend Explorer.
- Added Drug Class Trend Explorer.
- Added Heatmap and Coverage Matrix.
- Keeps Executive, Resistance Intelligence, Empirical Therapy, and AI ASP Analyst panels.

## Required CSV tabs

### Fact_ASP_Monthly
Required columns:
YYYYMM, CRKP_Rate, CRAB_Rate, MRSA_Rate, VRE_Rate, Meropenem_DDD, Imipenem_DDD, Ertapenem_DDD, Doripenem_DDD

Recommended:
CRPA_Rate, CREC_Rate, Vancomycin_DDD, Teicoplanin_DDD, Total_Carbapenem_DDD

### Fact_Antibiogram_Master
Required columns:
Year, Period, SourceCategory, Organism, StandardOrganism, ResistancePhenotype, Drug, IsolateCount, SusceptibilityPercent, Location

Recommended:
DrugName

## Setup

1. Publish Google Sheet tabs as CSV.
2. Paste URLs into `config.js`.
3. Upload all files to GitHub.
4. Enable GitHub Pages.
5. Embed in Google Site.
