import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Server, Satellite, Database, Globe } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const techItems = [
    {
        icon: Server,
        title: "Backend",
        description:
            "FastAPI-based backend handling authentication, project management, MRV workflows, and credit issuance logic.",
        color: "from-green-500/10 to-green-600/5",
        borderColor: "border-green-200/60",
        iconColor: "text-green-600",
    },
    {
        icon: Satellite,
        title: "Satellite Integration",
        description:
            "Sentinel Hub API integration for pulling multispectral imagery, computing NDVI, and running automated biomass estimation models.",
        color: "from-cyan-500/10 to-cyan-600/5",
        borderColor: "border-cyan-200/60",
        iconColor: "text-cyan-600",
    },
    {
        icon: Database,
        title: "Database & Storage",
        description:
            "MongoDB for storing project metadata, MRV reports, field data, and user records. Secure and scalable for multi-project operations.",
        color: "from-violet-500/10 to-violet-600/5",
        borderColor: "border-violet-200/60",
        iconColor: "text-violet-600",
    },
    {
        icon: Globe,
        title: "Blockchain",
        description:
            "Smart contracts on EVM-compatible chains for carbon credit NFT minting, project registry, and on-chain MRV anchoring via QuickNode.",
        color: "from-emerald-500/10 to-emerald-600/5",
        borderColor: "border-emerald-200/60",
        iconColor: "text-emerald-600",
    },
];

export function TechSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".tech-header-el",
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.1,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: containerRef.current,
                        start: "top 80%",
                        toggleActions: "play none none reverse",
                    },
                }
            );

            gsap.fromTo(
                ".tech-card",
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.7,
                    stagger: 0.12,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".tech-grid",
                        start: "top 85%",
                        toggleActions: "play none none reverse",
                    },
                }
            );
        }, containerRef);

        return () => ctx.revert();
    }, []);

    return (
        <section
            ref={containerRef}
            id="technology"
            className="w-full py-24 md:py-32 px-6 md:px-12 bg-[#fbfbfd] border-t border-slate-200/50"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <div className="tech-header-el inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white shadow-sm mb-6">
                        <Satellite className="w-4 h-4 text-green-600" />
                        <span className="text-xs font-medium text-slate-600 uppercase tracking-tight">
                            Technology
                        </span>
                    </div>
                    <h2 className="tech-header-el text-3xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight mb-5">
                        Built on modern,
                        <br />
                        <span className="text-slate-500">reliable infrastructure.</span>
                    </h2>
                    <p className="tech-header-el text-[17px] font-normal text-slate-500 leading-normal tracking-tight">
                        A robust technology stack designed for performance, security,
                        and auditability at every layer of the MRV pipeline.
                    </p>
                </div>

                {/* Tech Grid */}
                <div className="tech-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                    {techItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className={`tech-card group relative p-8 rounded-2xl border ${item.borderColor} bg-gradient-to-b ${item.color} hover:shadow-lg transition-all duration-300 overflow-hidden`}
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />

                                <div className="relative z-10">
                                    <div className="w-12 h-12 rounded-xl bg-white/80 border border-white flex items-center justify-center mb-6 shadow-sm">
                                        <Icon
                                            className={`w-6 h-6 ${item.iconColor}`}
                                            strokeWidth={1.5}
                                        />
                                    </div>
                                    <h3 className="text-lg font-medium text-slate-900 mb-3 tracking-tight">
                                        {item.title}
                                    </h3>
                                    <p className="text-slate-500 leading-relaxed tracking-tight font-normal text-[14px]">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Disclaimer */}
                <div className="tech-header-el mt-16 text-center">
                    <p className="text-sm text-slate-400 max-w-xl mx-auto leading-relaxed">
                        BluCarbon uses satellite data strictly for carbon stock estimation and
                        ecosystem monitoring. All outputs are transparent, auditable, and designed
                        to support — not replace — rigorous third-party verification.
                    </p>
                </div>
            </div>
        </section>
    );
}
