import { useRef, useEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Satellite, ShieldCheck, Coins } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                ".about-header-element",
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
                ".about-card",
                { y: 40, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    stagger: 0.15,
                    ease: "power2.out",
                    scrollTrigger: {
                        trigger: ".about-cards-container",
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
            id="about"
            className="w-full pt-20 pb-20 px-6 md:px-12 bg-[#fbfbfd] border-t border-slate-200/50"
        >
            <div className="max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 md:gap-16 mb-16">
                    <div className="md:w-1/2">
                        <div className="about-header-element inline-flex items-center gap-2 px-3 py-1 rounded-full border border-slate-200 bg-white shadow-sm mb-6">
                            <Satellite className="w-4 h-4 text-green-600" />
                            <span className="text-xs font-medium text-slate-600 uppercase tracking-tight">Why BluCarbon?</span>
                        </div>
                        <h2 className="about-header-element text-3xl md:text-5xl font-medium text-slate-900 tracking-tight leading-tight">
                            Verified blue carbon. <br />
                            <span className="text-slate-500">Trusted by science. Backed by blockchain.</span>
                        </h2>
                    </div>
                    <div className="md:w-1/2 md:pt-16">
                        <p className="about-header-element text-[17px] font-normal text-slate-500 leading-normal tracking-tight">
                            BluCarbon is built to address gaps in blue carbon credit integrity by combining satellite remote sensing,
                            digital MRV workflows, and on-chain credit issuance into a single transparent platform.
                            The system prioritizes accuracy, traceability, and real-world feasibility for coastal ecosystem projects.
                        </p>
                    </div>
                </div>

                {/* Cards Section */}
                <div className="about-cards-container grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Card 1 */}
                    <div className="about-card p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-5">
                            <Satellite className="w-6 h-6 text-slate-800" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 mb-2 tracking-tight">
                            Satellite-Powered MRV
                        </h3>
                        <p className="text-slate-500 leading-snug tracking-tight font-normal">
                            Sentinel Hub satellite imagery drives biomass estimation and ecosystem change detection across mangrove, seagrass, and saltmarsh projects.
                        </p>
                    </div>

                    {/* Card 2 */}
                    <div className="about-card p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-5">
                            <ShieldCheck className="w-6 h-6 text-slate-800" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 mb-2 tracking-tight">
                            Transparent Verification
                        </h3>
                        <p className="text-slate-500 leading-snug tracking-tight font-normal">
                            Every MRV report is auditable end-to-end. Satellite inputs, field measurements, and carbon calculations are visible to project owners and third-party verifiers alike.
                        </p>
                    </div>

                    {/* Card 3 */}
                    <div className="about-card p-8 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-5">
                            <Coins className="w-6 h-6 text-slate-800" strokeWidth={1.5} />
                        </div>
                        <h3 className="text-xl font-medium text-slate-900 mb-2 tracking-tight">
                            Blockchain-Backed Credits
                        </h3>
                        <p className="text-slate-500 leading-snug tracking-tight font-normal">
                            Carbon credits are issued as NFTs on-chain upon verified MRV completion, ensuring each tonne is unique, traceable, and cannot be double-counted.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
