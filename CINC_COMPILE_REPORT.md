# CINC Manuscript Compilation Report

Date: 2026-09-14

## Inputs

- `CINC_10432_clean.tex`
- `CINC_10432_tracked.tex`
- Official class: `cinc-template/BVP_CINC.cls`

Manuscript and template content was not modified.

## TeX installation and packages

Engine:

```text
pdfTeX 3.141592653-2.6-1.40.29 (TeX Live 2026)
kpathsea version 6.4.2
```

The user tree was initialized with:

```sh
tlmgr init-usertree
```

It was already initialized at `/Users/fmf/Library/texmf/tlpkg/texlive.tlpdb`.
The missing metric was identified with:

```sh
tlmgr info helvet
```

`helvet` is not a package in this TeX Live repository; `tlmgr` identified
`helvetic` as the package containing `phvr8t.tfm`. The following user-mode
installation commands were run successfully:

```sh
tlmgr install --usermode helvetic
tlmgr install --usermode rsfs
```

The second package was required after Helvetica was fixed because both inputs
also require the `rsfs10` metric. No system-wide installation or password was
used.

## Compilation

Each command below was run three times to resolve references:

```sh
TEXINPUTS="$PWD/cinc-template:${TEXINPUTS:-}" pdflatex -interaction=nonstopmode -halt-on-error -jobname=CINC_10432_clean CINC_10432_clean.tex
TEXINPUTS="$PWD/cinc-template:${TEXINPUTS:-}" pdflatex -interaction=nonstopmode -halt-on-error -jobname=CINC_10432_tracked CINC_10432_tracked.tex
```

Both commands completed successfully.

## Outputs

- `CINC_10432_clean.pdf`: generated, 3 pages
- `CINC_10432_tracked.pdf`: generated, 3 pages
- `CINC_10432_latex_source.zip`: regenerated from both TeX sources, the class,
  and the logo PDF

## Warnings

The final logs contain these non-fatal warnings for both PDFs:

- Class name requested as `BVP_CINC`, while the class provides `BVP_MS-NEW`.
- `etex`: extended allocation is already in use.
- `hyperref`: `pdfpagelabels` is turned off because `\thepage` is undefined.
- `hyperref`: `pdftex` and `bookmarks` options were already used.
- Overfull boxes: one 34.29498pt vertical box, one 200.0pt horizontal box, one
  257.5pt horizontal box, and vertical boxes of 3.29498pt on later output.

No undefined-reference, missing-font, or fatal compilation errors remain.
