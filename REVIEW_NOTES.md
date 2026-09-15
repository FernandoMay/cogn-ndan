# Review notes for CINC manuscript #10432

## Status

Submission package prepared without upload or repository commit. The manuscript uses the supplied CINC class, contains three reproducible conceptual figures, and limits claims to the architecture and browser demonstrator supported by repository evidence.

## Final author metadata

- Affiliation: Instituto Politécnico Nacional, UPIITA, Mexico; Beihang University (BUAA), China.
- Corresponding email: `fmayf1500@alumno.ipn.mx`.
- ORCID: `0009-0002-3953-5224`.
- Funding: `This research received no external funding.`
- Conflicts: The author declares no conflicts of interest.
- Ethics/data boundary: No human-participant or animal experiment is included; animal-experiment reporting is not applicable.

## Evidence and reproducibility limits

- The repository contains `paper.tex`, `app.js`, `index.html`, and `style.css`; it does not contain NS-3 modules, trained model weights, raw EEG, human-participant data, measured network traces, or manuscript figures.
- The JavaScript produces procedural EEG-like waveforms and mock adversarial behavior. Displayed metrics are interface defaults/illustrations, not independently validated measurements.
- The clean manuscript removes claims of NS-3 validation, clinical-grade data, hardware-accurate models, field trials, external laboratory contributions, and the unrelated Nexus repository URL. The author should restore any claim only with supporting artifacts and citations.
- No animal experiments are present; animal-experiment reporting is explicitly marked not applicable.

## Reference review

- Crossref DOI checks completed for all 13 bibliography entries; DOI, title, authors, venue, year, volume, and pages/article number were checked against the returned metadata.
- Four 2021–2022 recent works are present and directly relevant: Xie et al. (2021), Alexandropoulos et al. (2021), Yuan et al. (2021), and Iyer et al. (2022).
- Citation/reference audit: 13 bibliography entries and 13 cited keys; no uncited bibliography entries and no undefined citation keys.

## Figure inventory

| Figure | Source | Generated output | Scientific status |
|---|---|---|---|
| 1 | `figures/fig1_architecture.tex` | `figures/fig1_architecture.pdf` | Conceptual architecture |
| 2 | `figures/fig2_packet_workflow.tex` | `figures/fig2_packet_workflow.pdf` | Conceptual protocol workflow |
| 3 | `figures/fig3_boundary.tex` | `figures/fig3_boundary.pdf` | Conceptual reproducibility boundary |

All three outputs are vector PDFs generated with pdfTeX/TikZ; no empirical chart is included.
