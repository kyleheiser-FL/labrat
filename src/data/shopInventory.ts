import { ShopProduct } from '../lib/shopTypes';

export const SAMPLE_INVENTORY: ShopProduct[] = [
  // --- MUSCLE GROWTH ---
  {
    id: 'prod_cjc_ipam_10mg',
    name: 'CJC-1295 (Without DAC) + Ipamorelin (10mg)',
    description: 'A synergistic GH-boosting stack designed to maximize muscle growth, recovery, and anti-aging benefits through natural hormone support.',
    category: 'Muscle Growth',
    price: 104,
    inventory: 20
  },
  {
    id: 'prod_cjc_ipam_20mg',
    name: 'CJC-1295 (Without DAC) + Ipamorelin (20mg)',
    description: 'A synergistic GH-boosting stack designed to maximize muscle growth, recovery, and anti-aging benefits through natural hormone support.',
    category: 'Muscle Growth',
    price: 155,
    inventory: 0
  },
  {
    id: 'prod_cjc_nodac_10mg',
    name: 'CJC-1295 Without DAC (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Tetrasubstituted peptide GHRH analog designed for rapid somatotrope signaling pathways.',
    category: 'Muscle Growth',
    price: 60,
    inventory: 0
  },
  {
    id: 'prod_cjc_nodac_20mg',
    name: 'CJC-1295 Without DAC (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Tetrasubstituted peptide GHRH analog designed for rapid somatotrope signaling pathways.',
    category: 'Muscle Growth',
    price: 92,
    inventory: 0
  },
  {
    id: 'prod_ipam_10mg',
    name: 'Ipamorelin (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Selective GH secretagogue pentapeptide evaluated under clinical modeling.',
    category: 'Muscle Growth',
    price: 66,
    inventory: 0
  },
  {
    id: 'prod_ipam_20mg',
    name: 'Ipamorelin (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Selective GH secretagogue pentapeptide evaluated under clinical modeling.',
    category: 'Muscle Growth',
    price: 102,
    inventory: 0
  },
  {
    id: 'prod_tesa_10mg',
    name: 'Tesamorelin (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Potent GHRH analog researched for somatic growth factors, visceral mass, and peptide signaling.',
    category: 'Muscle Growth',
    price: 77,
    inventory: 0
  },
  {
    id: 'prod_tesa_20mg',
    name: 'Tesamorelin (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Potent GHRH analog researched for somatic growth factors, visceral mass, and peptide signaling.',
    category: 'Muscle Growth',
    price: 117,
    inventory: 0
  },
  {
    id: 'prod_mots_c_10mg',
    name: 'MOTS-C (10mg)',
    description: 'Mitochondrial-derived peptide researched for metabolic optimization, muscle growth energy pathways, cellular vitality, and premium exercise modeling. Supplied in a professional 10 vials/kit box.',
    category: 'Muscle Growth',
    price: 84,
    inventory: 20
  },

  // --- WEIGHT LOSS ---
  {
    id: 'prod_retat_5mg',
    name: 'Retatrutide (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 77,
    inventory: 0
  },
  {
    id: 'prod_retat_10mg',
    name: 'Retatrutide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 117,
    inventory: 10
  },
  {
    id: 'prod_retat_20mg',
    name: 'Retatrutide (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 156,
    inventory: 20
  },
  {
    id: 'prod_retat_30mg',
    name: 'Retatrutide (30mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 197,
    inventory: 0
  },
  {
    id: 'prod_retat_50mg',
    name: 'Retatrutide (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 270,
    inventory: 0
  },
  {
    id: 'prod_retat_60mg',
    name: 'Retatrutide (60mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 309,
    inventory: 0
  },
  {
    id: 'prod_retat_100mg',
    name: 'Retatrutide (100mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 392,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_tirz_10mg',
    name: 'Tirzepatide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 73,
    inventory: 0
  },
  {
    id: 'prod_tirz_15mg',
    name: 'Tirzepatide (15mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 97,
    inventory: 0
  },
  {
    id: 'prod_tirz_20mg',
    name: 'Tirzepatide (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 117,
    inventory: 0
  },
  {
    id: 'prod_tirz_30mg',
    name: 'Tirzepatide (30mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 156,
    inventory: 0
  },
  {
    id: 'prod_tirz_50mg',
    name: 'Tirzepatide (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 196,
    inventory: 0
  },
  {
    id: 'prod_tirz_60mg',
    name: 'Tirzepatide (60mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 235,
    inventory: 0
  },
  {
    id: 'prod_tirz_100mg',
    name: 'Tirzepatide (100mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 337,
    inventory: 0
  },
  {
    id: 'prod_sema_5mg',
    name: 'Semaglutide (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 50,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_sema_10mg',
    name: 'Semaglutide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 73,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_sema_20mg',
    name: 'Semaglutide (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 109,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_sema_30mg',
    name: 'Semaglutide (30mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 144,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_sema_50mg',
    name: 'Semaglutide (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 191,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_sema_60mg',
    name: 'Semaglutide (60mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 219,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_cagri_5mg',
    name: 'Cagrilintide (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Long-acting amylin receptor agonist investigated for metabolic path synergy when co-analyzed with GLP-1 agonists.',
    category: 'Weight Loss',
    price: 58,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_cagri_10mg',
    name: 'Cagrilintide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Long-acting amylin receptor agonist investigated for metabolic path synergy when co-analyzed with GLP-1 agonists.',
    category: 'Weight Loss',
    price: 77,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_cagri_20mg',
    name: 'Cagrilintide (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Long-acting amylin receptor agonist investigated for metabolic path synergy when co-analyzed with GLP-1 agonists.',
    category: 'Weight Loss',
    price: 117,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_aod_5mg',
    name: 'AOD-9604 (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. High-quality synthetic C-terminal fragment of human growth hormone researched for selective lipid metabolism pathways.',
    category: 'Weight Loss',
    price: 55,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_aod_10mg',
    name: 'AOD-9604 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. High-quality synthetic C-terminal fragment of human growth hormone researched for selective lipid metabolism pathways.',
    category: 'Weight Loss',
    price: 75,
    inventory: 0,
    sourceRestriction: 'norway'
  },

  // --- HEALING & REPAIR ---
  {
    id: 'prod_bpc_5mg',
    name: 'BPC-157 (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pentadecapeptide investigated for tissue remodeling, gastric protection, tendon, and vascular recovery pathways.',
    category: 'Healing & Repair',
    price: 50,
    inventory: 0
  },
  {
    id: 'prod_bpc_10mg',
    name: 'BPC-157 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pentadecapeptide investigated for tissue remodeling, gastric protection, tendon, and vascular recovery pathways.',
    category: 'Healing & Repair',
    price: 69,
    inventory: 0
  },
  {
    id: 'prod_bpc_20mg',
    name: 'BPC-157 (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pentadecapeptide investigated for tissue remodeling, gastric protection, tendon, and vascular recovery pathways.',
    category: 'Healing & Repair',
    price: 104,
    inventory: 0
  },
  {
    id: 'prod_tb_5mg',
    name: 'TB-500 (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Thymosin Beta-4 synthetic active sequence researched for cellular migration, actin regulation, and wound resolution.',
    category: 'Healing & Repair',
    price: 53,
    inventory: 0
  },
  {
    id: 'prod_tb_10mg',
    name: 'TB-500 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Thymosin Beta-4 synthetic active sequence researched for cellular migration, actin regulation, and wound resolution.',
    category: 'Healing & Repair',
    price: 75,
    inventory: 0
  },
  {
    id: 'prod_tb_20mg',
    name: 'TB-500 (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Thymosin Beta-4 synthetic active sequence researched for cellular migration, actin regulation, and wound resolution.',
    category: 'Healing & Repair',
    price: 112,
    inventory: 0
  },
  {
    id: 'prod_bpc_tb_blend_10mg',
    name: 'BPC-157 / TB-500 Blend (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pre-formulated synergy vial containing 5mg BPC-157 and 5mg TB-500 for cellular and tendon research models.',
    category: 'Healing & Repair',
    price: 73,
    inventory: 0
  },

  // --- BEAUTY & RADIANCE ---
  {
    id: 'prod_klow_80mg',
    name: 'Klow (80mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied as an exclusive beauty and skin radiance regulatory peptide engineered in premium 80mg kits to research dermis remodeling targets.',
    category: 'Beauty & Radiance',
    price: 124,
    inventory: 20,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_ghk_20mg',
    name: 'GHK-Cu (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pure copper tripeptide studied for collagen stimulation, hair follicle integrity, and extracellular matrix remodeling.',
    category: 'Beauty & Radiance',
    price: 61,
    inventory: 0
  },
  {
    id: 'prod_ghk_50mg',
    name: 'GHK-Cu (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pure copper tripeptide studied for collagen stimulation, hair follicle integrity, and extracellular matrix remodeling.',
    category: 'Beauty & Radiance',
    price: 101,
    inventory: 0
  },
  {
    id: 'prod_ghk_100mg',
    name: 'GHK-Cu (100mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pure copper tripeptide studied for collagen stimulation, hair follicle integrity, and extracellular matrix remodeling.',
    category: 'Beauty & Radiance',
    price: 152,
    inventory: 0
  },
  {
    id: 'prod_mt2_10mg',
    name: 'Melanotan II (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Strong alpha-MSH receptor agonist investigated for skin pigment adaptation patterns and photoprotective modeling.',
    category: 'Beauty & Radiance',
    price: 45,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_mt2_20mg',
    name: 'Melanotan II (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Strong alpha-MSH receptor agonist investigated for skin pigment adaptation patterns and photoprotective modeling.',
    category: 'Beauty & Radiance',
    price: 69,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_pt141_10mg',
    name: 'PT-141 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Bremelanotide synthetic candidate studied for melanocortin receptor activation pathways and autonomic vascular regulation.',
    category: 'Beauty & Radiance',
    price: 50,
    inventory: 10,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_pt141_20mg',
    name: 'PT-141 (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Bremelanotide synthetic candidate studied for melanocortin receptor activation pathways and autonomic vascular regulation.',
    category: 'Beauty & Radiance',
    price: 73,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_nad_500mg',
    name: 'NAD+ (500mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pure Nicotinamide Adenine Dinucleotide studied for sirtuin path signaling, cell energy charging, and biochemical integrity.',
    category: 'Beauty & Radiance',
    price: 79,
    inventory: 10
  },
  {
    id: 'prod_nad_1000mg',
    name: 'NAD+ (1000mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Supplied in a professional 10 vials/kit box. Pure Nicotinamide Adenine Dinucleotide studied for sirtuin path signaling, cell energy charging, and biochemical integrity.',
    category: 'Beauty & Radiance',
    price: 128,
    inventory: 0
  },

  // --- COGNITIVE & FOCUS ---
  {
    id: 'prod_semax_selank_blend_20mg',
    name: 'Neuro-Focus Semax + Selank (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Synergy duo blend pairing Semax with Selank. Studied for memory executive speeds and anxiety resistance pathways.',
    category: 'Cognitive & Focus',
    price: 95,
    inventory: 0
  },
  {
    id: 'prod_semax_10mg',
    name: 'Semax (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Upregulates Brain-Derived Neurotrophic Factor (BDNF) and NGF. Studied for executive cognitive signaling.',
    category: 'Cognitive & Focus',
    price: 62,
    inventory: 0
  },
  {
    id: 'prod_selank_10mg',
    name: 'Selank (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Synthetic tuftsin neuroregulatory peptide. Studied for GABAergic stabilization and focused analytical performance.',
    category: 'Cognitive & Focus',
    price: 59,
    inventory: 0
  },

  // --- LONGEVITY & CELLULAR ---
  {
    id: 'prod_epitalon_10mg',
    name: 'Epitalon (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Pineal gland hormone secretagogue regulator tetrapeptide researched for telomerase enzyme signaling pathways.',
    category: 'Longevity & Cellular',
    price: 58,
    inventory: 0
  },
  {
    id: 'prod_epitalon_50mg',
    name: 'Epitalon (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Pineal gland secretagogue regulator tetrapeptide studied in higher-concentration telomere lengthening research models.',
    category: 'Longevity & Cellular',
    price: 120,
    inventory: 0
  },
  {
    id: 'prod_ss31_10mg',
    name: 'SS-31 (Elamipretide) (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Mitochondria-targeting tetrapeptide researched for cardiolipin integrity, ROS mitigation, and energetic ATP balance.',
    category: 'Longevity & Cellular',
    price: 89,
    inventory: 0
  },

  // --- IMMUNE & HEALTH ---
  {
    id: 'prod_ta1_10mg',
    name: 'Thymosin Alpha-1 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Active sequence mature phenolic thymic peptide studied for selective T-cell, cytotoxic, and helper activation.',
    category: 'Immune & Health',
    price: 65,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_kpv_10mg',
    name: 'KPV Peptide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Tripeptide fragment of alpha-MSH, researched for cell-specific NF-kB metabolic block and gastrointestinal soothing.',
    category: 'Immune & Health',
    price: 48,
    inventory: 0,
    sourceRestriction: 'norway'
  },

  // --- SLEEP & RECOVERY ---
  {
    id: 'prod_dsip_10mg',
    name: 'DSIP (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Delta Sleep-Inducing Peptide. Pure somnotropic peptide studied for slow-wave delta rhythms and biorhythm adjustment.',
    category: 'Sleep & Recovery',
    price: 54,
    inventory: 0,
    sourceRestriction: 'norway'
  },

  // --- RECONSTITUTION SOLVENTS ---
  {
    id: 'prod_bac_water_30ml',
    name: 'BAC Water (30ml)',
    description: 'Reconstitution Solvent grade. Benzyl alcohol preserved. Engineered sterile solvent standard required for scientific reconstitution of delicate peptide research compounds.',
    category: 'Reconstitution Solvents',
    price: 18,
    inventory: 0
  }
];
