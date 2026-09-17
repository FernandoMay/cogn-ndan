from pathlib import Path
import re

source = Path("paper.tex").read_text()
body = source[source.index("\\section{Introduction}"):]
body = body.replace("\\begin{equation{}}", "\\begin{equation}")
body = body.replace("\\end{equation{}}", "\\end{equation}")
body = body.replace("—", "--")
body = body.replace(
    "Clegg et al. \\cite{clegg2023semantic} developed practical implementations of semantic encoders for specific application domains, particularly in video transmission where frame-level semantic importance varies significantly. Similarly, Xie et al. \\cite{xie2022semantic} proposed task-oriented communication frameworks where the encoder optimizes not for raw data reconstruction but for successful downstream task completion. However, a critical gap exists in prior work: none integrate real-time biological feedback into the semantic encoding pipeline. \\COGN{} addresses this by making the encoder adaptive to user cognitive state via EEG telemetry.",
    "Clegg et al. \\cite{clegg2023semantic} developed practical implementations of semantic encoders for specific application domains, particularly in video transmission where frame-level semantic importance varies significantly. Lan et al. \\cite{lan2021semantic} surveyed semantic-system architectures and optimization questions, while Lu et al. \\cite{lu2024semantic} catalogued semantics-empowered communication techniques and open challenges. Similarly, Xie et al. \\cite{xie2022semantic} proposed task-oriented communication frameworks where the encoder optimizes not for raw data reconstruction but for successful downstream task completion. However, a critical gap exists in prior work: none integrate real-time biological feedback into the semantic encoding pipeline. \\COGN{} addresses this by making the encoder adaptive to user cognitive state via EEG telemetry."
)
body = body.replace(
    "Nearly all existing RIS optimization literature assumes quasi-static optimization horizons (on the order of seconds to minutes). \\COGN{} contributes by proposing millisecond-scale RIS adaptation triggered by semantic urgency signals, creating a feedback loop between application semantics and physical layer adaptation. This represents the first work explicitly synchronizing RIS phase shifts with semantic traffic classification.",
    "Nearly all existing RIS optimization literature assumes quasi-static optimization horizons (on the order of seconds to minutes). \\COGN{} contributes a protocol-level proposal for RIS adaptation triggered by semantic urgency signals, creating a feedback loop between application semantics and physical layer adaptation. We do not claim new RIS hardware or measured millisecond reconfiguration; the present manuscript specifies the interface and identifies the measurements required for validation."
)
body = body.replace(
    "Recent BCI systems employ these markers for adaptive interfaces (Roy et al. \\cite{roy2019multimodal}), but these applications remain localized to single devices. \\COGN{} represents the first integration of validated neuromarkers into wide-area network operation, extending cognitive load adaptation from device-level to network-level resource management.",
    "Recent BCI systems employ these markers for adaptive interfaces (Roy et al. \\cite{roy2019multimodal}), but these applications remain localized to single devices. \\COGN{} extends the design discussion toward network-level resource management. The contribution is protocol integration and explicit calibration requirements, not new biomarker discovery or clinical validation."
)
deployment = r'''\subsection{Practical Deployment Context}
Measurement-driven campus-RF studies show that building blockage, traffic locality, and deployment geometry dominate practical coverage and reliability constraints. Lightweight edge inference studies likewise show that embedded devices can execute compact classifiers under energy limits. These observations motivate the deployment assumptions in this manuscript, but they are calibration references rather than COGN-NDAN experiments.

'''
body = body.replace("\\subsection{Positioning of \\COGN{} Within the Nexus Initiative}", deployment + "\\subsection{Positioning of \\COGN{} Within the Nexus Initiative}", 1)
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
body = body.replace(
    r'''\begin{equation}
    \text{Semantic Header} = \{\text{IntentID}, \text{CriticalityLevel}, \text{CognitiveUrgency}, \text{SemanticHash}, \text{FeatureDim}\}
\end{equation}''',
    r'''\begin{equation}
\begin{aligned}
\text{Semantic Header} = \{&\text{IntentID},\ \text{CriticalityLevel},\\
&\text{CognitiveUrgency},\ \text{SemanticHash},\ \text{FeatureDim}\}.
\end{aligned}
\end{equation}'''
)
body = body.replace(
    r'''\begin{equation}
    \text{Path}^* = \arg\min_{p \in \mathcal{P}} \left[ \alpha \cdot \text{Latency}(p) + \beta \cdot \text{Energy}(p) + \gamma \cdot \text{SemanticCost}(p | \text{Intent}_i) \right]
\end{equation}''',
    r'''\begin{equation}
\begin{aligned}
\text{Path}^* = \arg\min_{p \in \mathcal{P}}\big[&\alpha\,\text{Latency}(p)+\beta\,\text{Energy}(p)\\
&+\gamma\,\text{SemanticCost}(p\mid\text{Intent}_i)\big].
\end{aligned}
\end{equation}'''
)
body = body.replace(
    "\\end{thebibliography}",
    r'''\bibitem{lan2021semantic}
Q. Lan, D. Wen, Z. Zhang, Q. Zeng, X. Chen, P. Popovski, and K. Huang, ``What is semantic communication? A view on conveying meaning in the era of machine intelligence,'' \emph{Journal of Communications and Information Networks}, vol. 6, no. 4, pp. 336--371, 2021.

\bibitem{lu2024semantic}
Z. Lu, R. Li, K. Lu, X. Chen, E. Hossain, Z. Zhao, et al., ``Semantics-empowered communications: A tutorial-cum-survey,'' \emph{IEEE Communications Surveys \& Tutorials}, vol. 26, no. 1, pp. 41--79, 2024.

\end{thebibliography}''',
    1,
)
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
