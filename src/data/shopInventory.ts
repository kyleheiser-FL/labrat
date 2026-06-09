import { ShopProduct } from '../lib/shopTypes';

export const SAMPLE_INVENTORY: ShopProduct[] = [

  // ─── MUSCLE GROWTH ────────────────────────────────────────────────────────

  // CJC-1295 + Ipamorelin — Norway: 10mg | China: 10mg, 20mg
  {
    id: 'prod_cjc_ipam_10mg',
    name: 'CJC-1295 (Without DAC) + Ipamorelin (10mg)',
    description: 'A synergistic GH-boosting stack designed to maximize muscle growth, recovery, and anti-aging benefits through natural hormone support.',
    category: 'Muscle Growth',
    price: 104,
    inventory: 20,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_cjc_ipam_china_10mg',
    name: 'CJC-1295 / Ipamorelin China (10mg)',
    description: 'Synergistic GH-boosting peptide stack. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Muscle Growth',
    price: 17,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_cjc_ipam_china_20mg',
    name: 'CJC-1295 / Ipamorelin China (20mg)',
    description: 'Synergistic GH-boosting peptide stack. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Muscle Growth',
    price: 33,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // CJC-1295 Without DAC — Norway: 5mg, 10mg | China: 10mg
  {
    id: 'prod_cjc_nodac_5mg',
    name: 'CJC-1295 Without DAC (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Tetrasubstituted peptide GHRH analog designed for rapid somatotrope signaling pathways.',
    category: 'Muscle Growth',
    price: 50,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_cjc_nodac_10mg',
    name: 'CJC-1295 Without DAC (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Tetrasubstituted peptide GHRH analog designed for rapid somatotrope signaling pathways.',
    category: 'Muscle Growth',
    price: 60,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_cjc_nodac_china_10mg',
    name: 'CJC-1295 Without DAC China (10mg)',
    description: 'GHRH analog peptide. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Muscle Growth',
    price: 25,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // Ipamorelin — Norway: 10mg | China: 10mg, 20mg
  {
    id: 'prod_ipam_10mg',
    name: 'Ipamorelin (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Selective GH secretagogue pentapeptide evaluated under clinical modeling.',
    category: 'Muscle Growth',
    price: 66,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_ipam_china_10mg',
    name: 'Ipamorelin China (10mg)',
    description: 'Selective GH secretagogue pentapeptide. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Muscle Growth',
    price: 13,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_ipam_china_20mg',
    name: 'Ipamorelin China (20mg)',
    description: 'Selective GH secretagogue pentapeptide. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Muscle Growth',
    price: 26,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // Tesamorelin — Norway: 5mg, 10mg | China: 5mg
  {
    id: 'prod_tesa_5mg',
    name: 'Tesamorelin (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Potent GHRH analog researched for somatic growth factors, visceral mass, and peptide signaling.',
    category: 'Muscle Growth',
    price: 77,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_tesa_10mg',
    name: 'Tesamorelin (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Potent GHRH analog researched for somatic growth factors, visceral mass, and peptide signaling.',
    category: 'Muscle Growth',
    price: 100,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_tesa_china_5mg',
    name: 'Tesamorelin China (5mg)',
    description: 'GHRH analog peptide. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Muscle Growth',
    price: 16,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // Sermorelin — Norway only: 5mg, 10mg
  {
    id: 'prod_sermorelin_5mg',
    name: 'Sermorelin (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Synthetic GHRH analogue studied for natural GH secretion stimulation and somatotrope axis support.',
    category: 'Muscle Growth',
    price: 55,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_sermorelin_10mg',
    name: 'Sermorelin (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Synthetic GHRH analogue studied for natural GH secretion stimulation and somatotrope axis support.',
    category: 'Muscle Growth',
    price: 77,
    inventory: 0,
    sourceRestriction: 'norway'
  },

  // MOTS-C — Norway: 10mg, 40mg | China: 5mg, 10mg
  {
    id: 'prod_mots_c_10mg',
    name: 'MOTS-C (10mg)',
    description: 'Mitochondrial-derived peptide researched for metabolic optimization, muscle growth energy pathways, cellular vitality, and premium exercise modeling.',
    category: 'Muscle Growth',
    price: 84,
    inventory: 20,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_mots_c_40mg',
    name: 'MOTS-C (40mg)',
    description: 'Mitochondrial-derived peptide researched for metabolic optimization, muscle growth energy pathways, cellular vitality, and premium exercise modeling.',
    category: 'Muscle Growth',
    price: 185,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_mots_c_china_5mg',
    name: 'MOTS-C China (5mg)',
    description: 'Mitochondrial-derived peptide for metabolic optimization and exercise performance. Sourced from certified China laboratories. Ships internationally.',
    category: 'Muscle Growth',
    price: 10,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_mots_c_china_10mg',
    name: 'MOTS-C China (10mg)',
    description: 'Mitochondrial-derived peptide for metabolic optimization and exercise performance. Sourced from certified China laboratories. Ships internationally.',
    category: 'Muscle Growth',
    price: 12,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // IGF-1 LR3 — Norway only
  {
    id: 'prod_igf1_lr3_1mg',
    name: 'IGF-1 LR3 (1mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Long-chain analogue of Insulin-like Growth Factor-1 researched for anabolic signaling, muscle hypertrophy, and satellite cell activation.',
    category: 'Muscle Growth',
    price: 85,
    inventory: 0,
    sourceRestriction: 'norway'
  },

  // Arachidonic Acid — China only
  {
    id: 'prod_arachidonic_china_100mg',
    name: 'Arachidonic Acid China (100mg)',
    description: 'Omega-6 polyunsaturated fatty acid researched for pro-inflammatory muscular signaling pathways and satellite cell hypertrophy response. Sourced from China laboratories.',
    category: 'Muscle Growth',
    price: 48,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // ─── WEIGHT LOSS ──────────────────────────────────────────────────────────

  // Retatrutide — Norway: 5/10/20/30/50/60/100mg | China: 10/15/20/30/60mg | USA: 10/20/30mg
  {
    id: 'prod_retat_5mg',
    name: 'Retatrutide (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 77,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_retat_10mg',
    name: 'Retatrutide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 117,
    inventory: 10,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_retat_20mg',
    name: 'Retatrutide (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 156,
    inventory: 20,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_retat_30mg',
    name: 'Retatrutide (30mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 197,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_retat_50mg',
    name: 'Retatrutide (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 270,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_retat_60mg',
    name: 'Retatrutide (60mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 309,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_retat_100mg',
    name: 'Retatrutide (100mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Triple GIP/GLP-1/glucagon receptor agonist studied for metabolic research, energy expenditure, and adipose reduction.',
    category: 'Weight Loss',
    price: 392,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_retat_china_10mg',
    name: 'Retatrutide China (10mg)',
    description: 'Triple GIP/GLP-1/glucagon receptor agonist. Sourced directly from our China lab partners. 10mg per vial. Ships internationally from China facility.',
    category: 'Weight Loss',
    price: 18,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_retat_china_15mg',
    name: 'Retatrutide China (15mg)',
    description: 'Triple GIP/GLP-1/glucagon receptor agonist. Sourced directly from our China lab partners. 15mg per vial. Ships internationally from China facility.',
    category: 'Weight Loss',
    price: 26,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_retat_china_20mg',
    name: 'Retatrutide China (20mg)',
    description: 'Triple GIP/GLP-1/glucagon receptor agonist. Sourced directly from our China lab partners. 20mg per vial. Ships internationally from China facility.',
    category: 'Weight Loss',
    price: 33,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_retat_china_30mg',
    name: 'Retatrutide China (30mg)',
    description: 'Triple GIP/GLP-1/glucagon receptor agonist. Sourced directly from our China lab partners. 30mg per vial. Ships internationally from China facility.',
    category: 'Weight Loss',
    price: 38,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_retat_china_60mg',
    name: 'Retatrutide China (60mg)',
    description: 'Triple GIP/GLP-1/glucagon receptor agonist. Sourced directly from our China lab partners. 60mg per vial. Ships internationally from China facility.',
    category: 'Weight Loss',
    price: 54,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_retat_usa_10mg',
    name: 'Retatrutide US Warehouse (10mg)',
    description: 'Purity: 99%+. Triple GIP/GLP-1/glucagon receptor agonist. Ships from our USA fulfillment warehouse — same-week domestic dispatch with no international transit delays.',
    category: 'USA Fast Ship',
    price: 18,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_retat_usa_20mg',
    name: 'Retatrutide US Warehouse (20mg)',
    description: 'Purity: 99%+. Triple GIP/GLP-1/glucagon receptor agonist. Ships from our USA fulfillment warehouse — same-week domestic dispatch with no international transit delays.',
    category: 'USA Fast Ship',
    price: 28,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_retat_usa_30mg',
    name: 'Retatrutide US Warehouse (30mg)',
    description: 'Purity: 99%+. Triple GIP/GLP-1/glucagon receptor agonist. Ships from our USA fulfillment warehouse — same-week domestic dispatch with no international transit delays.',
    category: 'USA Fast Ship',
    price: 35,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // Tirzepatide — Norway: 10/15/20/30/40/60/70/120mg | China: 10/15/20/30/50/60/100mg
  {
    id: 'prod_tirz_10mg',
    name: 'Tirzepatide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 73,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_tirz_15mg',
    name: 'Tirzepatide (15mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 97,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_tirz_20mg',
    name: 'Tirzepatide (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 117,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_tirz_30mg',
    name: 'Tirzepatide (30mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 156,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_tirz_40mg',
    name: 'Tirzepatide (40mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 185,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_tirz_60mg',
    name: 'Tirzepatide (60mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 235,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_tirz_70mg',
    name: 'Tirzepatide (70mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 255,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_tirz_120mg',
    name: 'Tirzepatide (120mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Co-agonist targeting GIP and GLP-1 receptors investigated for metabolic homeostatic signaling pathways.',
    category: 'Weight Loss',
    price: 340,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_tirz_china_10mg',
    name: 'Tirzepatide China (10mg)',
    description: 'Dual GIP/GLP-1 receptor co-agonist. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Weight Loss',
    price: 12,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_tirz_china_15mg',
    name: 'Tirzepatide China (15mg)',
    description: 'Dual GIP/GLP-1 receptor co-agonist. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Weight Loss',
    price: 16,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_tirz_china_20mg',
    name: 'Tirzepatide China (20mg)',
    description: 'Dual GIP/GLP-1 receptor co-agonist. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Weight Loss',
    price: 18,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_tirz_china_30mg',
    name: 'Tirzepatide China (30mg)',
    description: 'Dual GIP/GLP-1 receptor co-agonist. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Weight Loss',
    price: 22,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_tirz_china_50mg',
    name: 'Tirzepatide China (50mg)',
    description: 'Dual GIP/GLP-1 receptor co-agonist. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Weight Loss',
    price: 196,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_tirz_china_60mg',
    name: 'Tirzepatide China (60mg)',
    description: 'Dual GIP/GLP-1 receptor co-agonist. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Weight Loss',
    price: 32,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_tirz_china_100mg',
    name: 'Tirzepatide China (100mg)',
    description: 'Dual GIP/GLP-1 receptor co-agonist. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Weight Loss',
    price: 337,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // Semaglutide — Norway only
  {
    id: 'prod_sema_5mg',
    name: 'Semaglutide (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 50,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_sema_10mg',
    name: 'Semaglutide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 73,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_sema_15mg',
    name: 'Semaglutide (15mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 95,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_sema_20mg',
    name: 'Semaglutide (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 109,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_sema_30mg',
    name: 'Semaglutide (30mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 144,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_sema_50mg',
    name: 'Semaglutide (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 191,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_sema_60mg',
    name: 'Semaglutide (60mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Highly selective GLP-1 receptor agonist studied for satiety mechanisms, gastric motility, and insulin pathways.',
    category: 'Weight Loss',
    price: 219,
    inventory: 0,
    sourceRestriction: 'norway'
  },

  // Cagrilintide — Norway: 5mg, 10mg | China: 20mg
  {
    id: 'prod_cagri_5mg',
    name: 'Cagrilintide (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Long-acting amylin receptor agonist investigated for metabolic path synergy when co-analyzed with GLP-1 agonists.',
    category: 'Weight Loss',
    price: 58,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_cagri_10mg',
    name: 'Cagrilintide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Long-acting amylin receptor agonist investigated for metabolic path synergy when co-analyzed with GLP-1 agonists.',
    category: 'Weight Loss',
    price: 77,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_cagri_china_20mg',
    name: 'Cagrilintide China (20mg)',
    description: 'Long-acting amylin receptor agonist. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Weight Loss',
    price: 117,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // Mazdutide — Norway only
  {
    id: 'prod_mazdutide_5mg',
    name: 'Mazdutide (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Dual GLP-1/glucagon receptor co-agonist studied for metabolic homeostasis, energy expenditure, and adipose reduction pathways.',
    category: 'Weight Loss',
    price: 80,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_mazdutide_10mg',
    name: 'Mazdutide (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. GLP-1/glucagon dual receptor agonist investigated for advanced metabolic research and adipose tissue reduction pathways.',
    category: 'Weight Loss',
    price: 115,
    inventory: 0,
    sourceRestriction: 'norway'
  },

  // AOD-9604 — China only
  {
    id: 'prod_aod_china_5mg',
    name: 'AOD-9604 China (5mg)',
    description: 'Synthetic C-terminal fragment of human growth hormone researched for selective lipid metabolism pathways. Sourced from China laboratories.',
    category: 'Weight Loss',
    price: 55,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_aod_china_10mg',
    name: 'AOD-9604 China (10mg)',
    description: 'Synthetic C-terminal fragment of human growth hormone researched for selective lipid metabolism pathways. Sourced from China laboratories.',
    category: 'Weight Loss',
    price: 75,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // ─── HEALING & REPAIR ─────────────────────────────────────────────────────

  // BPC-157 — Norway: 10mg | China: 5mg, 10mg, 20mg
  {
    id: 'prod_bpc_10mg',
    name: 'BPC-157 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Pentadecapeptide investigated for tissue remodeling, gastric protection, tendon, and vascular recovery pathways.',
    category: 'Healing & Repair',
    price: 69,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_bpc_china_5mg',
    name: 'BPC-157 China (5mg)',
    description: 'Pentadecapeptide for tissue remodeling and recovery. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Healing & Repair',
    price: 12,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_bpc_china_10mg',
    name: 'BPC-157 China (10mg)',
    description: 'Pentadecapeptide for tissue remodeling and recovery. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Healing & Repair',
    price: 12,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_bpc_china_20mg',
    name: 'BPC-157 China (20mg)',
    description: 'Pentadecapeptide for tissue remodeling and recovery. Sourced from certified China laboratories. Ships internationally from China facility.',
    category: 'Healing & Repair',
    price: 23,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // TB-500 — Norway: 10mg | China: 5mg, 20mg
  {
    id: 'prod_tb_10mg',
    name: 'TB-500 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Thymosin Beta-4 synthetic active sequence researched for cellular migration, actin regulation, and wound resolution.',
    category: 'Healing & Repair',
    price: 75,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_tb_china_5mg',
    name: 'TB-500 China (5mg)',
    description: 'Thymosin Beta-4 synthetic active sequence for cellular migration and wound resolution. Sourced from China laboratories. Ships internationally.',
    category: 'Healing & Repair',
    price: 11,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_tb_china_20mg',
    name: 'TB-500 China (20mg)',
    description: 'Thymosin Beta-4 synthetic active sequence for cellular migration and wound resolution. Sourced from China laboratories. Ships internationally.',
    category: 'Healing & Repair',
    price: 112,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // BPC-157 / TB-500 Blend — Norway: 10mg, 20mg | China: 10mg, 20mg
  {
    id: 'prod_bpc_tb_blend_10mg',
    name: 'BPC-157 / TB-500 Blend (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Pre-formulated synergy vial containing 5mg BPC-157 and 5mg TB-500 for cellular and tendon research models.',
    category: 'Healing & Repair',
    price: 73,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_bpc_tb_blend_20mg',
    name: 'BPC-157 / TB-500 Blend (20mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Pre-formulated synergy vial containing 10mg BPC-157 and 10mg TB-500 for high-dose cellular and tendon research models.',
    category: 'Healing & Repair',
    price: 120,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_bpc_tb_blend_china_10mg',
    name: 'BPC-157 / TB-500 Blend China (10mg)',
    description: 'BPC-157 + TB-500 synergy blend for tissue repair research. Sourced from certified China laboratories. Ships internationally.',
    category: 'Healing & Repair',
    price: 17,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_bpc_tb_blend_china_20mg',
    name: 'BPC-157 / TB-500 Blend China (20mg)',
    description: 'BPC-157 + TB-500 synergy blend for tissue repair research. Sourced from certified China laboratories. Ships internationally.',
    category: 'Healing & Repair',
    price: 27,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // ─── BEAUTY & RADIANCE ────────────────────────────────────────────────────

  // Klow — Norway only
  {
    id: 'prod_klow_80mg',
    name: 'Klow (80mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Exclusive beauty and skin radiance regulatory peptide engineered in premium 80mg kits to research dermis remodeling targets.',
    category: 'Beauty & Radiance',
    price: 124,
    inventory: 20,
    sourceRestriction: 'norway'
  },

  // Glow — Norway: 50mg, 70mg | China: 50mg
  {
    id: 'prod_glow_50mg',
    name: 'Glow (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Advanced beauty peptide researched for skin radiance, dermis remodeling, and anti-aging pathways.',
    category: 'Beauty & Radiance',
    price: 150,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_glow_70mg',
    name: 'Glow (70mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Advanced beauty peptide researched for skin radiance, dermis remodeling, and anti-aging pathways.',
    category: 'Beauty & Radiance',
    price: 185,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_glow_china_50mg',
    name: 'Glow China (50mg)',
    description: 'Advanced beauty peptide for skin radiance and dermis remodeling. Sourced from certified China laboratories. Ships internationally.',
    category: 'Beauty & Radiance',
    price: 22,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // GHK-Cu — Norway: 50mg, 100mg | China: 20mg, 50mg, 100mg
  {
    id: 'prod_ghk_50mg',
    name: 'GHK-Cu (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Pure copper tripeptide studied for collagen stimulation, hair follicle integrity, and extracellular matrix remodeling.',
    category: 'Beauty & Radiance',
    price: 101,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_ghk_100mg',
    name: 'GHK-Cu (100mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Pure copper tripeptide studied for collagen stimulation, hair follicle integrity, and extracellular matrix remodeling.',
    category: 'Beauty & Radiance',
    price: 152,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_ghk_china_20mg',
    name: 'GHK-Cu China (20mg)',
    description: 'Copper tripeptide for collagen stimulation and skin remodeling. Sourced from certified China laboratories. Ships internationally.',
    category: 'Beauty & Radiance',
    price: 10,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_ghk_china_50mg',
    name: 'GHK-Cu China (50mg)',
    description: 'Copper tripeptide for collagen stimulation and skin remodeling. Sourced from certified China laboratories. Ships internationally.',
    category: 'Beauty & Radiance',
    price: 6,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_ghk_china_100mg',
    name: 'GHK-Cu China (100mg)',
    description: 'Copper tripeptide for collagen stimulation and skin remodeling. Sourced from certified China laboratories. Ships internationally.',
    category: 'Beauty & Radiance',
    price: 10,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // Melanotan I — Norway only
  {
    id: 'prod_mt1_10mg',
    name: 'Melanotan I (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Alpha-MSH analog investigated for melanocyte stimulation, photoprotective pigmentation pathways, and skin protective mechanisms.',
    category: 'Beauty & Radiance',
    price: 79,
    inventory: 0,
    sourceRestriction: 'norway'
  },

  // Melanotan II — Norway: 10mg | China: 20mg
  {
    id: 'prod_mt2_10mg',
    name: 'Melanotan II (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Strong alpha-MSH receptor agonist investigated for skin pigment adaptation patterns and photoprotective modeling.',
    category: 'Beauty & Radiance',
    price: 45,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_mt2_china_20mg',
    name: 'Melanotan II China (20mg)',
    description: 'Alpha-MSH receptor agonist for skin pigmentation research. Sourced from certified China laboratories. Ships internationally.',
    category: 'Beauty & Radiance',
    price: 69,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // SNAP-8 — Norway: 10mg | China: 10mg
  {
    id: 'prod_snap8_10mg',
    name: 'SNAP-8 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Octapeptide analog of ACTH researched for expression line reduction, muscle contraction modulation, and dermal smoothing applications.',
    category: 'Beauty & Radiance',
    price: 80,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_snap8_china_10mg',
    name: 'SNAP-8 China (10mg)',
    description: 'Octapeptide for expression line reduction and dermal smoothing. Sourced from certified China laboratories. Ships internationally.',
    category: 'Beauty & Radiance',
    price: 10,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // PT-141 — Norway: 10mg | China: 20mg
  {
    id: 'prod_pt141_10mg',
    name: 'PT-141 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Bremelanotide synthetic candidate studied for melanocortin receptor activation pathways and autonomic vascular regulation.',
    category: 'Beauty & Radiance',
    price: 50,
    inventory: 10,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_pt141_china_20mg',
    name: 'PT-141 China (20mg)',
    description: 'Bremelanotide melanocortin receptor agonist. Sourced from certified China laboratories. Ships internationally.',
    category: 'Beauty & Radiance',
    price: 73,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // Lemon Bottle — Norway only
  {
    id: 'prod_lemon_bottle_10ml',
    name: 'Lemon Bottle (10ml)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Premium lipolytic solution researched for targeted adipose tissue disruption and fat dissolution mechanisms.',
    category: 'Beauty & Radiance',
    price: 79,
    inventory: 0,
    sourceRestriction: 'norway'
  },

  // NAD+ — Norway: 500mg | China: 500mg, 1000mg
  {
    id: 'prod_nad_500mg',
    name: 'NAD+ (500mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Pure Nicotinamide Adenine Dinucleotide studied for sirtuin path signaling, cell energy charging, and biochemical integrity.',
    category: 'Beauty & Radiance',
    price: 79,
    inventory: 10,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_nad_china_500mg',
    name: 'NAD+ China (500mg)',
    description: 'Nicotinamide Adenine Dinucleotide for sirtuin signaling and cellular energy. Sourced from China laboratories. Ships internationally.',
    category: 'Beauty & Radiance',
    price: 12,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_nad_china_1000mg',
    name: 'NAD+ China (1000mg)',
    description: 'Nicotinamide Adenine Dinucleotide for sirtuin signaling and cellular energy. Sourced from China laboratories. Ships internationally.',
    category: 'Beauty & Radiance',
    price: 23,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // Glutathione — China only
  {
    id: 'prod_glutathione_china_600mg',
    name: 'Glutathione China (600mg)',
    description: 'Master antioxidant tripeptide for oxidative stress reduction and cellular detoxification. Sourced from China laboratories. Ships internationally.',
    category: 'Beauty & Radiance',
    price: 80,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // ─── COGNITIVE & FOCUS ────────────────────────────────────────────────────

  // Semax — Norway: 10mg | China: 5mg, 10mg
  {
    id: 'prod_semax_10mg',
    name: 'Semax (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Upregulates Brain-Derived Neurotrophic Factor (BDNF) and NGF. Studied for executive cognitive signaling.',
    category: 'Cognitive & Focus',
    price: 62,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_semax_china_5mg',
    name: 'Semax China (5mg)',
    description: 'BDNF and NGF upregulator for cognitive enhancement. Sourced from certified China laboratories. Ships internationally.',
    category: 'Cognitive & Focus',
    price: 9,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_semax_china_10mg',
    name: 'Semax China (10mg)',
    description: 'BDNF and NGF upregulator for cognitive enhancement. Sourced from certified China laboratories. Ships internationally.',
    category: 'Cognitive & Focus',
    price: 12,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // Selank — Norway: 10mg | China: 10mg
  {
    id: 'prod_selank_10mg',
    name: 'Selank (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Synthetic tuftsin neuroregulatory peptide. Studied for GABAergic stabilization and focused analytical performance.',
    category: 'Cognitive & Focus',
    price: 59,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_selank_china_10mg',
    name: 'Selank China (10mg)',
    description: 'Tuftsin analog for GABAergic stabilization and cognitive performance. Sourced from certified China laboratories. Ships internationally.',
    category: 'Cognitive & Focus',
    price: 12,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // Semax + Selank Blend — China only
  {
    id: 'prod_semax_selank_china_blend_20mg',
    name: 'Semax / Selank China (20mg)',
    description: 'Synergy duo blend pairing Semax with Selank. Studied for memory executive speeds and anxiety resistance pathways. Sourced from China laboratories.',
    category: 'Cognitive & Focus',
    price: 16,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // ─── LONGEVITY & CELLULAR ─────────────────────────────────────────────────

  // Epitalon — Norway: 10mg | China: 10mg, 50mg
  {
    id: 'prod_epitalon_10mg',
    name: 'Epitalon (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Pineal gland hormone secretagogue regulator tetrapeptide researched for telomerase enzyme signaling pathways.',
    category: 'Longevity & Cellular',
    price: 58,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_epitalon_china_10mg',
    name: 'Epitalon China (10mg)',
    description: 'Pineal gland tetrapeptide for telomerase signaling and longevity research. Sourced from certified China laboratories. Ships internationally.',
    category: 'Longevity & Cellular',
    price: 11,
    inventory: 999,
    sourceRestriction: 'china'
  },
  {
    id: 'prod_epitalon_china_50mg',
    name: 'Epitalon China (50mg)',
    description: 'Pineal gland tetrapeptide for telomerase signaling and longevity research. Sourced from certified China laboratories. Ships internationally.',
    category: 'Longevity & Cellular',
    price: 120,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // SS-31 (Elamipretide) — Norway: 10mg, 50mg | China: 10mg
  {
    id: 'prod_ss31_10mg',
    name: 'SS-31 (Elamipretide) (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Mitochondria-targeting tetrapeptide researched for cardiolipin integrity, ROS mitigation, and energetic ATP balance.',
    category: 'Longevity & Cellular',
    price: 89,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_ss31_50mg',
    name: 'SS-31 (Elamipretide) (50mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Mitochondria-targeting tetrapeptide researched for cardiolipin integrity, ROS mitigation, and energetic ATP balance.',
    category: 'Longevity & Cellular',
    price: 230,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_ss31_china_10mg',
    name: 'SS-31 China (10mg)',
    description: 'Mitochondria-targeting tetrapeptide for cardiolipin integrity and ATP balance. Sourced from certified China laboratories. Ships internationally.',
    category: 'Longevity & Cellular',
    price: 15,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // SLU-PP-332 — Norway only
  {
    id: 'prod_slu_pp_5mg',
    name: 'SLU-PP-332 (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. ERR agonist researched for mitochondrial biogenesis, metabolic endurance, and longevity pathway activation.',
    category: 'Longevity & Cellular',
    price: 87,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_slupp332_10mg',
    name: 'SLU-PP-332 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Potent ERRα/ERRγ agonist studied as an exercise mimetic for mitochondrial biogenesis, endurance capacity, and metabolic gene expression.',
    category: 'Longevity & Cellular',
    price: 65,
    inventory: 0,
    sourceRestriction: 'norway'
  },

  // 5-Amino-1MQ — Norway: 10mg | China: 50mg
  {
    id: 'prod_5amino_10mg',
    name: '5-Amino-1MQ (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. NNMT inhibitor researched for metabolic activation, adipocyte shrinkage, and cellular energy expenditure augmentation.',
    category: 'Longevity & Cellular',
    price: 67,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_5amino_china_50mg',
    name: '5-Amino-1MQ China (50mg)',
    description: 'NNMT inhibitor for metabolic reprogramming and adipocyte lipolysis. Sourced from certified China laboratories. Ships internationally.',
    category: 'Longevity & Cellular',
    price: 21,
    inventory: 999,
    sourceRestriction: 'china'
  },

  // ─── IMMUNE & HEALTH ──────────────────────────────────────────────────────

  {
    id: 'prod_ta1_5mg',
    name: 'Thymosin Alpha-1 (5mg)',
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
  {
    id: 'prod_ara_10mg',
    name: 'ARA-290 (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Erythropoietin-derived peptide researched for tissue protection, anti-inflammatory signaling, and neuropathic pathway modulation.',
    category: 'Immune & Health',
    price: 67,
    inventory: 0,
    sourceRestriction: 'norway'
  },

  // ─── SLEEP & RECOVERY ─────────────────────────────────────────────────────

  {
    id: 'prod_dsip_5mg',
    name: 'DSIP (5mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Delta Sleep-Inducing Peptide. Pure somnotropic peptide studied for slow-wave delta rhythms and biorhythm adjustment.',
    category: 'Sleep & Recovery',
    price: 54,
    inventory: 0,
    sourceRestriction: 'norway'
  },
  {
    id: 'prod_dsip_10mg',
    name: 'DSIP (10mg)',
    description: 'Purity: 99%+. Sourced from certified laboratories. Delta Sleep-Inducing Peptide. Pure somnotropic peptide studied for slow-wave delta rhythms and biorhythm adjustment.',
    category: 'Sleep & Recovery',
    price: 79,
    inventory: 0,
    sourceRestriction: 'norway'
  },

  // ─── RECONSTITUTION SOLVENTS ──────────────────────────────────────────────

  {
    id: 'prod_bac_water_3ml',
    name: 'BAC Water (3ml)',
    description: 'Reconstitution Solvent grade. Benzyl alcohol preserved. Engineered sterile solvent standard required for scientific reconstitution of delicate peptide research compounds.',
    category: 'Reconstitution Solvents',
    price: 18,
    inventory: 0
  },
  {
    id: 'prod_bac_water_10ml',
    name: 'BAC Water (10ml)',
    description: 'Reconstitution Solvent grade. Benzyl alcohol preserved. Engineered sterile solvent standard required for scientific reconstitution of delicate peptide research compounds.',
    category: 'Reconstitution Solvents',
    price: 22,
    inventory: 0
  },
  {
    id: 'prod_bac_water_30ml',
    name: 'BAC Water (30ml)',
    description: 'Reconstitution Solvent grade. Benzyl alcohol preserved. Engineered sterile solvent standard required for scientific reconstitution of delicate peptide research compounds.',
    category: 'Reconstitution Solvents',
    price: 18,
    inventory: 0
  }
];
