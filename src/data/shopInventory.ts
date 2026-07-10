import { ShopProduct } from '../lib/shopTypes';

// ─────────────────────────────────────────────────────────────────────────────
// Single-source catalog. One clean product per compound + strength (no source
// duplication). Strengths and per-kit supply costs come from the lab supply
// list; customer prices are the supply cost x markup, computed server-side —
// raw supply/kit prices are never shown to customers.
// ─────────────────────────────────────────────────────────────────────────────
export const SAMPLE_INVENTORY: ShopProduct[] = [
  {
    id: 'prod_semaglutide_5mg',
    name: "Semaglutide (5mg)",
    description: "Highly selective GLP-1 receptor agonist studied for satiety signaling, gastric motility, and glucose homeostasis pathways.",
    category: "Weight Loss",
    price: 7,
    inventory: 999
  },
  {
    id: 'prod_semaglutide_10mg',
    name: "Semaglutide (10mg)",
    description: "Highly selective GLP-1 receptor agonist studied for satiety signaling, gastric motility, and glucose homeostasis pathways.",
    category: "Weight Loss",
    price: 8,
    inventory: 999
  },
  {
    id: 'prod_semaglutide_15mg',
    name: "Semaglutide (15mg)",
    description: "Highly selective GLP-1 receptor agonist studied for satiety signaling, gastric motility, and glucose homeostasis pathways.",
    category: "Weight Loss",
    price: 10,
    inventory: 999
  },
  {
    id: 'prod_semaglutide_20mg',
    name: "Semaglutide (20mg)",
    description: "Highly selective GLP-1 receptor agonist studied for satiety signaling, gastric motility, and glucose homeostasis pathways.",
    category: "Weight Loss",
    price: 11,
    inventory: 999
  },
  {
    id: 'prod_semaglutide_30mg',
    name: "Semaglutide (30mg)",
    description: "Highly selective GLP-1 receptor agonist studied for satiety signaling, gastric motility, and glucose homeostasis pathways.",
    category: "Weight Loss",
    price: 13,
    inventory: 999
  },
  {
    id: 'prod_retatrutide_5mg',
    name: "Retatrutide (5mg)",
    description: "Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.",
    category: "Weight Loss",
    price: 9,
    inventory: 999
  },
  {
    id: 'prod_retatrutide_10mg',
    name: "Retatrutide (10mg)",
    description: "Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.",
    category: "Weight Loss",
    price: 13,
    inventory: 999
  },
  {
    id: 'prod_retatrutide_15mg',
    name: "Retatrutide (15mg)",
    description: "Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.",
    category: "Weight Loss",
    price: 17,
    inventory: 999
  },
  {
    id: 'prod_retatrutide_20mg',
    name: "Retatrutide (20mg)",
    description: "Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.",
    category: "Weight Loss",
    price: 20,
    inventory: 999
  },
  {
    id: 'prod_retatrutide_30mg',
    name: "Retatrutide (30mg)",
    description: "Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.",
    category: "Weight Loss",
    price: 27,
    inventory: 999
  },
  {
    id: 'prod_retatrutide_40mg',
    name: "Retatrutide (40mg)",
    description: "Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.",
    category: "Weight Loss",
    price: 34,
    inventory: 999
  },
  {
    id: 'prod_retatrutide_50mg',
    name: "Retatrutide (50mg)",
    description: "Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.",
    category: "Weight Loss",
    price: 40,
    inventory: 999
  },
  {
    id: 'prod_retatrutide_60mg',
    name: "Retatrutide (60mg)",
    description: "Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.",
    category: "Weight Loss",
    price: 47,
    inventory: 999
  },
  {
    id: 'prod_retatrutide_100mg',
    name: "Retatrutide (100mg)",
    description: "Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.",
    category: "Weight Loss",
    price: 67,
    inventory: 999
  },
  {
    id: 'prod_tirzepatide_5mg',
    name: "Tirzepatide (5mg)",
    description: "Dual GIP/GLP-1 receptor co-agonist investigated for metabolic homeostatic signaling pathways.",
    category: "Weight Loss",
    price: 8,
    inventory: 999
  },
  {
    id: 'prod_tirzepatide_10mg',
    name: "Tirzepatide (10mg)",
    description: "Dual GIP/GLP-1 receptor co-agonist investigated for metabolic homeostatic signaling pathways.",
    category: "Weight Loss",
    price: 9,
    inventory: 999
  },
  {
    id: 'prod_tirzepatide_15mg',
    name: "Tirzepatide (15mg)",
    description: "Dual GIP/GLP-1 receptor co-agonist investigated for metabolic homeostatic signaling pathways.",
    category: "Weight Loss",
    price: 11,
    inventory: 999
  },
  {
    id: 'prod_tirzepatide_20mg',
    name: "Tirzepatide (20mg)",
    description: "Dual GIP/GLP-1 receptor co-agonist investigated for metabolic homeostatic signaling pathways.",
    category: "Weight Loss",
    price: 13,
    inventory: 999
  },
  {
    id: 'prod_tirzepatide_30mg',
    name: "Tirzepatide (30mg)",
    description: "Dual GIP/GLP-1 receptor co-agonist investigated for metabolic homeostatic signaling pathways.",
    category: "Weight Loss",
    price: 17,
    inventory: 999
  },
  {
    id: 'prod_tirzepatide_40mg',
    name: "Tirzepatide (40mg)",
    description: "Dual GIP/GLP-1 receptor co-agonist investigated for metabolic homeostatic signaling pathways.",
    category: "Weight Loss",
    price: 20,
    inventory: 999
  },
  {
    id: 'prod_tirzepatide_50mg',
    name: "Tirzepatide (50mg)",
    description: "Dual GIP/GLP-1 receptor co-agonist investigated for metabolic homeostatic signaling pathways.",
    category: "Weight Loss",
    price: 25,
    inventory: 999
  },
  {
    id: 'prod_tirzepatide_60mg',
    name: "Tirzepatide (60mg)",
    description: "Dual GIP/GLP-1 receptor co-agonist investigated for metabolic homeostatic signaling pathways.",
    category: "Weight Loss",
    price: 28,
    inventory: 999
  },
  {
    id: 'prod_tirzepatide_80mg',
    name: "Tirzepatide (80mg)",
    description: "Dual GIP/GLP-1 receptor co-agonist investigated for metabolic homeostatic signaling pathways.",
    category: "Weight Loss",
    price: 43,
    inventory: 999
  },
  {
    id: 'prod_tirzepatide_100mg',
    name: "Tirzepatide (100mg)",
    description: "Dual GIP/GLP-1 receptor co-agonist investigated for metabolic homeostatic signaling pathways.",
    category: "Weight Loss",
    price: 47,
    inventory: 999
  },
  {
    id: 'prod_cagrilintide_5mg',
    name: "Cagrilintide (5mg)",
    description: "Long-acting amylin receptor agonist investigated for metabolic synergy alongside GLP-1 agonists.",
    category: "Weight Loss",
    price: 20,
    inventory: 999
  },
  {
    id: 'prod_cagrilintide_10mg',
    name: "Cagrilintide (10mg)",
    description: "Long-acting amylin receptor agonist investigated for metabolic synergy alongside GLP-1 agonists.",
    category: "Weight Loss",
    price: 30,
    inventory: 999
  },
  {
    id: 'prod_cagrilintide_20mg',
    name: "Cagrilintide (20mg)",
    description: "Long-acting amylin receptor agonist investigated for metabolic synergy alongside GLP-1 agonists.",
    category: "Weight Loss",
    price: 47,
    inventory: 999
  },
  {
    id: 'prod_survodutide_10mg',
    name: "Survodutide (10mg)",
    description: "Dual glucagon/GLP-1 receptor agonist studied for metabolic homeostasis and adipose reduction pathways.",
    category: "Weight Loss",
    price: 47,
    inventory: 999
  },
  {
    id: 'prod_mazdutide_15mg',
    name: "Mazdutide (15mg)",
    description: "GLP-1/glucagon dual receptor agonist studied for advanced metabolic research and adipose tissue reduction.",
    category: "Weight Loss",
    price: 51,
    inventory: 999
  },
  {
    id: 'prod_aod_9604_5mg',
    name: "AOD-9604 (5mg)",
    description: "Synthetic C-terminal fragment of hGH researched for selective lipid metabolism pathways.",
    category: "Weight Loss",
    price: 16,
    inventory: 999
  },
  {
    id: 'prod_aod_9604_10mg',
    name: "AOD-9604 (10mg)",
    description: "Synthetic C-terminal fragment of hGH researched for selective lipid metabolism pathways.",
    category: "Weight Loss",
    price: 28,
    inventory: 999
  },
  {
    id: 'prod_hgh_fragment_176_191_5mg',
    name: "HGH Fragment 176-191 (5mg)",
    description: "Stabilized growth-hormone fragment researched for adipose-selective lipolytic signaling.",
    category: "Weight Loss",
    price: 16,
    inventory: 999
  },
  {
    id: 'prod_cjc_1295_with_dac_2mg',
    name: "CJC-1295 With DAC (2mg)",
    description: "Long-acting GHRH analog with Drug Affinity Complex researched for sustained somatotrope pulse amplitude.",
    category: "Muscle Growth",
    price: 16,
    inventory: 999
  },
  {
    id: 'prod_cjc_1295_with_dac_5mg',
    name: "CJC-1295 With DAC (5mg)",
    description: "Long-acting GHRH analog with Drug Affinity Complex researched for sustained somatotrope pulse amplitude.",
    category: "Muscle Growth",
    price: 27,
    inventory: 999
  },
  {
    id: 'prod_cjc_1295_without_dac_5mg',
    name: "CJC-1295 Without DAC (5mg)",
    description: "GHRH analog peptide designed for rapid somatotrope signaling pathways.",
    category: "Muscle Growth",
    price: 14,
    inventory: 999
  },
  {
    id: 'prod_cjc_1295_without_dac_10mg',
    name: "CJC-1295 Without DAC (10mg)",
    description: "GHRH analog peptide designed for rapid somatotrope signaling pathways.",
    category: "Muscle Growth",
    price: 26,
    inventory: 999
  },
  {
    id: 'prod_cjc_1295_ipamorelin_10mg',
    name: "CJC-1295 / Ipamorelin (10mg)",
    description: "Synergistic GH-boosting stack pairing 5mg Ipamorelin with CJC-1295 (Without DAC) for recovery research.",
    category: "Muscle Growth",
    price: 18,
    inventory: 999
  },
  {
    id: 'prod_ipamorelin_5mg',
    name: "Ipamorelin (5mg)",
    description: "Selective GH secretagogue pentapeptide evaluated under clinical modeling.",
    category: "Muscle Growth",
    price: 9,
    inventory: 999
  },
  {
    id: 'prod_ipamorelin_10mg',
    name: "Ipamorelin (10mg)",
    description: "Selective GH secretagogue pentapeptide evaluated under clinical modeling.",
    category: "Muscle Growth",
    price: 13,
    inventory: 999
  },
  {
    id: 'prod_tesamorelin_5mg',
    name: "Tesamorelin (5mg)",
    description: "Potent GHRH analog researched for somatic growth factors, visceral mass, and peptide signaling.",
    category: "Muscle Growth",
    price: 16,
    inventory: 999
  },
  {
    id: 'prod_tesamorelin_10mg',
    name: "Tesamorelin (10mg)",
    description: "Potent GHRH analog researched for somatic growth factors, visceral mass, and peptide signaling.",
    category: "Muscle Growth",
    price: 28,
    inventory: 999
  },
  {
    id: 'prod_tesamorelin_15mg',
    name: "Tesamorelin (15mg)",
    description: "Potent GHRH analog researched for somatic growth factors, visceral mass, and peptide signaling.",
    category: "Muscle Growth",
    price: 41,
    inventory: 999
  },
  {
    id: 'prod_tesamorelin_20mg',
    name: "Tesamorelin (20mg)",
    description: "Potent GHRH analog researched for somatic growth factors, visceral mass, and peptide signaling.",
    category: "Muscle Growth",
    price: 55,
    inventory: 999
  },
  {
    id: 'prod_sermorelin_5mg',
    name: "Sermorelin (5mg)",
    description: "Synthetic GHRH analogue studied for natural GH secretion and somatotrope axis support.",
    category: "Muscle Growth",
    price: 12,
    inventory: 999
  },
  {
    id: 'prod_sermorelin_10mg',
    name: "Sermorelin (10mg)",
    description: "Synthetic GHRH analogue studied for natural GH secretion and somatotrope axis support.",
    category: "Muscle Growth",
    price: 22,
    inventory: 999
  },
  {
    id: 'prod_ghrp_2_5mg',
    name: "GHRP-2 (5mg)",
    description: "Growth hormone-releasing hexapeptide studied for GH pulse amplification and appetite signaling.",
    category: "Muscle Growth",
    price: 6,
    inventory: 999
  },
  {
    id: 'prod_ghrp_2_10mg',
    name: "GHRP-2 (10mg)",
    description: "Growth hormone-releasing hexapeptide studied for GH pulse amplification and appetite signaling.",
    category: "Muscle Growth",
    price: 9,
    inventory: 999
  },
  {
    id: 'prod_ghrp_6_5mg',
    name: "GHRP-6 (5mg)",
    description: "Growth hormone-releasing hexapeptide researched for GH secretion and ghrelin-receptor pathways.",
    category: "Muscle Growth",
    price: 6,
    inventory: 999
  },
  {
    id: 'prod_ghrp_6_10mg',
    name: "GHRP-6 (10mg)",
    description: "Growth hormone-releasing hexapeptide researched for GH secretion and ghrelin-receptor pathways.",
    category: "Muscle Growth",
    price: 9,
    inventory: 999
  },
  {
    id: 'prod_mots_c_5mg',
    name: "MOTS-C (5mg)",
    description: "Mitochondrial-derived peptide researched for metabolic optimization, energy pathways, and exercise modeling.",
    category: "Muscle Growth",
    price: 9,
    inventory: 999
  },
  {
    id: 'prod_mots_c_10mg',
    name: "MOTS-C (10mg)",
    description: "Mitochondrial-derived peptide researched for metabolic optimization, energy pathways, and exercise modeling.",
    category: "Muscle Growth",
    price: 11,
    inventory: 999
  },
  {
    id: 'prod_mots_c_20mg',
    name: "MOTS-C (20mg)",
    description: "Mitochondrial-derived peptide researched for metabolic optimization, energy pathways, and exercise modeling.",
    category: "Muscle Growth",
    price: 24,
    inventory: 999
  },
  {
    id: 'prod_mots_c_40mg',
    name: "MOTS-C (40mg)",
    description: "Mitochondrial-derived peptide researched for metabolic optimization, energy pathways, and exercise modeling.",
    category: "Muscle Growth",
    price: 32,
    inventory: 999
  },
  {
    id: 'prod_igf_1_lr3_0_1mg',
    name: "IGF-1 LR3 (0.1mg)",
    description: "Long-chain IGF-1 analogue researched for anabolic signaling, hypertrophy, and satellite cell activation.",
    category: "Muscle Growth",
    price: 9,
    inventory: 999
  },
  {
    id: 'prod_igf_1_lr3_1mg',
    name: "IGF-1 LR3 (1mg)",
    description: "Long-chain IGF-1 analogue researched for anabolic signaling, hypertrophy, and satellite cell activation.",
    category: "Muscle Growth",
    price: 34,
    inventory: 999
  },
  {
    id: 'prod_bpc_157_5mg',
    name: "BPC-157 (5mg)",
    description: "Pentadecapeptide investigated for tissue remodeling, gastric protection, tendon, and vascular recovery.",
    category: "Healing & Repair",
    price: 8,
    inventory: 999
  },
  {
    id: 'prod_bpc_157_10mg',
    name: "BPC-157 (10mg)",
    description: "Pentadecapeptide investigated for tissue remodeling, gastric protection, tendon, and vascular recovery.",
    category: "Healing & Repair",
    price: 11,
    inventory: 999
  },
  {
    id: 'prod_bpc_157_20mg',
    name: "BPC-157 (20mg)",
    description: "Pentadecapeptide investigated for tissue remodeling, gastric protection, tendon, and vascular recovery.",
    category: "Healing & Repair",
    price: 18,
    inventory: 999
  },
  {
    id: 'prod_tb_500_5mg',
    name: "TB-500 (5mg)",
    description: "Thymosin Beta-4 synthetic active sequence researched for cellular migration and wound resolution.",
    category: "Healing & Repair",
    price: 14,
    inventory: 999
  },
  {
    id: 'prod_tb_500_10mg',
    name: "TB-500 (10mg)",
    description: "Thymosin Beta-4 synthetic active sequence researched for cellular migration and wound resolution.",
    category: "Healing & Repair",
    price: 25,
    inventory: 999
  },
  {
    id: 'prod_bpc_157_tb_500_blend_10mg',
    name: "BPC-157 / TB-500 Blend (10mg)",
    description: "Pre-formulated synergy vial pairing BPC-157 and TB-500 for cellular and tendon research models.",
    category: "Healing & Repair",
    price: 18,
    inventory: 999
  },
  {
    id: 'prod_bpc_157_tb_500_blend_20mg',
    name: "BPC-157 / TB-500 Blend (20mg)",
    description: "Pre-formulated synergy vial pairing BPC-157 and TB-500 for cellular and tendon research models.",
    category: "Healing & Repair",
    price: 30,
    inventory: 999
  },
  {
    id: 'prod_kpv_10mg',
    name: "KPV (10mg)",
    description: "Tripeptide fragment of alpha-MSH researched for NF-kB modulation and gastrointestinal soothing.",
    category: "Immune & Health",
    price: 11,
    inventory: 999
  },
  {
    id: 'prod_kpv_30mg',
    name: "KPV (30mg)",
    description: "Tripeptide fragment of alpha-MSH researched for NF-kB modulation and gastrointestinal soothing.",
    category: "Immune & Health",
    price: 21,
    inventory: 999
  },
  {
    id: 'prod_ll_37_5mg',
    name: "LL-37 (5mg)",
    description: "Cathelicidin-derived antimicrobial peptide researched for innate immune and tissue-defense pathways.",
    category: "Immune & Health",
    price: 18,
    inventory: 999
  },
  {
    id: 'prod_ara_290_10mg',
    name: "ARA-290 (10mg)",
    description: "Erythropoietin-derived peptide researched for tissue protection and neuropathic pathway modulation.",
    category: "Immune & Health",
    price: 13,
    inventory: 999
  },
  {
    id: 'prod_thymosin_alpha_1_5mg',
    name: "Thymosin Alpha-1 (5mg)",
    description: "Thymic peptide studied for selective T-cell, cytotoxic, and helper activation.",
    category: "Immune & Health",
    price: 14,
    inventory: 999
  },
  {
    id: 'prod_thymosin_alpha_1_10mg',
    name: "Thymosin Alpha-1 (10mg)",
    description: "Thymic peptide studied for selective T-cell, cytotoxic, and helper activation.",
    category: "Immune & Health",
    price: 25,
    inventory: 999
  },
  {
    id: 'prod_thymalin_10mg',
    name: "Thymalin (10mg)",
    description: "Thymic polypeptide complex researched for immune balance and T-cell regulatory signaling.",
    category: "Immune & Health",
    price: 11,
    inventory: 999
  },
  {
    id: 'prod_klow_80mg',
    name: "Klow (80mg)",
    description: "Exclusive beauty and skin-radiance regulatory peptide engineered to research dermis remodeling targets.",
    category: "Beauty & Radiance",
    price: 36,
    inventory: 999
  },
  {
    id: 'prod_glow_70mg',
    name: "Glow (70mg)",
    description: "Advanced beauty peptide blend researched for skin radiance, dermis remodeling, and anti-aging pathways.",
    category: "Beauty & Radiance",
    price: 31,
    inventory: 999
  },
  {
    id: 'prod_ghk_cu_50mg',
    name: "GHK-Cu (50mg)",
    description: "Pure copper tripeptide studied for collagen stimulation, hair follicle integrity, and matrix remodeling.",
    category: "Beauty & Radiance",
    price: 7,
    inventory: 999
  },
  {
    id: 'prod_ghk_cu_100mg',
    name: "GHK-Cu (100mg)",
    description: "Pure copper tripeptide studied for collagen stimulation, hair follicle integrity, and matrix remodeling.",
    category: "Beauty & Radiance",
    price: 8,
    inventory: 999
  },
  {
    id: 'prod_ahk_cu_50mg',
    name: "AHK-Cu (50mg)",
    description: "Copper tripeptide researched for hair-follicle stimulation, vascularization, and dermal renewal.",
    category: "Beauty & Radiance",
    price: 12,
    inventory: 999
  },
  {
    id: 'prod_ahk_cu_100mg',
    name: "AHK-Cu (100mg)",
    description: "Copper tripeptide researched for hair-follicle stimulation, vascularization, and dermal renewal.",
    category: "Beauty & Radiance",
    price: 18,
    inventory: 999
  },
  {
    id: 'prod_melanotan_i_10mg',
    name: "Melanotan I (10mg)",
    description: "Alpha-MSH analog investigated for melanocyte stimulation and photoprotective pigmentation pathways.",
    category: "Beauty & Radiance",
    price: 10,
    inventory: 999
  },
  {
    id: 'prod_melanotan_ii_10mg',
    name: "Melanotan II (10mg)",
    description: "Alpha-MSH receptor agonist investigated for skin pigment adaptation and photoprotective modeling.",
    category: "Beauty & Radiance",
    price: 10,
    inventory: 999
  },
  {
    id: 'prod_snap_8_10mg',
    name: "SNAP-8 (10mg)",
    description: "Octapeptide researched for expression-line reduction and dermal smoothing applications.",
    category: "Beauty & Radiance",
    price: 8,
    inventory: 999
  },
  {
    id: 'prod_snap_8_20mg',
    name: "SNAP-8 (20mg)",
    description: "Octapeptide researched for expression-line reduction and dermal smoothing applications.",
    category: "Beauty & Radiance",
    price: 13,
    inventory: 999
  },
  {
    id: 'prod_pt_141_10mg',
    name: "PT-141 (10mg)",
    description: "Bremelanotide melanocortin receptor agonist studied for arousal and autonomic vascular regulation.",
    category: "Sexual Health",
    price: 10,
    inventory: 999
  },
  {
    id: 'prod_kisspeptin_10_5mg',
    name: "Kisspeptin-10 (5mg)",
    description: "Hypothalamic peptide researched for GnRH signaling and reproductive-axis modulation.",
    category: "Sexual Health",
    price: 10,
    inventory: 999
  },
  {
    id: 'prod_kisspeptin_10_10mg',
    name: "Kisspeptin-10 (10mg)",
    description: "Hypothalamic peptide researched for GnRH signaling and reproductive-axis modulation.",
    category: "Sexual Health",
    price: 14,
    inventory: 999
  },
  {
    id: 'prod_oxytocin_acetate_5mg',
    name: "Oxytocin Acetate (5mg)",
    description: "Neuropeptide researched for social bonding, mood, and smooth-muscle signaling pathways.",
    category: "Sexual Health",
    price: 12,
    inventory: 999
  },
  {
    id: 'prod_oxytocin_acetate_10mg',
    name: "Oxytocin Acetate (10mg)",
    description: "Neuropeptide researched for social bonding, mood, and smooth-muscle signaling pathways.",
    category: "Sexual Health",
    price: 16,
    inventory: 999
  },
  {
    id: 'prod_hcg_5000iu',
    name: "HCG (5000IU)",
    description: "Human chorionic gonadotropin researched for gonadal-axis support and endogenous hormone signaling.",
    category: "Sexual Health",
    price: 15,
    inventory: 999
  },
  {
    id: 'prod_hcg_10000iu',
    name: "HCG (10000IU)",
    description: "Human chorionic gonadotropin researched for gonadal-axis support and endogenous hormone signaling.",
    category: "Sexual Health",
    price: 28,
    inventory: 999
  },
  {
    id: 'prod_vip_10mg',
    name: "VIP (10mg)",
    description: "Vasoactive intestinal peptide researched for vasodilatory, anti-inflammatory, and autonomic pathways.",
    category: "Sexual Health",
    price: 24,
    inventory: 999
  },
  {
    id: 'prod_semax_5mg',
    name: "Semax (5mg)",
    description: "Upregulates BDNF and NGF; studied for executive cognitive signaling and focus.",
    category: "Cognitive & Focus",
    price: 8,
    inventory: 999
  },
  {
    id: 'prod_semax_10mg',
    name: "Semax (10mg)",
    description: "Upregulates BDNF and NGF; studied for executive cognitive signaling and focus.",
    category: "Cognitive & Focus",
    price: 10,
    inventory: 999
  },
  {
    id: 'prod_semax_30mg',
    name: "Semax (30mg)",
    description: "Upregulates BDNF and NGF; studied for executive cognitive signaling and focus.",
    category: "Cognitive & Focus",
    price: 26,
    inventory: 999
  },
  {
    id: 'prod_selank_5mg',
    name: "Selank (5mg)",
    description: "Synthetic tuftsin neuroregulatory peptide studied for GABAergic stabilization and focus.",
    category: "Cognitive & Focus",
    price: 8,
    inventory: 999
  },
  {
    id: 'prod_selank_10mg',
    name: "Selank (10mg)",
    description: "Synthetic tuftsin neuroregulatory peptide studied for GABAergic stabilization and focus.",
    category: "Cognitive & Focus",
    price: 10,
    inventory: 999
  },
  {
    id: 'prod_epithalon_10mg',
    name: "Epithalon (10mg)",
    description: "Pineal-gland tetrapeptide researched for telomerase enzyme signaling and longevity pathways.",
    category: "Longevity & Cellular",
    price: 10,
    inventory: 999
  },
  {
    id: 'prod_epithalon_50mg',
    name: "Epithalon (50mg)",
    description: "Pineal-gland tetrapeptide researched for telomerase enzyme signaling and longevity pathways.",
    category: "Longevity & Cellular",
    price: 26,
    inventory: 999
  },
  {
    id: 'prod_ss_31_10mg',
    name: "SS-31 (10mg)",
    description: "Mitochondria-targeting tetrapeptide researched for cardiolipin integrity, ROS mitigation, and ATP balance.",
    category: "Longevity & Cellular",
    price: 15,
    inventory: 999
  },
  {
    id: 'prod_ss_31_50mg',
    name: "SS-31 (50mg)",
    description: "Mitochondria-targeting tetrapeptide researched for cardiolipin integrity, ROS mitigation, and ATP balance.",
    category: "Longevity & Cellular",
    price: 47,
    inventory: 999
  },
  {
    id: 'prod_5_amino_1mq_5mg',
    name: "5-Amino-1MQ (5mg)",
    description: "NNMT inhibitor researched for metabolic activation, adipocyte shrinkage, and cellular energy expenditure.",
    category: "Longevity & Cellular",
    price: 8,
    inventory: 999
  },
  {
    id: 'prod_5_amino_1mq_10mg',
    name: "5-Amino-1MQ (10mg)",
    description: "NNMT inhibitor researched for metabolic activation, adipocyte shrinkage, and cellular energy expenditure.",
    category: "Longevity & Cellular",
    price: 12,
    inventory: 999
  },
  {
    id: 'prod_5_amino_1mq_50mg',
    name: "5-Amino-1MQ (50mg)",
    description: "NNMT inhibitor researched for metabolic activation, adipocyte shrinkage, and cellular energy expenditure.",
    category: "Longevity & Cellular",
    price: 18,
    inventory: 999
  },
  {
    id: 'prod_nad_500mg',
    name: "NAD+ (500mg)",
    description: "Nicotinamide Adenine Dinucleotide studied for sirtuin signaling and cellular energy charging.",
    category: "Longevity & Cellular",
    price: 11,
    inventory: 999
  },
  {
    id: 'prod_nad_1000mg',
    name: "NAD+ (1000mg)",
    description: "Nicotinamide Adenine Dinucleotide studied for sirtuin signaling and cellular energy charging.",
    category: "Longevity & Cellular",
    price: 18,
    inventory: 999
  },
  {
    id: 'prod_humanin_10mg',
    name: "Humanin (10mg)",
    description: "Mitochondrial-derived peptide researched for cytoprotection and metabolic-stress resilience.",
    category: "Longevity & Cellular",
    price: 51,
    inventory: 999
  },
  {
    id: 'prod_foxo4_dri_10mg',
    name: "FOXO4-DRI (10mg)",
    description: "FOXO4-p53 interaction peptide researched as a senolytic for clearing senescent-cell pathways.",
    category: "Longevity & Cellular",
    price: 63,
    inventory: 999
  },
  {
    id: 'prod_dsip_5mg',
    name: "DSIP (5mg)",
    description: "Delta Sleep-Inducing Peptide studied for slow-wave delta rhythms and biorhythm adjustment.",
    category: "Sleep & Recovery",
    price: 8,
    inventory: 999
  },
  {
    id: 'prod_dsip_10mg',
    name: "DSIP (10mg)",
    description: "Delta Sleep-Inducing Peptide studied for slow-wave delta rhythms and biorhythm adjustment.",
    category: "Sleep & Recovery",
    price: 14,
    inventory: 999
  },
  {
    id: 'prod_bac_water_10ml',
    name: "BAC Water (10ml)",
    description: "Benzyl-alcohol-preserved sterile solvent standard for reconstitution of research peptides.",
    category: "Reconstitution Solvents",
    price: 22,
    inventory: 999
  },
  {
    id: 'prod_retat_usa_10mg',
    name: "Retatrutide US Warehouse (10mg)",
    description: "Triple GIP/GLP-1/glucagon receptor agonist. Ships from our domestic fulfillment warehouse — same-week dispatch with no international transit delays.",
    category: "USA Fast Ship",
    price: 18,
    inventory: 999
  },
  {
    id: 'prod_retat_usa_20mg',
    name: "Retatrutide US Warehouse (20mg)",
    description: "Triple GIP/GLP-1/glucagon receptor agonist. Ships from our domestic fulfillment warehouse — same-week dispatch with no international transit delays.",
    category: "USA Fast Ship",
    price: 28,
    inventory: 999
  },
  {
    id: 'prod_retat_usa_30mg',
    name: "Retatrutide US Warehouse (30mg)",
    description: "Triple GIP/GLP-1/glucagon receptor agonist. Ships from our domestic fulfillment warehouse — same-week dispatch with no international transit delays.",
    category: "USA Fast Ship",
    price: 35,
    inventory: 999
  }
];
