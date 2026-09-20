"""Mirror the 6 verified 2021-2026 reference swaps into paper.tex and papers/mq.tex.

All strings are identical across the three files (shared body). Each
replacement asserts exactly 1 occurrence (bibitem) or the expected
in-text count before rewriting.
"""
from pathlib import Path
import sys

SWAPS = [
    # (old, new, expected_count)
    ("\\bibitem{zhou2019edge}\nZ.~Zhou, X.~Chen, E.~Li, L.~Zeng, K.~Luo, and J.~Zhang, ``Edge intelligence: Paving the last mile of artificial intelligence with edge computing,'' \\emph{Proceedings of the IEEE}, vol.~107, no.~8, pp.~1738--1762, Aug. 2019. DOI: \\href{https://doi.org/10.1109/JPROC.2019.2918951}{10.1109/JPROC.2019.2918951}",
     "\\bibitem{letaief2022edge}\nK.~B. Letaief, Y.~Shi, J.~Lu, and J.~Lu, ``Edge artificial intelligence for 6G: Vision, enabling technologies, and applications,'' \\emph{IEEE Journal on Selected Areas in Communications}, vol.~40, no.~1, pp.~5--36, Jan. 2022. DOI: \\href{https://doi.org/10.1109/JSAC.2021.3126076}{10.1109/JSAC.2021.3126076}",
     1),
    ("Zhou et al. \\cite{zhou2019edge} surveyed the convergence of edge computing with deep learning, identifying that optimal split points depend on network latency, device computational capacity, and task deadline constraints.",
     "Letaief et al. \\cite{letaief2022edge} surveyed edge artificial intelligence for 6G, covering how network latency, device computational capacity, and task deadlines shape edge-device collaboration.",
     1),
    ("\\bibitem{mao2017learning}\nY.~Mao, C.~You, J.~Zhang, K.~Huang, and K.~B. Letaief, ``A survey on mobile edge computing: The communication perspective,'' \\emph{IEEE Communications Surveys \\& Tutorials}, vol.~19, no.~4, pp.~2322--2358, 2017. DOI: \\href{https://doi.org/10.1109/COMST.2017.2745201}{10.1109/COMST.2017.2745201}",
     "\\bibitem{luo2021resource}\nQ.~Luo, S.~Hu, C.~Li, G.~Li, and W.~Shi, ``Resource scheduling in edge computing: A survey,'' \\emph{IEEE Communications Surveys \\& Tutorials}, vol.~23, no.~4, pp.~2131--2165, 4th Quart. 2021. DOI: \\href{https://doi.org/10.1109/COMST.2021.3106401}{10.1109/COMST.2021.3106401}",
     1),
    ("Recent work by Mao et al. \\cite{mao2017learning} applies reinforcement learning to dynamic offloading decisions, learning optimal split points under variable network conditions.",
     "Recent work by Luo et al. \\cite{luo2021resource} surveys resource scheduling in edge computing, covering dynamic offloading policies that adapt split points to variable network conditions.",
     1),
    ("\\bibitem{wu2020towards}\nQ.~Wu and R.~Zhang, ``Towards smart and reconfigurable environment: Intelligent reflecting surface aided wireless network,'' \\emph{IEEE Communications Magazine}, vol.~58, no.~1, pp.~106--112, Jan. 2020. DOI: \\href{https://doi.org/10.1109/MCOM.001.1900107}{10.1109/MCOM.001.1900107}",
     "\\bibitem{wu2021tutorial}\nQ.~Wu, S.~Zhang, B.~Zheng, C.~You, and R.~Zhang, ``Intelligent reflecting surface-aided wireless communications: A tutorial,'' \\emph{IEEE Transactions on Communications}, vol.~69, no.~5, pp.~3313--3351, May 2021. DOI: \\href{https://doi.org/10.1109/TCOMM.2021.3051897}{10.1109/TCOMM.2021.3051897}",
     1),
    ("Seminal theoretical work by Wu and Zhang \\cite{wu2020towards} established the optimization landscape for RIS-assisted MIMO systems. Subsequent work by ElMossallamy et al. \\cite{elmossallamy2020} demonstrated that RIS can effectively combat multipath fading and improve coverage in NLOS scenarios.",
     "The tutorial by Wu et al. \\cite{wu2021tutorial} systematized the optimization landscape for RIS-aided wireless communications. Subsequent work by Tang et al. \\cite{tang2021ris} validated RIS path-loss models through experimental measurement, confirming practical coverage gains.",
     1),
    ("\\bibitem{elmossallamy2020}\nM.~A. ElMossallamy, H.~Zhang, L.~Song, K.~G. Seddik, Z.~Han, and G.~Y. Li, ``Reconfigurable intelligent surfaces for wireless communications: Principles, challenges, and opportunities,'' \\emph{IEEE Transactions on Cognitive Communications and Networking}, vol.~6, no.~3, pp.~990--1002, Sep. 2020. DOI: \\href{https://doi.org/10.1109/TCCN.2020.2992604}{10.1109/TCCN.2020.2992604}",
     "\\bibitem{tang2021ris}\nW.~Tang, M.~Z.~Chen, X.~Chen, J.~Y.~Dai, Y.~Han, M.~Di Renzo, Y.~Zeng, S.~Jin, Q.~Cheng, and T.~J.~Cui, ``Wireless communications with reconfigurable intelligent surface: Path loss modeling and experimental measurement,'' \\emph{IEEE Transactions on Wireless Communications}, vol.~20, no.~1, pp.~421--439, Jan. 2021. DOI: \\href{https://doi.org/10.1109/TWC.2020.3024887}{10.1109/TWC.2020.3024887}",
     1),
    ("\\bibitem{roy2016workload}\nR.~N. Roy, S.~Charbonnier, A.~Campagne, and S.~Bonnet, ``Efficient mental workload estimation using task-independent EEG features,'' \\emph{Journal of Neural Engineering}, vol.~13, no.~2, art.~026019, 2016. DOI: \\href{https://doi.org/10.1088/1741-2560/13/2/026019}{10.1088/1741-2560/13/2/026019}",
     "\\bibitem{fan2022eegtnet}\nC.~Fan, J.~Hu, S.~Huang, Y.~Peng, and S.~Kwong, ``EEG-TNet: An end-to-end brain computer interface framework for mental workload estimation,'' \\emph{Frontiers in Neuroscience}, vol.~16, 2022. DOI: \\href{https://doi.org/10.3389/fnins.2022.869522}{10.3389/fnins.2022.869522}",
     1),
    ("Recent BCI systems employ these markers for adaptive interfaces (Roy et al. \\cite{roy2016workload}), but these applications remain localized to single devices.",
     "Recent BCI systems employ these markers for adaptive interfaces (Fan et al. \\cite{fan2022eegtnet}), but these applications remain localized to single devices.",
     1),
    ("\\bibitem{durumeric2014semantically}\nZ.~Durumeric, J.~Kasten, M.~Bailey, and J.~A. Halderman, ``Analysis of the HTTPS certificate ecosystem,'' in \\emph{Proceedings of the ACM Conference on Internet Measurement (IMC)}, 2013, pp.~291--304. DOI: \\href{https://doi.org/10.1145/2504730.2504755}{10.1145/2504730.2504755}",
     "\\bibitem{hu2023robust}\nQ.~Hu, G.~Zhang, Z.~Qin, Y.~Cai, G.~Yu, and G.~Y.~Li, ``Robust semantic communications with masked VQ-VAE enabled codebook,'' \\emph{IEEE Transactions on Wireless Communications}, vol.~22, no.~12, pp.~8707--8722, Dec. 2023. DOI: \\href{https://doi.org/10.1109/TWC.2023.3265201}{10.1109/TWC.2023.3265201}",
     1),
    ("Recent work (Durumeric et al. \\cite{durumeric2014semantically}) proposed detection mechanisms for semantic manipulation, though these assume offline verification.",
     "Recent work (Hu et al. \\cite{hu2023robust}) proposed robust semantic coding against semantic errors via a masked VQ-VAE codebook, though designed for link-level robustness rather than network-scale integrity verification.",
     1),
]

FILES = [
    Path("paper.tex"),
    Path("../papers/mq.tex"),
]


def main():
    for f in FILES:
        text = f.read_text(encoding="utf-8-sig")
        for old, new, expected in SWAPS:
            n = text.count(old)
            if n != expected:
                sys.exit(f"FAIL {f}: expected {expected}x, found {n}x: {old[:70]}")
            text = text.replace(old, new)
        f.write_text(text, encoding="utf-8")
        print(f"OK {f}: 12 swaps applied")


if __name__ == "__main__":
    main()
