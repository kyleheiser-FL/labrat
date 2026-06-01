import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { BadgeCheck, CheckCircle, ClipboardList, AlertTriangle, X } from 'lucide-react';
import { triggerHaptic } from '../../lib/haptics';

interface CertificationDetail {
  title: string;
  iconType: 'check' | 'verified' | 'list' | 'info' | 'shield' | 'alert' | 'flask';
  badgeLabel: string;
  badgeClass: string;
  description: string;
  details: string[];
}

export const CERTIFICATION_DETAILS: Record<string, CertificationDetail> = {
  'authorized_supply': {
    title: "Authorized Laboratory Sourcing",
    iconType: 'shield',
    badgeLabel: "Authorized Lab Supply",
    badgeClass: "bg-cyan-500/20 text-cyan-400 border border-cyan-500/10",
    description: "LabRat is an authorized chemical sourcing gatekeeper operating transparently under verified scientific distributor frameworks.",
    details: [
      "Rigorous pre-vetting of all member laboratory credentials",
      "Secured, auditable checkout & delivery rails",
      "Strict control over inventory, lot numbers, and formulation records"
    ]
  },
  'research_only': {
    title: "Strictly Research Use Only (RUO)",
    iconType: 'alert',
    badgeLabel: "🔬 Research Use Only",
    badgeClass: "bg-amber-500/20 text-amber-300 border border-amber-500/10",
    description: "All compounds, chemical sequences, and bioresearch materials are strictly synthesized and provisioned for in-vitro laboratory analysis, academic investigations, and pre-clinical assay research.",
    details: [
      "Not for direct human use, veterinary diagnostics, or household application",
      "Recipient assumes all liability for protocol testing, handle parameters, and compound clearance",
      "Mandatory alignment with environmental safety and clinical compliance boundaries"
    ]
  },
  '99_purity': {
    title: "99.0% High-Purity Synthesis Standard",
    iconType: 'verified',
    badgeLabel: "99% Purity",
    badgeClass: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    description: "Every compound batch undergoes multi-phase HPLC (High-Performance Liquid Chromatography) and MS (Mass Spectrometry) validation to guarantee chemical composition and eliminate baseline impurities.",
    details: [
      "Active synthesis content exceeds 99.0% purity threshold consistently",
      "Zero cross-contamination or synthetic salt residues",
      "Vacuum lyophilized inside clinical classrooms under sterile inert argon gas shroud"
    ]
  },
  'certified_source': {
    title: "Certified Global Laboratories Sourcing",
    iconType: 'check',
    badgeLabel: "Certified Source",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    description: "Materials are exclusively procured from audited, established pharmaceutical synthesis laboratories who conform to premium global compound standards.",
    details: [
      "Traceability loops for every raw starter chemical substrate",
      "Continuous equipment recalibration and thermal monitoring audits",
      "Sourced from state-of-the-art facilities with spotless regulatory records"
    ]
  },
  'coas_available': {
    title: "Certificate of Analysis (COA) Reports",
    iconType: 'list',
    badgeLabel: "COAs Available",
    badgeClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    description: "We maintain fully transparent analytical chemistry records. Certified lab COAs showcasing purity testing, heavy metal scans, and water content margins are available on demand.",
    details: [
      "Independently verified by third-party testing channels",
      "Matches specific synthesis lot/batch ID assigned to your delivery",
      "Available instantly upon request via helpdesks or dispatch tickets"
    ]
  },
  'sop_verified': {
    title: "Standard Operating Procedures (SOP) Verified",
    iconType: 'info',
    badgeLabel: "SOP Verified",
    badgeClass: "bg-purple-500/10 text-purple-300 border border-purple-500/20",
    description: "All logistic handling, packaging, secure compound wrapping, and administrative verification is strictly cataloged under rigid Standard Operating Procedures.",
    details: [
      "Uniform, repeatable procedures preventing container damage or degradation",
      "Double-witness system for dose accuracy and compounding scale measurements",
      "Strict compliance with storage humidity and light insulation protocols"
    ]
  },
  'iso_17025': {
    title: "ISO/IEC 17025 Laboratory Accreditation",
    iconType: 'flask',
    badgeLabel: "ISO 17025",
    badgeClass: "bg-slate-800/60 text-slate-300 border border-slate-700/60",
    description: "Refers to the prime international standard for testing and calibration laboratories. Confirming absolute technical competence, precision error boundaries, and valid empirical testing processes.",
    details: [
      "Rigid environmental controls safeguarding compounding precision",
      "NIST-traceable calibration of balances, pipettes, and spectrophotometers",
      "Strict data integrity checks avoiding reporting biases"
    ]
  },
  'iso_9001': {
    title: "ISO 9001:2015 Quality Management System",
    iconType: 'info',
    badgeLabel: "ISO 9001",
    badgeClass: "bg-slate-800/60 text-slate-300 border border-slate-700/60",
    description: "International framework that regulates our raw compound procurement, supplier alignment, quality oversight loops, and logistical response speeds.",
    details: [
      "Comprehensive vendor performance audits and material receipt records",
      "Continuous improvement feedback loops monitoring dispatch speeds and packaging safety",
      "Proactive risk management analysis protecting bio-stability in transit"
    ]
  },
  'eu_gmp': {
    title: "EU GMP Annex 1 Sterile Compounds",
    iconType: 'verified',
    badgeLabel: "EU GMP Annex 1",
    badgeClass: "bg-slate-800/60 text-slate-300 border border-slate-700/60",
    description: "Compounds are produced in certified facilities respecting the European Union's Good Manufacturing Practice (GMP) Annex 1 guidelines for sterile medicinal and chemical compound manufacture.",
    details: [
      "Rigid ISO Class 5 cleanroom conditions using dynamic airflow systems",
      "Comprehensive bioburden and particulate monitoring",
      "Advanced terminal sterilization and aseptic lyophilization (freeze-drying)"
    ]
  },
  'annex_11': {
    title: "Annex 11 Electronic Records Security",
    iconType: 'shield',
    badgeLabel: "Annex 11",
    badgeClass: "bg-slate-800/60 text-slate-300 border border-slate-700/60",
    description: "Compliant with international regulatory frameworks for computerized systems in clinical research and life sciences.",
    details: [
      "Unmodifiable audit trails tracking batch releases and catalog changes",
      "High-grade encryption of sensitive investigator details and log inputs",
      "Role-based privilege configuration that keeps medical parameters completely pristine"
    ]
  },
  'gdp': {
    title: "Good Distribution Practice (GDP)",
    iconType: 'flask',
    badgeLabel: "GDP Standard",
    badgeClass: "bg-slate-800/60 text-slate-300 border border-slate-700/60",
    description: "Strict logistics framework protecting chemical composition and bio-potency during handling, containment, packing, and global distribution.",
    details: [
      "Insulated, light-sealed and highly protected packaging guards",
      "Strict tracking to prevent exposure to cross-contaminants or extreme climates",
      "Fully documented chain of custody from deep synthesis storage to dispatch delivery"
    ]
  }
};

interface CertificationModalProps {
  selectedCertKey: string | null;
  onClose: () => void;
}

export default function CertificationModal({ selectedCertKey, onClose }: CertificationModalProps) {
  return (
    <AnimatePresence>
      {selectedCertKey && CERTIFICATION_DETAILS[selectedCertKey] && (() => {
        const cert = CERTIFICATION_DETAILS[selectedCertKey];
        return (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="bg-[#0b1329] border border-slate-800 max-w-lg w-full p-5 sm:p-6 rounded-2xl text-left shadow-2xl relative overflow-hidden"
            >
              {/* Decorative gradients */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => { triggerHaptic('light'); onClose(); }}
                className="absolute top-4 right-4 p-1.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-slate-400 hover:text-slate-100 transition cursor-pointer"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Content Header */}
              <div className="flex items-start gap-3.5 mt-2">
                <div className="p-3 bg-cyan-500/10 rounded-2xl border border-cyan-500/25 shrink-0 text-cyan-400">
                  {cert.iconType === 'verified' && <BadgeCheck className="w-6 h-6 text-cyan-400" />}
                  {cert.iconType === 'check' && <CheckCircle className="w-6 h-6 text-emerald-400" />}
                  {cert.iconType === 'list' && <ClipboardList className="w-6 h-6 text-blue-400" />}
                  {cert.iconType === 'info' && <CheckCircle className="w-6 h-6 text-purple-400" />}
                  {cert.iconType === 'shield' && <BadgeCheck className="w-6 h-6 text-cyan-400" />}
                  {cert.iconType === 'alert' && <AlertTriangle className="w-6 h-6 text-amber-400" />}
                  {cert.iconType === 'flask' && <CheckCircle className="w-6 h-6 text-slate-300" />}
                </div>
                <div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest ${cert.badgeClass} block w-fit mb-1`}>
                    {cert.badgeLabel}
                  </span>
                  <h3 className="text-lg font-black tracking-tight text-white leading-tight">
                    {cert.title}
                  </h3>
                </div>
              </div>

              <div className="h-px bg-slate-800/80 my-4" />

              {/* Short Paragraph Description */}
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed text-left">
                {cert.description}
              </p>

              {/* Sub-framework points check */}
              <div className="mt-4 space-y-2.5">
                <h4 className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                  Key Standards & Verification
                </h4>
                <ul className="space-y-2 pl-0.5">
                  {cert.details.map((point, index) => (
                    <li key={index} className="flex items-start gap-2.5 text-xs text-slate-400 leading-relaxed text-left">
                      <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-1.5 shrink-0 block" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action button close */}
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => { triggerHaptic('light'); onClose(); }}
                  className="w-full sm:w-auto px-5 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-850 hover:border-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl cursor-pointer transition active:scale-98"
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        );
      })()}
    </AnimatePresence>
  );
}
