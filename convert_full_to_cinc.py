from pathlib import Path
import re

source = Path("paper.tex").read_text()
body = source[source.index("\\section{Introduction}"):]
body = body.replace("\\begin{equation{}}", "\\begin{equation}")
body = body.replace("\\end{equation{}}", "\\end{equation}")
body = body.replace("—", "--")
architecture = r'''\begin{figure}[t]
\centering
\includegraphics[width=\columnwidth]{figures/fig1_architecture.pdf}
\caption{COGN-NDAN conceptual architecture. The three layers exchange intent, policy, and feedback information; the diagram is architectural and not an empirical result.}
\label{fig:full-architecture}
\end{figure}
'''
packet = r'''\begin{figure}[t]
\centering
\includegraphics[width=\columnwidth]{figures/fig2_packet_workflow.pdf}
\caption{Semantic packet and routing workflow. Header fields carry intent and policy metadata to a routing decision; integrity verification and quarantine are protocol states, not measured security results.}
\label{fig:full-packet}
\end{figure}
'''
boundary = r'''\begin{figure}[t]
\centering
\includegraphics[width=\columnwidth]{figures/fig3_boundary.pdf}
\caption{Reproducibility boundary. Browser behavior and procedural signals are available from source; empirical validation artifacts remain future work.}
\label{fig:full-boundary}
\end{figure}
'''
body = body.replace("\\section{System Architecture and Cross-Layer Integration}", architecture + "\\section{System Architecture and Cross-Layer Integration}", 1)
body = body.replace("\\subsection{Edge-Device Intelligence Layer: Distributed Inference and Closed-Loop Neural Feedback}", packet + "\\subsection{Edge-Device Intelligence Layer: Distributed Inference and Closed-Loop Neural Feedback}", 1)
body = body.replace("\\section{Privacy, Data Ownership, and Ethical Considerations}", boundary + "\\section{Privacy, Data Ownership, and Ethical Considerations}", 1)
header = r'''\documentclass{BVP_CINC}
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
Semantic communication can reduce the cost of transporting information when an application needs task-relevant meaning rather than exact reconstruction. This paper presents COGN-NDAN, a cross-layer protocol architecture for 6G systems that combines semantic feature transport, intent-based routing, adaptive edge inference, and feedback from a cognitive-load index. The architecture connects application urgency to network scheduling and physical-layer adaptation, including reconfigurable intelligent surfaces. It also specifies a semantic packet header and an integrity mechanism based on keyed hashes. The accompanying repository contains a browser-based demonstrator with procedural EEG-like waveforms, configurable traffic scenarios, and illustrative telemetry; it does not contain an NS-3 implementation, experimental datasets, or measured network traces. Accordingly, the numerical values shown in the demonstrator are simulation defaults and are not presented here as independently validated experimental results. The full manuscript formalizes the design, identifies assumptions, and defines a reproducibility boundary for future implementation and evaluation.
\end{abstract}
\begin{keywords}
semantic communication, 6G networks, edge intelligence, cognitive feedback, reconfigurable intelligent surfaces
\end{keywords}
\maketitle
'''
Path("CINC_10432_full_revised.tex").write_text(header + body)
