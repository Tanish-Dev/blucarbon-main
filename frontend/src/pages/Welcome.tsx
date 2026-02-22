import { useRef, useLayoutEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Lock,
  ShieldCheck,
  Satellite,
  BarChart3,
  Eye,
  FileCheck,
  Plus,
  Minus,
  Menu,
  X,
} from "lucide-react";
import { AboutSection } from "@/components/AboutSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { VerifierPortalSection } from "@/components/VerifierPortalSection";
import { TechSection } from "@/components/TechSection";
import BrandLogo from "@/components/BrandLogo";

gsap.registerPlugin(ScrollTrigger);

const allFeatures = [
  {
    title: "MRV Transparency",
    subtitle: "Fully auditable measurement, reporting, and verification",
    icon: ShieldCheck,
    points: [
      "Satellite-derived biomass estimates",
      "Confidence intervals per assessment",
      "Methodology documentation",
      "Auditor-readable outputs",
    ],
  },
  {
    title: "Data Integrity",
    subtitle: "Tamper-proof field and satellite data handling",
    icon: BadgeCheck,
    points: [
      "On-chain data anchoring",
      "Immutable audit trail",
      "Encrypted field uploads",
      "Role-based access control",
    ],
  },
  {
    title: "Third-Party Oversight",
    subtitle: "Independent verifier review built into the workflow",
    icon: BookOpen,
    points: [
      "Verifier portal integration",
      "Annotation and review support",
      "Dispute resolution pathway",
      "Credit issuance audit log",
    ],
  },
  {
    title: "Responsible Credits",
    subtitle: "Ethical and conservative carbon accounting",
    icon: Lock,
    points: [
      "No over-crediting by design",
      "Buffer pool deductions",
      "Permanence risk assessment",
      "Community benefit verification",
    ],
  },
  {
    title: "Satellite Analysis",
    subtitle: "Upload project boundaries and run AI-powered biomass analysis",
    icon: Satellite,
  },
  {
    title: "Carbon Quantification",
    subtitle: "Clear tonne estimates with uncertainty bands",
    icon: BarChart3,
  },
  {
    title: "Change Detection",
    subtitle: "NDVI and spectral overlays for ecosystem health tracking",
    icon: Eye,
  },
  {
    title: "Credit Issuance",
    subtitle: "NFT-backed credits issued on verified MRV completion",
    icon: FileCheck,
  },
];

export default function Welcome() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const complianceRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const loadTl = gsap.timeline();

      loadTl.fromTo(
        ".hero-bg-text",
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 1.5, ease: "power4.out" }
      );

      loadTl.fromTo(
        ".hero-phone",
        { y: 100, opacity: 0 },
        { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
        "-=1"
      );

      loadTl.fromTo(
        ".hero-left",
        { x: -50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.5"
      );

      loadTl.fromTo(
        ".hero-right",
        { x: 50, opacity: 0 },
        { x: 0, opacity: 1, duration: 0.8, ease: "power2.out" },
        "-=0.8"
      );

      const scrollTl = gsap.timeline({
        scrollTrigger: {
          trigger: heroRef.current,
          start: "top top",
          end: "+=120%",
          pin: true,
          scrub: 1,
          anticipatePin: 1,
        },
      });

      scrollTl.fromTo(".hero-phone", { y: 0 }, { y: -350, ease: "none" }, 0);

      scrollTl.fromTo(
        ".hero-mobile-text",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, ease: "power2.out" },
        0.2
      );

      scrollTl.fromTo(
        ".hero-bg-text",
        { opacity: 1, scale: 1 },
        { opacity: 0, scale: 0.85, ease: "none" },
        0
      );

      const complianceTrigger = {
        trigger: complianceRef.current,
        start: "top 80%",
        toggleActions: "play none none reverse",
      };

      gsap.fromTo(
        ".compliance-header",
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out", scrollTrigger: complianceTrigger }
      );

      const items = gsap.utils.toArray(".accordion-item");
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.05,
            ease: "power2.out",
            scrollTrigger: {
              trigger: ".accordion-list",
              start: "top 85%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden bg-[#fbfbfd]">
      {/* Navbar */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl flex items-center justify-between px-4 md:px-6 py-3 bg-white/90 backdrop-blur-md border border-slate-200 shadow-sm rounded-full transition-all duration-300">
        <div className="flex items-center gap-2">
          <BrandLogo />
        </div>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#about" className="hover:text-slate-900 transition-colors">About</a>
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#projects" className="hover:text-slate-900 transition-colors">Projects</a>
          <a href="#technology" className="hover:text-slate-900 transition-colors">Technology</a>
          <a href="#compliance" className="hover:text-slate-900 transition-colors">Standards</a>
        </div>
        
        <div className="flex items-center gap-2">
          <Link to="/login" className="hidden sm:block">
            <Button className="h-10 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold px-6 text-sm">
              Login
            </Button>
          </Link>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav Overlay */}
        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 mt-4 mx-auto w-full bg-white border border-slate-200 rounded-3xl shadow-xl p-6 flex flex-col gap-4 md:hidden animate-in fade-in slide-in-from-top-4 duration-200">
            <a href="#about" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors font-medium">About</a>
            <a href="#features" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors font-medium">Features</a>
            <a href="#projects" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors font-medium">Projects</a>
            <a href="#technology" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors font-medium">Technology</a>
            <a href="#compliance" onClick={() => setIsMenuOpen(false)} className="px-4 py-2 hover:bg-slate-50 rounded-xl transition-colors font-medium">Standards</a>
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="mt-2">
              <Button className="w-full h-12 rounded-xl bg-slate-900 text-white font-semibold">
                Login
              </Button>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div
        ref={heroRef}
        className="relative w-full h-screen overflow-hidden bg-[#f0f4f0]"
      >
        {/* Giant Background Text */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden px-4">
          <h1 className="hero-bg-text text-[14vw] md:text-[21vw] font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-slate-600 to-slate-900 leading-none whitespace-nowrap">
            BluCarbon
          </h1>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 container mx-auto h-full px-6 md:px-12 pt-36 md:pt-60">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-12 items-center cursor-default">

            {/* Left Column (Tagline & Buttons) */}
            <div className="hero-left md:col-span-3 md:self-center md:pl-16 md:order-1 opacity-0 mt-8 md:mt-12 flex flex-col items-center md:items-start text-center md:text-left order-2 md:order-1">
              <p className="text-slate-500 text-sm md:text-base leading-tight mb-6 max-w-xs font-normal">
                Satellite-verified blue carbon credits. <br className="hidden md:block" /> Transparent, traceable, blockchain-backed.
              </p>
              <div className="flex flex-col gap-3 w-full items-center md:items-start md:w-auto">
                <Link to="/login" className="w-auto">
                  <Button className="h-12 w-auto rounded-full bg-white hover:bg-slate-50 text-slate-900 border border-slate-900 font-semibold shadow-lg shadow-slate-900/10 px-8">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <a
                  href="#compliance"
                  className="text-xs text-slate-500 hover:text-slate-900 transition-colors flex items-center justify-center md:justify-start gap-2 font-medium"
                >
                  <ShieldCheck className="h-3.5 w-3.5" /> View our MRV Standards
                </a>
              </div>
            </div>

            {/* Center Column: Phone */}
            <div className="hero-phone md:col-span-6 flex flex-col items-center order-1 md:order-2 opacity-0 relative z-20 mt-16 md:mt-80">
              <img
                src="/phone.png"
                alt="BluCarbon App Interface"
                className="w-48 sm:w-56 md:w-[340px] drop-shadow-2xl"
              />

            </div>

            {/* Right Column (Heading) */}
            <div className="hero-right md:col-span-3 md:self-center md:order-3 text-center md:text-left opacity-0 md:translate-x-10 mt-8 md:mt-12 order-3">
              <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-5xl font-medium leading-tight text-slate-900 tracking-tight">
                Satellite-Powered <br className="hidden md:block" />
                <span className="text-[#16a34a] font-bold">Verification.</span>
              </h2>
            </div>

          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-[#fbfbfd] pointer-events-none" />
      </div>

      <AboutSection />
      <FeaturesSection />
      <VerifierPortalSection />
      <TechSection />

      {/* MRV Standards / Compliance Section */}
      <section
        ref={complianceRef}
        id="compliance"
        className="relative mx-auto w-full max-w-7xl px-6 py-20 md:py-32 md:px-8 bg-[#fbfbfd]"
      >
        <div className="compliance-header mx-auto max-w-3xl text-center opacity-0 translate-y-6">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-5xl">
            MRV Integrity & Carbon Standards
          </h2>
          <p className="mt-6 text-lg text-slate-600">
            Our platform is built on a foundation of transparent verification, conservative carbon accounting, and rigorous third-party oversight.
          </p>
        </div>

        <div className="accordion-list mt-16 w-full max-w-7xl mx-auto flex flex-col">
          <div className="mb-4 text-xs font-bold tracking-widest text-slate-500 uppercase flex items-center gap-2">
            MRV STANDARDS
          </div>
          <div className="w-full border-t border-slate-200">
            {allFeatures.map((feature, index) => (
              <AccordionItem
                key={feature.title}
                feature={feature}
                isOpen={openIndex === index}
                onClick={() => setOpenIndex((prev) => (prev === index ? null : index))}
              />
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link to="/register" className="w-full sm:w-auto">
            <Button className="h-12 w-full rounded-full px-10 text-base font-semibold shadow-md transition-transform active:scale-95 sm:w-auto bg-[#16a34a] hover:bg-[#15803d] text-white">
              Register a Project
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
          <Link to="/login" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="h-12 w-full rounded-full px-10 text-base font-medium shadow-sm hover:bg-slate-50 active:scale-95 sm:w-auto"
            >
              Sign In
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative w-full bg-[#0a0a0a] text-white overflow-hidden py-24 px-6 md:px-12 font-sans border-t border-white/5">
        <div className="container mx-auto relative z-20">
          <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-[30rem]">
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <BrandLogo className="text-3xl text-white" />
                <div className="h-5 w-px bg-white/20"></div>
                <span className="text-sm text-slate-400 font-medium">Blue Carbon MRV</span>
              </div>
              <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
                Empowering coastal ecosystem projects with satellite-grade carbon verification tools.
              </p>
            </div>

            <div className="flex gap-16 md:gap-32 text-sm">
              <div className="flex flex-col gap-5">
                <h4 className="font-semibold text-white tracking-wide">Company</h4>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">About</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Careers</a>
              </div>
              <div className="flex flex-col gap-5">
                <h4 className="font-semibold text-white tracking-wide">Legal</h4>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors">Security</a>
              </div>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-white/10 relative">
            <div className="text-xs text-slate-500 mb-4 md:mb-0 font-medium">
              © 2026 BluCarbon. All rights reserved.
            </div>
          </div>
        </div>

        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full pointer-events-none select-none flex justify-center items-center z-0 opacity-100 px-4">
          <h1 className="text-[16vw] md:text-[23vw] font-bold text-[#36393d] tracking-tighter leading-none whitespace-nowrap">
            BluCarbon
          </h1>
        </div>
      </footer>
    </div>
  );
}

function AccordionItem({
  feature,
  isOpen,
  onClick,
}: {
  feature: any;
  isOpen: boolean;
  onClick: () => void;
}) {
  const Icon = feature.icon;
  const contentRef = useRef<HTMLDivElement>(null);

  return (
    <div className="accordion-item border-b border-slate-200 opacity-0">
      <button
        onClick={onClick}
        className="w-full py-6 flex items-center justify-between group text-left focus:outline-none"
      >
        <div className="flex items-center gap-4">
          <Icon className="h-6 w-6 text-slate-900 group-hover:text-slate-700 transition-colors" strokeWidth={1.5} />
          <h3 className="text-xl md:text-2xl font-normal text-slate-900 group-hover:text-slate-700 transition-colors">
            {feature.title}
          </h3>
        </div>
        <div className="text-slate-900 transition-transform duration-300">
          {isOpen ? <Minus className="h-6 w-6" strokeWidth={1.5} /> : <Plus className="h-6 w-6" strokeWidth={1.5} />}
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${isOpen ? "opacity-100 mb-6" : "opacity-0"}`}
        style={{ maxHeight: isOpen && contentRef.current ? contentRef.current.scrollHeight + 40 : 0 }}
      >
        <div ref={contentRef} className="text-slate-600 leading-relaxed text-base md:text-lg max-w-4xl ml-10 pl-4">
          <p className="mb-4">{feature.subtitle}</p>
          {feature.points && (
            <ul className="space-y-2 list-none">
              {feature.points.map((point: string) => (
                <li key={point} className="flex items-start gap-2">
                  <span className="text-slate-400 select-none">-</span>
                  {point}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
