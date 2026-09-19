"""Build CINC_10432_full_revised.tex = BVP_CINC template + APPROVED content.

Approved content source: paper.tex (24 refs, 3 PNG figs, 5 tables,
full experimental claims matching the editor-approved PDF).
Template: cinc-template/BVP_CINC.cls with BVP front matter.
"""
from pathlib import Path
import re
import sys

ABSTRACT = r"""The transition towards 6G networks necessitates a paradigm shift from bit-centric transmission to semantic-aware, goal-oriented communication. Traditional protocols such as TCP/IP operate agnostically to content semantics and fail to leverage redundancy in AI-driven applications, particularly in bandwidth-constrained, latency-critical scenarios such as Neuro-Digital Brain-Computer Interfaces (BCI) and Urban Air Mobility (UAM) systems. This paper introduces \textbf{COGN-NDAN} (Cognitive Orchestration \& Green Networking --- NeuroDigital Adaptive Network), a cross-layer protocol for neuro-symbiotic 6G networks. \COGN{} couples two complementary mechanisms. First, a \emph{physically grounded} semantic-communication layer (standard RF/electromagnetic transmission) that encodes task-specific features instead of raw bit streams, achieving 87--92\% bandwidth reduction while preserving semantic fidelity $\geq 0.85$. Second, a \emph{neuro}-symbiotic control loop in which EEG-derived cognitive-load biomarkers (P300 amplitude, theta-beta ratio, spectral entropy) modulate network prioritization, encoder compression, and RIS beam steering. Here ``neuro'' denotes strictly the EEG biomarker pipeline and its QoS feedback; all RF and beamforming behavior remains conventional electromagnetics. We present a cross-layer architecture unifying Physical Layer technologies (Near-Field Beamforming, Reconfigurable Intelligent Surfaces) with a Semantic Network Layer employing neural traffic classification. Comprehensive simulation results demonstrate that \COGN{} outperforms baseline stacks (gRPC, MQTT, CoAP) \emph{and} the DeepSC semantic-communication baseline by achieving 45\% reduction in end-to-end latency, 40\% improvement in energy efficiency, and superior robustness at low SNR regimes, with all gains statistically significant. We further integrate SentinelX, a cryptographic security module, to defend against adversarial semantic perturbations and injection attacks. Validation across heterogeneous traffic and hardware configurations demonstrates feasibility for deployment within the Nexus infrastructure."""

KEYWORDS = ("6G networks, semantic communication, edge intelligence, "
            "neuro-symbiotic networks, reconfigurable intelligent surfaces")

HEADER = (r"""\documentclass{BVP_CINC}
\usepackage{amsmath,amssymb,amsfonts}
\usepackage{booktabs}
\usepackage{algorithmic}
\usepackage{graphicx}
\usepackage{textcomp}
\usepackage{xcolor}
\usepackage{tikz}
\usetikzlibrary{shapes,arrows,positioning,fit,calc}
\usepackage{hyperref}
\newcommand{\COGN}{COGN-NDAN}
\newcommand{\RI}{Reconfigurable Intelligent Surface}
\setlength{\tabcolsep}{4pt}
\renewcommand{\arraystretch}{1.15}
\received{}
\revised{}
\accepted{}
\published{}
\doi{}
\OAText{{\copyright} The Author(s) 2026. Published by BON VIEW PUBLISHING PTE. LTD. This is an open access article under the CC BY License (https://creativecommons.org/licenses/by/4.0/).}
\begin{document}
\arttype{Research Article}
\title{COGN-NDAN: A Semantic-Aware Cross-Layer Protocol with Neural Feedback Integration for Neuro-Symbiotic 6G Networks}
\author{Fernando May Fuentes\thanks{\textbf{Corresponding author:} Fernando May Fuentes, Instituto Politécnico Nacional, UPIITA, Mexico; Beihang University, China. Email: \email{fmayf1500@alumno.ipn.mx}; ORCID: \href{https://orcid.org/0009-0002-3953-5224}{0009-0002-3953-5224}.}}
\affil{Instituto Politécnico Nacional, UPIITA, Mexico; Beihang University, School of Electronics and Information Engineering, China.\\ORCID: \href{https://orcid.org/0009-0002-3953-5224}{0009-0002-3953-5224}.}
\begin{abstract}
""" + ABSTRACT + r"""
\end{abstract}
\begin{keywords}
""" + KEYWORDS + r"""
\end{keywords}
\maketitle
""")


def count_words(text):
    clean = re.sub(r'\\[a-zA-Z]+\{?', '', text)
    clean = re.sub(r'[}$_^&%]', '', clean)
    return len([w for w in clean.split() if w])


def main():
    n_abs = count_words(ABSTRACT)
    print(f"Abstract word count: {n_abs} (limit 250)")
    if n_abs > 250:
        sys.exit("FAIL: abstract exceeds 250 words")

    src = Path("paper.tex").read_text(encoding="utf-8")
    start = src.index("\\section{Introduction}")
    body = src[start:]
    if not body.rstrip().endswith("\\end{document}"):
        sys.exit("FAIL: body does not end with \\end{document}")

    # Fix typo: \COGN-NDAN renders as "COGN-NDAN-NDAN"
    body = body.replace("\\COGN-NDAN", "\\COGN{}")

    out = HEADER + body
    Path("CINC_10432_full_revised.tex").write_text(out, encoding="utf-8")

    n_bib = len(re.findall(r'\\bibitem\{', out))
    figs = re.findall(r'\\includegraphics\[[^\]]*\]\{([^}]+)\}', out)
    tabs = len(re.findall(r'\\begin\{table\}', out))
    print(f"Bibitems: {n_bib} (expect 24)")
    print(f"Figures: {figs}")
    print(f"Tables: {tabs} (expect 5)")
    assert n_bib == 24, "FAIL: bibitem count"
    assert tabs == 5, "FAIL: table count"
    assert len(figs) == 3, "FAIL: figure count"
    print("BUILD OK")


if __name__ == "__main__":
    main()
