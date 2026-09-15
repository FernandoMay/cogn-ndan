# CINC manuscript verification

Verification date: 14 September 2026

## Source checks

- Abstract word count: **147 words**. Counted from the text between `\\begin{abstract}` and `\\end{abstract}`, after removing LaTeX command syntax.
- Keyword count: **5** (`semantic communication`; `6G networks`; `edge intelligence`; `cognitive feedback`; `reconfigurable intelligent surfaces`).
- Grant placeholders in `CINC_10432_clean.tex`: **none found**. No `#XXXX`, `XXXX`, `TBD`, `TODO`, or `PLACEHOLDER` grant identifier was present. The manuscript does contain the author-confirmation funding statement at line 113.
- Citation keys: **10** unique in-text keys.
- Bibliography keys: **10** unique `\\bibitem` keys.
- Citation/bibliography comparison: **pass**; no missing bibliography keys and no uncited bibliography keys.
- Figure scan: no manuscript figure environment or manuscript `\\includegraphics` reference found. The official class requires `logo/BVP-logo.pdf`, which is present.

## Compilation

Compilation was attempted from `/Users/fmf/Documents/cinc-10432` with the official class available through `TEXINPUTS`:

```sh
TEXINPUTS="./cinc-template:${TEXINPUTS}" pdflatex -interaction=nonstopmode -halt-on-error -output-directory=verification-build CINC_10432_clean.tex
TEXINPUTS="./cinc-template:${TEXINPUTS}" pdflatex -interaction=nonstopmode -halt-on-error -output-directory=verification-build CINC_10432_tracked.tex
```

Both attempts were blocked before TeX processing because `pdflatex` is not installed or available on `PATH`:

- Clean exit status: **127**. Log: `verification-build/CINC_10432_clean.pdflatex.log`.
- Tracked exit status: **127**. Log: `verification-build/CINC_10432_tracked.pdflatex.log`.
- No alternate TeX engine (`latexmk`, `tectonic`, `xelatex`, or `lualatex`) was available.

Because no PDF was produced, PDF/log inspection for overfull boxes, missing figures, undefined references, and TeX fatal errors is **blocked**. The captured logs contain the environment error `zsh:1: command not found: pdflatex`; this is the compilation blocker, not a manuscript diagnostic.

## Archive

Created `CINC_10432_latex_source.zip` with only the necessary source files:

- `CINC_10432_clean.tex`
- `CINC_10432_tracked.tex`
- `cinc-template/BVP_CINC.cls`
- `cinc-template/logo/BVP-logo.pdf`

No files were uploaded or sent.

## Unresolved author decisions

The following confirmations remain documented in `REVIEW_NOTES.md`: official affiliation wording, funding statement and grant details if applicable, conflicts-of-interest statement, whether any external human data or experiments were used and their ethics information, corresponding-author email, and ORCID ownership/display. Final DOI and reference metadata also require author review.
