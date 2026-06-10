# AI ASP Command Center v6

## v6 changes
- Executive Brief panel removed from Executive page.
- MDRO Overview is now full-width.
- Added WHO AWaRe Dashboard.
- Added 100% stacked bar chart for Access / Watch / Reserve.
- Added AWaRe KPI cards and AI interpretation.
- AI ASP Analyst now includes AWaRe summary if Fact_AWaRe is loaded.

## Required Google Sheet CSV tabs

### Fact_ASP_Monthly
Required: YYYYMM, CRKP_Rate, CRAB_Rate, MRSA_Rate, VRE_Rate, Meropenem_DDD, Imipenem_DDD, Ertapenem_DDD, Doripenem_DDD

### Fact_Antibiogram_Master
Required: Year, Period, SourceCategory, Organism, StandardOrganism, ResistancePhenotype, Drug, IsolateCount, SusceptibilityPercent, Location

### Fact_AWaRe
Required:
Year, Access, Watch, Reserve

Example:
2024,38.99,58.57,2.45
2025,55.55,41.79,2.66
2026,51.37,45.99,2.64

## Setup
Publish each tab as CSV and paste URLs into `config.js`.


## v7 AWaRe module

This version adds a dedicated `WHO AWaRe` tab:

- Full-width interactive 100% stacked bar chart
- WHO target subtitle: Access ≥60%, Reserve <5%
- Trend interpretation cards for Access / Watch / Reserve
- Stewardship recommendation cards
- Removed redundant current-value card layout
