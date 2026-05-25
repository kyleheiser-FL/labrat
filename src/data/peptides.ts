import { LibraryItem } from '../types';

export const PEPTIDE_LIBRARY: LibraryItem[] = [
  {
    id: 'bpc-157',
    name: 'BPC-157',
    chemicalName: 'Body Protection Compound 157',
    category: 'healing',
    description: 'A synthetic peptide consisting of 15 amino acids, derived from a protective protein found in human gastric juice. Renowned for its rapid tendon, muscle, ligament, and gut-healing properties.',
    clinicalResearch: 'BPC-157 has been shown in clinical trials to accelerate the healing of transected Achilles tendons, collateral ligaments, and skeletal muscle. It works by upregulating growth hormone receptors, stimulating angiogenesis (blood vessel growth), and promoting cell migration.',
    typicalDosage: '250 mcg - 500 mcg twice daily',
    frequencyText: 'Administered sub-Q twice daily, preferably local to the injury site if applicable, or systemically.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 5 mg vial. This yields a concentration of 250 mcg per 10 units (0.1 ml) on a U100 insulin syringe.',
    halfLife: 'Approx. 4 hours',
    benefits: [
      'Accelerates healing of tendons, ligaments, and joints',
      'Protects and heals gut lining (Leaky Gut / IBS)',
      'Offers systemic anti-inflammatory benefits',
      'Promotes cellular regeneration and angiogenesis',
      'Alleviates neuropathic and joint pain'
    ],
    sideEffects: [
      'Mild headache or dizziness immediately following injection',
      'Injected site redness / irritation',
      'Mild changes in digestive motility'
    ],
    suggestedCycleWeeks: '4 - 8 weeks, followed by a 4-week break.',
    deliveryForm: 'peptide',
    clinicalStudies: [
      {
        studyTitle: 'Stable Gastric Pentadecapeptide BPC 157 in Bone, Tendon, and Ligament Healing',
        citation: 'Current Pharmaceutical Design, Vol 17, Issue 16',
        keyFinding: 'In vitro and in vivo models confirmed BPC 157 upregulates expression of early growth response 1 (egr-1) and growth hormone receptors, significantly accelerating ligament fibroblast cell migration and blood vessel angiogenesis.'
      },
      {
        studyTitle: 'Gastric Pentadecapeptide BPC 157 Promotes Healing of Achilles Tendon',
        citation: 'Journal of Orthopaedic Research, Vol 21, Issue 6',
        keyFinding: 'Systemic or local injections of BPC 157 successfully healed transected Achilles tendons in animal models, demonstrating increased collagen fibre density and structural load tolerance.'
      }
    ],
    realisticGains: 'Accelerates biological cellular recovery. Expect a 30% to 50% reduction in healing timelines for acute ligament, tendon, or muscular micro-tears relative to baseline. It is completely non-anabolic, meaning zero direct skeletal muscle mass expansion or weight fluctuations, but it prevents chronic, restricting connective tissue scarring.',
    dietaryInteraction: 'Highly synergistic with high-quality amino acid profiles, collagen peptides (10g - 20g daily), and Vitamin C to supply the raw biochemical building blocks needed for upregulated tissue synthesis. Avoid immediate exposure to harsh NSAID drugs (like Ibuprofen) as they can suppress the inflammatory signaling cascade needed for BPC-157 to initiate healing.'
  },
  {
    id: 'tb-500',
    name: 'TB-500',
    chemicalName: 'Thymosin Beta-4 (Frag. 17-23)',
    category: 'healing',
    description: 'A synthetic version of the active healing region of Thymosin Beta-4. It acts as an actin-sequestering protein that plays a vital role in repairing damaged tissues, improving range of motion, and reducing inflammatory scarring.',
    clinicalResearch: 'Thymosin Beta-4 has remarkable wound healing properties. It promotes cellular migration, stem cell differentiation, and acts as a potent anti-scarring agent. Widely stacked with BPC-157 for synergistic recovery.',
    typicalDosage: '2.5 mg - 5 mg twice weekly',
    frequencyText: 'Often injected sub-Q or dry-needle intra-muscularly 2 times per week (e.g. Monday and Thursday).',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 10 mg vial. Consumed at 5.0 mg per week, this yields 2 full shots of 100 units (1.0 ml) each.',
    halfLife: '7 - 10 days (long systemic effect)',
    benefits: [
      'Significant reduction in acute and chronic muscle spasms',
      'Repairs deep muscle tissues, micro-tears, and structural fibers',
      'Promotes hair growth and skin elasticity',
      'Reduces inflammatory joint fluid aggregation',
      'Synergistic healing when combined with BPC-157'
    ],
    sideEffects: [
      'Mild flush of warmth directly after injection',
      'Temporary fatigue directly post-dose',
      'Slight increase in systemic white cell count (normal immune profile upregulation)'
    ],
    suggestedCycleWeeks: '6 - 12 weeks (loading phase of 5mg/week for 4 weeks, tapering to 2.5mg/week).',
    deliveryForm: 'peptide',
    realisticGains: 'Significantly improves joint mobility and skeletal tissue elasticity. Not a muscle-building agent, but range of motion and tissue flexibility are noticeably restored within 2 to 3 weeks of loading. Outstanding for pulling the plug on long-running local muscle pulls, chronic joint fluid build-up, and persistent scar tissues.',
    dietaryInteraction: 'Requires a minor increase in standard dietary trace minerals—particularly Zinc, Copper, and Magnesium—to act as enzymatic co-factors supporting TB-500’s actin-binding, cellular migration, and tissue-remodeling cascades.'
  },
  {
    id: 'semaglutide',
    name: 'Semaglutide',
    chemicalName: 'GLP-1 Receptor Agonist',
    category: 'weight_loss',
    description: 'A highly prominent glucagon-like peptide-1 (GLP-1) receptor agonist. It mimics the natural GLP-1 hormone to slow gastric emptying, regulate appetite, and promote profound body fat reduction.',
    clinicalResearch: 'Validated extensively in FDA clinical trials (STEP trials), Semaglutide induces weight loss by signaling satiety centers in the brain, improving glucose-dependent insulin secretion, and lowering glucagon levels.',
    typicalDosage: '0.25 mg - 2.4 mg once weekly',
    frequencyText: 'Administered sub-Q once weekly on the same day, escalating dose gradually every 4 weeks.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 5 mg vial. This yields a concentration of 0.25 mg per 10 units (0.1 ml) or 0.5 mg per 20 units.',
    halfLife: 'Approx. 7 days',
    benefits: [
      'Profound reduction in body fat mass',
      'Satiety improvement and elimination of food cravings ("food noise")',
      'Improved glycemic control and HbA1c levels',
      'Cardioprotective and kidney protective properties',
      'Lowers systemic lipid profiles'
    ],
    sideEffects: [
      'Transient nausea, indigestion, or abdominal reflux',
      'Dehydration and constipation (mitigated by high water and fiber intake)',
      'Mild lethargy due to extreme caloric deficit'
    ],
    suggestedCycleWeeks: 'Ongoing (12 - 48 weeks) with a gradual titration schedule.',
    deliveryForm: 'peptide',
    clinicalStudies: [
      {
        studyTitle: 'Once-Weekly Semaglutide in Adults with Overweight or Obesity (STEP 1)',
        citation: 'The New England Journal of Medicine (NEJM), Vol 384, Issue 11',
        keyFinding: 'A randomized, double-blind trial showing that adult participants receiving once-weekly Semaglutide 2.4 mg subcutaneously alongside lifestyle modifications achieved an average body weight reduction of 14.9% over 68 weeks.'
      }
    ],
    realisticGains: 'Induces rapid, healthy systemic adipose reduction. Expect realistic fat loss averaging 1.0 to 2.0 lbs per week when coupled with a calibrated, protein-dense diet. Completely silences food-seeking obsessive thoughts ("food noise") within 24 to 48 hours of initial dosage. Expect zero muscle hypertrophy; safe-guarding existing muscle is the primary clinical objective.',
    dietaryInteraction: 'CRITICAL: Prioritize 0.8g to 1.0g of protein per lb of bodyweight daily to shield against skeletal muscle catabolism during high caloric deficits. To avoid nausea or acid reflux caused by delayed gastric emptying, split daily food intake into small, nutrient-dense portions and entirely restrict high-fat, heavily fried, or carbonated items.'
  },
  {
    id: 'tirzepatide',
    name: 'Tirzepatide',
    chemicalName: 'Dual GIP / GLP-1 Receptor Agonist',
    category: 'weight_loss',
    description: 'A novel synthetic companion that acts as a dual glucose-dependent insulinotropic polypeptide (GIP) and GLP-1 receptor agonist. Features higher weight reduction metrics on average than GLP-1 mono-agonists.',
    clinicalResearch: 'SURMOUNT trials showed that the synergistic dual-receptor action of GIP and GLP-1 achieves elevated weight mitigation with slightly improved nausea profiles compared to Semaglutide alone.',
    typicalDosage: '2.5 mg - 15 mg once weekly',
    frequencyText: 'Sub-Q injection once weekly, starting at 2.5 mg and titrating up by 2.5 mg increments every 4 weeks if needed.',
    reconstitutionText: 'Add 1.0 ml of Bacteriostatic Water to a 10 mg vial. Consuming a 2.5 mg dose requires drawing exactly 25 units (0.25 ml) on a U100 syringe.',
    halfLife: 'Approx. 5 days',
    benefits: [
      'Exceptional fat loss profiles',
      'Dual pancreatic upregulation of insulin responsiveness',
      'Strong suppression of visceral adiposity and hepatic lipids',
      'Decreased systemic blood pressure and inflammatory cytokines',
      'Superior food-noise silencing properties'
    ],
    sideEffects: [
      'Nausea or mild stomach upset during initial administration',
      'Aversion to sulfurous foods or delayed digestion',
      'Mild sub-Q injection site reactive redness'
    ],
    suggestedCycleWeeks: '16 - 36+ weeks based on metabolic objectives.',
    deliveryForm: 'peptide',
    realisticGains: 'Exceptional visual and visceral fat-burning. Expect average body fat reductions of 1.5 to 2.5 lbs weekly once titrated to therapeutic dosages. Highly effective at shrinking visceral abdominal fat layers while maintaining glycemic balance even under severe caloric restriction.',
    dietaryInteraction: 'Because of dual GLP-1 and GIP signaling action, gastric transit is heavily delayed. Maintain a daily fiber intake of 25g - 35g or take a gentle soluble psyllium fiber supplement to preserve digestive health. Drink 3+ liters of water daily alongside balanced trace minerals, as a suppressed thirst mechanism makes dehydration risk high.'
  },
  {
    id: 'retatrutide',
    name: 'Retatrutide',
    chemicalName: 'GIP / GLP-1 / Glucagon Receptor Agonist',
    category: 'weight_loss',
    description: 'A next-generation co-agonist targeting three distinct metabolic hunger pathways (GIP, GLP-1, and GCG). It delivers the most powerful weight-mitigation rates currently noted in clinical literature.',
    clinicalResearch: 'By stimulating GIP, GLP-1, and glucagon receptors simultaneously, Retatrutide accelerates metabolic energy expenditure and thermogenesis while safely keeping insulin secretions optimized.',
    typicalDosage: '1 mg - 12 mg once weekly',
    frequencyText: 'Administered sub-Q once weekly on a standard titration build-up.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 10 mg vial. A 1 mg dose corresponds to drawing exactly 20 units (0.2 ml) on standard syringes.',
    halfLife: 'Approx. 6 days',
    benefits: [
      'The most powerful weight loss margins listed in third-party clinical trials',
      'Unlocks thermogenic mitochondrial energy expenditure',
      'Highly effective reduction of liver fat and fat-storing tissues',
      'Total silencing of visceral food noise'
    ],
    sideEffects: [
      'Slightly higher resting heart rate (especially during initial titration)',
      'Transient nausea, diarrhea, or localized gastric reflux',
      'Mild skin sensory sensitivity or light dehydration risk'
    ],
    suggestedCycleWeeks: '12 - 40 weeks with consistent hydration parameters.',
    deliveryForm: 'peptide',
    realisticGains: 'The current pinnacle of pharmacological fat oxidation. Expect 2.0 to 3.0+ lbs of total weight loss weekly, primarily driven by glucagon-mediated thermogenic energy upregulation. Shows unprecedented, rapid clearance of hepatic (liver) fat indices within 8 to 12 weeks of initiation.',
    dietaryInteraction: 'Active glucagon-stimulation accelerates baseline metabolic expenditures. Consume clean, slow-digesting complex carbohydrates pre-workout to match elevated physical energy demands and avoid sudden fatigue. Avoid simple high-fructose syrups and high-fat lipids to bypass sudden digestive spasms.'
  },
  {
    id: 'ipamorelin',
    name: 'Ipamorelin',
    chemicalName: 'Growth Hormone Releasing Peptide (GHRP)',
    category: 'longevity',
    description: 'A highly selective, mild growth hormone secretagogue. It mimics ghrelin to stimulate growth hormone release without triggering spikes in cortisol, prolactin, or aldosterone, making it exceptionally safe.',
    clinicalResearch: 'Ipamorelin binds to the growth hormone secretagogue receptor in the pituitary. Clinical models highlight its efficacy in maintaining body mass index, increasing bone mineral density, and promoting youth status in skin and tissues.',
    typicalDosage: '200 mcg - 300 mcg once daily',
    frequencyText: 'Sub-Q injection once daily, ideally at night before bed on an empty stomach (2 hours post-meal) to align with natural circadian GH pulses.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 2 mg vial. Drawing a 200 mcg dose requires pulling to exactly 20 units (0.2 ml) on a standard U100 syringe.',
    halfLife: 'Approx. 2 hours',
    benefits: [
      'Increases cellular rejuvenation, collagen production, and skin structure',
      'Promotes deeper, more restorative slow-wave REM sleep',
      'Facilitates recovery from intense muscular workouts',
      'Promotes nitrogen retention and lean muscle tone',
      'Enhances bone density and joint structure durability'
    ],
    sideEffects: [
      'Mild face flushing directly after injection',
      'Transient hunger right after administration',
      'Slight water retention in fingers or ankles'
    ],
    suggestedCycleWeeks: '12 - 24 weeks (requires continuous usage to observe structural rejuvenation).',
    deliveryForm: 'peptide',
    realisticGains: 'Steady, gradual cellular rejuvenation and structural body recomposition. Expect visible improvements in skin clarity, hair follicle density, and nail thickness within 4 to 6 weeks of continuous injection. Near-immediate improvements in slow-wave sleep depth (slow-wave REM sleep) will accelerate post-exercise muscle fiber repair. Expect zero sudden mass gains; water retention is usually negligible (1-3 lbs).',
    dietaryInteraction: 'MUST BE TAKEN FASTING. Administer strictly on an empty stomach (minimum of 2 hours post-meal) and maintain complete fasting for at least 30-45 minutes after dosing. Consuming carbohydrates or fatty acids during this threshold triggers insulin, which completely suppresses the pituitary somatotropic cells, neutralizing the growth hormone release signal.'
  },
  {
    id: 'cjc-1295-no-dac',
    name: 'CJC-1295 (No DAC)',
    chemicalName: 'Modified GRF 1-29',
    category: 'longevity',
    description: 'A growth hormone-releasing hormone (GHRH) analog that stimulates pulsatile release of physiological growth hormone. Synergizes in a 1:1 ratio with Ipamorelin to multiply natural pituitary pulses.',
    clinicalResearch: 'When co-administered with a GHRP like Ipamorelin (GHRH + GHRP synergy), the magnitude of the growth hormone pulse is magnified up to 5-fold compared to either compound administered in isolation.',
    typicalDosage: '100 mcg - 150 mcg once daily',
    frequencyText: 'Injected sub-Q once daily, typically combined in the same syringe as Ipamorelin at bedtime on an empty stomach.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 2 mg vial. Drawing a 100 mcg dose requires pulling to exactly 10 units (0.1 ml) on a U100 syringe.',
    halfLife: 'Approx. 30 minutes (fast pulse)',
    benefits: [
      'Promotes fat loss and accelerated recovery speeds',
      'Synergistically amplifies Ipamorelin, BPC-157, or other peptides',
      'Enhances lean structural conditioning',
      'Promotes tissue vitality and cellular repair structures',
      'Enhances baseline resting metabolic rate'
    ],
    sideEffects: [
      'Short-lived head rush or tingling in skin minutes after injection',
      'Mild injection site bump or itching (temporary histamine response)',
      'Short-term lethargy if taken during daylight hours'
    ],
    suggestedCycleWeeks: '12 - 24 weeks, ideally cycled alongside Ipamorelin.',
    deliveryForm: 'peptide',
    realisticGains: 'When stacked with Ipamorelin, expecting a 4x to 5x increase in circulating growth hormone pulses. Helps accelerate metabolic rate, dries out localized stubborn water fat layers, and eases morning joint tightness when used consistently for 8 to 12 weeks.',
    dietaryInteraction: 'Subject to strict fasting protocols identical to other GHRHs. Any bump in blood glucose prior to injection recruits Somatostatin, the body’s endogenous "growth hormone inhibiting hormone", which fully blunts the therapeutic potential.'
  },
  {
    id: 'ghk-cu',
    name: 'GHK-Cu',
    chemicalName: 'Copper Tripeptide-1',
    category: 'longevity',
    description: 'An elemental copper-binding tripeptide found naturally in human plasma. It regulates a vast array of human genes (upregulated collagen, elastin, decorin) to act as a powerful rejuvenator of skin, hair, and neurological tissue.',
    clinicalResearch: 'Research indicates GHK-Cu has anti-inflammatory, antioxidant, and tissue-regenerative properties. It remodels skin layers, reverses fine wrinkles, stimulates hair follicle size, and repairs protective nerve fibers.',
    typicalDosage: '1.5 mg - 3 mg once daily',
    frequencyText: 'Sub-Q injection once daily (or applied as a topical serum in concentrated solutions). It can be stingy on injection.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water (with 1% benzyl alcohol) to a 50 mg vial. Consuming a 2.5 mg dose requires exactly 10 units (0.1 ml) on a U100 syringe.',
    halfLife: 'Approx. 1 hour',
    benefits: [
      'Dramatic acceleration of collagen and elastin synthesis',
      'Promotes skin firmness, thickness, and elasticity',
      'Thickens hair follicles and stimulates active head regrowth',
      'Potent antioxidant and cell-protective properties',
      'Maintains integrity of vascular veins and arterial systems'
    ],
    sideEffects: [
      'Mild stinging sensation at the injection site (common to copper salt compounds)',
      'Histamine response (localized itching or hives)',
      'Occasional metallic taste in mouth'
    ],
    suggestedCycleWeeks: '4 - 6 weeks, typically rested for 4 weeks to avoid over-accumulation of copper.',
    deliveryForm: 'peptide',
    realisticGains: 'Deep dermis rejuvenation, scalp follicle reactivation, and systemic cellular restoration. Expect a visible reduction in facial fine lines, accelerated skin repair from minor abrasions, and a 20-30% expansion in hair strand thickness & growth velocity over a 6-week cycle.',
    dietaryInteraction: 'Avoid concurrently supplementing with high doses of Oral Zinc, as Zinc competes directly with Copper at the intestinal absorption level. Pair with high-quality, cold-pressed seed oils or avocados to support phospholipid cell membrane defense.'
  },
  {
    id: 'human-growth-hormone',
    name: 'Human Growth Hormone (HGH)',
    chemicalName: 'Somatropin (recombinant 191aa)',
    category: 'longevity',
    description: 'The premier clinical human hormone regulating nitrogen retention, growth processes, cellular division, tissue repair, and skeletal structural healing.',
    clinicalResearch: 'Induces downstream anabolic actions by stimulating liver synthesis of Insulin-Like Growth Factor 1 (IGF-1). Profoundly stimulates osteoblast bone thickness, skin density, and cellular protein transcription.',
    typicalDosage: '2 IU - 4 IU once daily',
    frequencyText: 'Sub-Q injection once daily, usually in the evening or split pre-workout.',
    reconstitutionText: 'Add 2.5 ml of Bacteriostatic Water to a 10 mg (approx 30 IU) vial. Draw carefully on insulin syringe bounds (e.g. 10 units = 1.2 IU).',
    halfLife: 'Approx. 4 hours',
    benefits: [
      'Unlocks remarkable anti-aging benefits, reducing skin creping and wrinkles',
      'Directly encourages cellular and muscular recovery from deep physical strain',
      'Increases adipose breakdown, yielding rapid visceral fat loss',
      'Restores cartilage, connective tissue, and joint cushion matrices'
    ],
    sideEffects: [
      'May produce hand/ankle fluid retention (temporary edema)',
      'Prolonged high dosages elevate insulin resistance',
      'Carpal tunnel tingling in fingertips due to nerve tissue hydration'
    ],
    suggestedCycleWeeks: '16 - 52 weeks based on metabolic, recovery, and wellness objectives.',
    deliveryForm: 'peptide',
    realisticGains: 'Comprehensive visceral fat oxidation and dermal/skeletal tissue rejuvenation. Over a 12 to 16 week timeline, expect improved facial skin elasticity, a noticeable increase in nail/hair growth velocity, and a gradual reduction of systemic adipose storage. Totally non-anabolic on its own for raw muscle building, but serves as a crucial hyperplasic booster and tissue-healing shield when stacked with traditional androgens or secretagogues.',
    dietaryInteraction: 'HGH naturally decreases insulin sensitivity over long-term cycles. Ensure daily diet is built around fibers and clean, low-glycemic complex carbohydrates rather than sugars. Consider taking supplemental Berberine (500mg (three times daily) with meals) or Chromium Picolinate (200mcg daily) to preserve baseline insulin sensitivity and glucose transport efficiency.'
  },
  {
    id: 'igf-1-lr3',
    name: 'IGF-1 LR3',
    chemicalName: 'Long R3 Insulin-Like Growth Factor-1',
    category: 'muscle',
    description: 'An advanced, highly stable analogue of indigenous human IGF-1. Re-engineered with an 83 amino acid sequence to prevent binding to inhibitory proteins and dramatically multiply its potency.',
    clinicalResearch: 'Promotes true myofibrillar hyperplasia (formation of new muscle cellular fibers), breaking past genetic limits by dividing and creating new receptive muscle structures instead of merely expanding existing cells.',
    typicalDosage: '30 mcg - 80 mcg once daily',
    frequencyText: 'Administered sub-Q once daily, typically directly post-workout on active training days.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 1 mg vial. This yields a concentration of 50 mcg per 10 syringe units.',
    halfLife: 'Approx. 20 hours (highly stable)',
    benefits: [
      'Triggers hyperplasia (generation of brand-new muscle fiber cells)',
      'Drastically increases glycogen storage and nutrient loading inside muscle tissue',
      'Bypasses growth plate barriers to speed tendon repair and lean mass expansion',
      'Enhances vascular blood pump and muscular protein biosynthesis'
    ],
    sideEffects: [
      'Can cause temporary hypoglycemia (blood sugar dip) post-dose',
      'Potential fatigue or brain fog shortly after administration',
      'Localized muscle soreness or mild cramping'
    ],
    suggestedCycleWeeks: '4 - 6 weeks maximum, followed by a mandatory 4-6 week rest period.',
    deliveryForm: 'peptide',
    realisticGains: 'Expect dense myofibrillar hyperplasia (the creation of brand new muscle cells rather than simple enlargement). Expect intense intramuscular vascularity and sustained fullness ("all-day muscle pump"). Can realistically yield 3.0 to 5.0 lbs of dense, permanent, non-water lean tissue mass over a 4 to 6 week exposure cycle.',
    dietaryInteraction: 'CRITICAL HIGHEST PRIORITY: IGF-1 LR3 aggressively shuttles circulating blood glucose directly into muscle beds via GLUT-4 transporters, risking immediate clinical hypoglycemia. You MUST consume 45g - 65g of fast-acting, high-glycemic carbohydrates (such as Cyclic Dextrin or waxy maize) coupled with 20g of rapid whey protein isolate within 10 to 15 minutes of injection.'
  },
  {
    id: 'pt-141',
    name: 'PT-141 (Bremelanotide)',
    chemicalName: 'Melanocortin Receptor Agonist Bremelanotide',
    category: 'sexual_health',
    description: 'A synthetic cyclic peptide that crosses the blood-brain barrier to target central nervous system receptors, dramatically upgrading neurological sexual drive and libido signals.',
    clinicalResearch: 'Binds predominantly to MC3 and MC4 melanocortin receptors in the hypothalamus, stimulating central pathways to overcome physical or psychological sexual dysfunction.',
    typicalDosage: '1 mg - 2 mg as needed',
    frequencyText: 'Administered sub-Q 4 to 6 hours before desired romantic timeline.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 10 mg vial. A 1 mg dose corresponds to exactly 20 units (0.2 ml) on standard syringes.',
    halfLife: 'Approx. 2.7 hours',
    benefits: [
      'Profound, reliable increase in neurological libido and sexual desire',
      'Provides potent pro-erectile support structures',
      'Improves vascular responsiveness',
      'Synergistic action that operates independently of cardiovascular nitric oxide paths'
    ],
    sideEffects: [
      'Significant transient nausea immediately following administration (takes 30-60m to resolve)',
      'Mild facial flushing or light head rush',
      'Temporary blood pressure elevation'
    ],
    suggestedCycleWeeks: 'Used purely as as-needed (PRN), up to a maximum of 2-3 times per week to prevent systemic tolerance.',
    deliveryForm: 'peptide',
    realisticGains: 'Does not cause skeletal muscle mass growth. Expect a rapid and highly robust upregulation of psychological libido and vascular erectile sensitivity initiating 3 to 6 hours post-dose, with increased romantic performance that can persist for 24 to 36 hours.',
    dietaryInteraction: 'Highly sensitive to injection timing relative to food. To maximize absorption and bypass potential transient nausea, administer PT-141 either fasting or 2 to 3 hours after a clean, low-fat meal. Completely avoid alcohol around the dosing window.'
  },
  {
    id: 'tesamorelin',
    name: 'Tesamorelin',
    chemicalName: 'Growth Hormone Releasing Hormone Analogue (44aa)',
    category: 'weight_loss',
    description: 'A synthetic analogue of Growth Hormone Releasing Hormone (GHRH) with an anchoring hexenoyl group that makes it resistant to enzymatic breakdown. Specially researched for visceral fat loss.',
    clinicalResearch: 'Promotes pulsatile growth hormone secretion matching endogenous cycles. Heavily researched and clinically shown to reduce deep belly visceral adiposity without altering subcutaneous structures.',
    typicalDosage: '1 mg - 2 mg once daily',
    frequencyText: 'Injected sub-Q once daily, typically early morning or pre-bed on an empty stomach.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 2 mg vial. Drawing a 1 mg dose requires pulling to exactly 100 units (1.0 ml).',
    halfLife: 'Approx. 30 minutes',
    benefits: [
      'Exceptional, clinical reduction of deep visceral belly fat',
      'Upregulates natural physiological growth hormone levels',
      'Safeguards muscle integrity and structure',
      'Improves lipid panels and cognitive clarity'
    ],
    sideEffects: [
      'Mild redness, burning, or itching at the injection spot',
      'Temporary water retention or finger stiffening',
      'Slight increase in blood sugar if dietary carbs are excessively elevated'
    ],
    suggestedCycleWeeks: '12 - 24 weeks for deep abdominal fat reconstruction.',
    deliveryForm: 'peptide',
    realisticGains: 'Focused, dramatic reduction of deep visceral belly fat. In a 12 to 16 week timeline, expect to clear 15% to 20% of dangerous visceral fat surrounding abdominal organs, exposing underlying muscle definitions with zero water retention or bloat.',
    dietaryInteraction: 'Administer strictly on an empty stomach at bed-time or early morning (at least 2 hours post-meal). Fasting is mandatory on both sides of the injection because circulating carbohydrates and insulin trigger Somatostatin, shutting off the pituitary pulse.'
  },
  {
    id: 'epitalon',
    name: 'Epitalon',
    chemicalName: 'Epithalon Tetrapeptide (Ala-Glu-Asp-Gly)',
    category: 'longevity',
    description: 'A synthetic tetrapeptide derived from pineal gland secretions (epithalamin). Researched for its ability to activate telomerase, elongate telomeres, and safely restore pineal melatonin cycles.',
    clinicalResearch: 'In clinical trials, Epitalon has been shown to upregulate telomerase enzymes, slowing cellular aging. It restores endocrine balance, regulates circadian sleep rhythms, and rejuvenates immune defenses.',
    typicalDosage: '5 mg - 10 mg once daily',
    frequencyText: 'Administered sub-Q once daily, typically in a short intense bi-annual blast.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 10 mg vial. Consuming a 5 mg dose requires exactly 100 units (1.0 ml).',
    halfLife: 'Approx. 4 hours',
    benefits: [
      'Upregulates cellular telomerase enzyme to extend cellular lifespan',
      'Restores deep, rejuvenating sleep patterns by optimizing endocrine melatonin',
      'Promotes extensive nervous system repair and antioxidant defense',
      'Maintains pristine immune cell counts and cellular integrity'
    ],
    sideEffects: [
      'Extremely high safety margin with virtually zero adverse effects',
      'Very mild localized injection site warmth',
      'Occasional vivid dreams due to pineal gland activation'
    ],
    suggestedCycleWeeks: '10 - 20 days (typically done as a 100mg total treatment cycle twice a year).',
    deliveryForm: 'peptide',
    realisticGains: 'A systemic improvement in deep pineal-guided sleep cycles (REM and deep sleep), clear reduction in morning waking fatigue, and biological telomerase cellular longevity. No muscular size alterations or fat loss.',
    dietaryInteraction: 'Highly synergistic with Sleep Supplements like Magnesium Bisglycinate and L-Tryptophan. Keep evening meals light to support standard nocturnal melatonin and telomerase restoration pathways.'
  },
  {
    id: 'melanotan-ii',
    name: 'Melanotan II',
    chemicalName: 'MT-2 cyclic peptide',
    category: 'lifestyle',
    description: 'A synthetic analog of alpha-melanocyte stimulating hormone (α-MSH). It stimulates melanogenesis, enhancing systemic skin pigmentation (tanning) and increasing libido through protective pathways.',
    clinicalResearch: 'Melanotan II non-selectively mimics melanocortin receptors (MC1, MC3, MC4). By active agonist recruitment, it causes significant tanning without dangerous UV sun damage, and acts as a neurological pro-erectile agent.',
    typicalDosage: '100 mcg - 500 mcg once daily',
    frequencyText: 'Injected sub-Q once daily during loading phase (typically 7-10 days), then 2-3 times per week for maintenance depending on UV exposure.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 10 mg vial. Drawing 250 mcg requires 5 units on a standard U100 syringe.',
    halfLife: 'Approx. 1.5 hours',
    benefits: [
      'Induces rich, authentic sun-free full body tanning',
      'Provides cellular protection (photoprotection) from UV light damage',
      'Significantly elevates libido and improves erectile profiles',
      'Suppresses baseline appetite during active dosage cycles',
      'Increases natural fat oxidation indices'
    ],
    sideEffects: [
      'Mild-to-moderate facial flushing and core nausea directly after dose',
      'Pre-dose stretching or yawning behaviors (neurological melanocortin response)',
      'Darkening of existing moles or freckles (requires close observation)'
    ],
    suggestedCycleWeeks: '2 - 4 weeks for active tanning, followed by minimal maintenance (250mcg once weekly).',
    deliveryForm: 'peptide',
    realisticGains: 'Profound and rapid full-body skin tanning with minimal UV sun exposure. A rich, dark, natural tan develops within 7 to 10 days of loading. Noticeable suppression of sugar cravings and a mild thermogenic effect are also common.',
    dietaryInteraction: 'Take right before bedtime to bypass the common transient nausea. Drink a warm cup of peppermint or ginger tea shortly after administration to settle gastric receptors. Avoid consuming heavy fat-loaded foods near the dose.'
  },
  {
    id: 'testosterone-cypionate',
    name: 'Testosterone Cypionate',
    chemicalName: 'Injectable Bioidentical Androgen (Oil)',
    category: 'muscle',
    description: 'A highly prominent androgenic-anabolic steroid (AAS) suspended in a cottonseed or sesame carrier oil. It serves as the standard clinical cornerstone of chemical TRT therapy and muscle hypertrophy schedules.',
    clinicalResearch: 'Binds intracellularly to high-affinity androgen receptors, encouraging profound nuclear nitrogen retention and upregulating myofibrillar protein translation. Highly stable pharmacokinetics thanks to the slow-release cypionate ester.',
    typicalDosage: '100 mg - 400 mg weekly',
    frequencyText: 'Administered intramuscularly once or twice weekly in an oil-based volume.',
    halfLife: 'Approx. 8 days',
    benefits: [
      'Dramatic expansion of skeletal muscle mass and hypertrophy parameters',
      'Significant increase in absolute body strength and motor stamina',
      'Drastically compresses recovery intervals between heavy training sessions',
      'Enhances bone density, metabolic rates, and natural self-confidence markers'
    ],
    sideEffects: [
      'Suppresses the natural hypothalamic-pituitary-gonadal (HPG) hormonal axis',
      'Can aromatize into active Estrogen, carrying risk of fluid retention, elevated blood pressure, or gynecomastia if unmanaged',
      'Slight increase in blood hematocrit (thickness) and mild LDL cholesterol elevation'
    ],
    suggestedCycleWeeks: '10 - 16 weeks, requiring either medical TRT maintenance or a rigorous Post Cycle Therapy (PCT) schedule.',
    deliveryForm: 'oil',
    realisticGains: 'Profound, reliable skeletal muscle hypertrophy and absolute power extension. Over a moderate-dose 12-week protocol, expect a realistic gain of 8.0 to 12.0 lbs of solid contractile muscle fibers, coupled with 3.0 to 5.0 lbs of reversible intracellular glycogen/water retention. Bench/squat force outputs typically increase by 15% to 25%.',
    dietaryInteraction: 'Requires a calculated caloric surplus (300 to 500 kcal above maintenance) with a consistent 0.9g to 1.2g of high-biological protein per lb of bodyweight to feed accelerated nitrogen translation. Maintain a strict potassium-to-sodium ratio (high potassium, restricted sodium) and drink 4+ liters of water daily to prevent arterial fluid volume overload.'
  },
  {
    id: 'testosterone-enanthate',
    name: 'Testosterone Enanthate',
    chemicalName: 'Injectable Heptanoate Androgen (Oil)',
    category: 'muscle',
    description: 'A classical, long-acting ester of bioidentical testosterone suspended in oil. Popular globally as the structural baseline for bodybuilding cycles and TRT schedules.',
    clinicalResearch: 'Provides stable, continuous androgen release. Enters the muscle cell nuclei directly to stimulate myofibrillar growth and accelerate structural cellular hypertrophy.',
    typicalDosage: '100 mg - 500 mg weekly',
    frequencyText: 'Administered intramuscularly (IM) split into 1 or 2 injections per week.',
    halfLife: 'Approx. 7 days',
    benefits: [
      'Promotes solid, rapid increases in lean skeletal muscle mass',
      'Drastically raises red blood cell production, promoting massive workout stamina',
      'Accelerates muscular recovery and skeletal density parameters',
      'Upregulates protein synthesis and structural energy pathways'
    ],
    sideEffects: [
      'HPGA endocrine suppression (requires dedicated PCT after stopping)',
      'Potential for high estrogen aromatization (water weight, cardiovascular stress)',
      'Androgenic side effects (acne, hair thinning, prostate pressure if genetically prone)'
    ],
    suggestedCycleWeeks: '10 - 16 weeks matching clinical TRT or PCT protocols.',
    deliveryForm: 'oil',
    realisticGains: 'Highly consistent lean tissue development and physical power accumulation. Expect realistic gains of 8.0 to 14.0 lbs of bodyweight (a combination of new protein structures, localized water volume, and vascular red cell mass). Speeds muscular repair so that the same muscle group can be targeted with full intensity every 48 to 72 hours.',
    dietaryInteraction: 'Best coupled with a structured, carbohydrate-rich diet to maximize cellular glycogen supercompensation. Restrict artificial processed foods and refined sugars that aggravate oil-gland sebum production (preventing androgenic acne flare-ups). Ensure daily intake of fatty fish (Salmon/Sardines) to support cardiovascular endothelial health.'
  },
  {
    id: 'testosterone-propionate',
    name: 'Testosterone Propionate',
    chemicalName: 'Short-Ester Injectable Androgen (Oil)',
    category: 'muscle',
    description: 'A rapid-acting ester of testosterone. Because of its fast-releasing propionate chain, it produces immediate peaks, less systemic water logging, and is heavily preferred in "cutting" schedules.',
    clinicalResearch: 'Rapidly absorbed upon IM injection with a short duration of activity, allowing for quick adjustments of serum testosterone levels compared to longer esters.',
    typicalDosage: '50 mg - 150 mg every other day (EOD)',
    frequencyText: 'Injected intramuscularly or sub-Q every other day (EOD) due to short ester life.',
    halfLife: 'Approx. 20 hours',
    benefits: [
      'Rapid, explosive spikes in free testosterone and absolute power',
      'Significantly less water retention and bloating than long-lived esters',
      'Ideal for contest prep, dry muscle formatting, and body reshaping',
      'Accelerated physical recovery and strength performance'
    ],
    sideEffects: [
      'Frequent injections are required (increases risk of localized tissue irritation)',
      'Sharp hormonal swings if administration schedule is irregular',
      'Suppresses natural endocrine axis'
    ],
    suggestedCycleWeeks: '8 - 12 weeks with strict monitoring.',
    deliveryForm: 'oil',
    realisticGains: 'Rapid, dry muscle hardening and athletic power spikes. Expect a gains profile of 4.0 to 7.0 lbs of highly dense, solid myofibrillar mass with minimal water retention. Extensively deployed in final weeks of cutting schedules to retain strength while aggressively dropping body fat.',
    dietaryInteraction: 'Since fluid retention is naturally low with short esters, dietary sodium does not need to be heavily restricted, but a high fluid base remains vital. Highly compatible with ketogenic, carb-cycling, or low-calorie diets, as fast-acting androgens help preserve skeletal fibers during heavy energy deficits.'
  },
  {
    id: 'deca-durabolin',
    name: 'Deca-Durabolin',
    chemicalName: 'Nandrolone Decanoate (Oil)',
    category: 'muscle',
    description: 'A highly anabolic 19-nor derivative ester famous for its ability to construct heavy muscle mass while dramatically restoring joint collagen matrices.',
    clinicalResearch: 'Nandrolone exhibits lower binding with 5-alpha-reductase, rendering it less androgenic than testosterone. Proactively stimulates osteoblasts and accelerates joint lubricating collagen tissue synthesis.',
    typicalDosage: '200 mg - 450 mg weekly',
    frequencyText: 'Injected intramuscularly once a week.',
    halfLife: 'Approx. 15 days',
    benefits: [
      'Promotes immense muscle nitrogen retention, expanding cellular density',
      'Relieves intense arthritic joint pressure by hydrating fluid membranes and collagen',
      'Provides powerful protection against catabolic tissue breakdown during workouts',
      'Supports high red cell counts to sustain muscular endurance'
    ],
    sideEffects: [
      'Progesterone receptor binding (requires prolactin control options)',
      'Prolonged pituitary endocrine shutdown (can take months to resolve naturally)',
      'Can suppress natural libido if not stacked with an active testosterone base'
    ],
    suggestedCycleWeeks: '12 - 16 weeks to allow the long decanoate ester to establish equilibrium.',
    deliveryForm: 'oil',
    realisticGains: 'Immense muscle fullness and massive joint recovery support. Expect a real weight increase of 10.0 to 15.0 lbs over 12-16 weeks. Synthesizes joint synovial fluids to reduce or completely eliminate chronic tendonitis and joint aches (shoulder, knees, elbows) within 3 to 4 weeks.',
    dietaryInteraction: 'Limit simple sugars and processed carbohydrates to prevent lipids from worsening. Progesterone/Prolactin signaling causes estrogen-like fluid side-effects; taking Cruciferous vegetables (rich in Indole-3-Carbinol and DIM) is highly suggested to safe-guard estrogen clearances.'
  },
  {
    id: 'trenbolone-acetate',
    name: 'Trenbolone Acetate',
    chemicalName: 'Short-Ester 19-Nor Progestin (Oil)',
    category: 'muscle',
    description: 'The most powerful anabolic-androgenic steroid in common use. Boasting five times the anabolic and androgenic rating of testosterone, it creates instant, dry, granite-like physique shifts.',
    clinicalResearch: 'Binds with extremely high affinity to androgen receptors and aggressively blocks cortisol pathways. Enhances feed-efficiency, meaning nutrients are absorbed at extreme cellular loading ratios.',
    typicalDosage: '150 mg - 350 mg weekly',
    frequencyText: 'Administered intramuscularly every other day (EOD) in short-ester doses.',
    halfLife: 'Approx. 24 hours',
    benefits: [
      'Creates extremely hard, solid, vascular "dry" muscle tone with zero aromatization',
      'Profound, rapid burning of body fat while under calorie restriction',
      'Aggressively blocks muscle wasting and catabolic hormones',
      'Exceptional increases in functional strength and explosive motor output'
    ],
    sideEffects: [
      'Severe respiratory irritation (e.g. "tren cough" immediately post-injection)',
      'Disruptive night sweats, elevated heart rates, insomnia, and intense body heat',
      'Neurological alterations, including increased irritability, anxiety, or aggression',
      'Severe cardiovascular stress, raising blood pressure and limiting HDL cholesterol protectants'
    ],
    suggestedCycleWeeks: '6 - 10 weeks maximum due to intense organ load and systemic impact.',
    deliveryForm: 'oil',
    realisticGains: 'Extreme, near-instantaneous muscle-hardening, vascular separation, and explosive strength. Expect gains of 6.0 to 10.0 lbs of pure myofibrillar mass while simultaneously drop-burning 2% to 4% of body fat over an 8-week period, even in a caloric deficit. Transforms muscle fibers into a dry, dense, "granite-like" aesthetic.',
    dietaryInteraction: 'Slightly increase clean carbohydrate intake 1.5 to 2 hours before heavy weight training sessions to ward off hypoglycemic jitters and breathing constrictions ("Tren-cough/sweats"). Fully restrict spicy, fatty, or highly acidic foods past 6:00 PM to lessen the intense gastric reflux that contributes to Trenbolone-induced insomnia.'
  },
  {
    id: 'primobolan-enanthate',
    name: 'Primobolan',
    chemicalName: 'Methenolone Enanthate (Oil)',
    category: 'muscle',
    description: 'A premium, non-aromatizing DHT derivative of legendary purity and safety. It is coveted for its cosmetic "dryness," tissue-building potential, and minimal direct side effects.',
    clinicalResearch: 'Exhibits clean, highly targeted androgen receptor binding. Does not convert into estrogen, eliminating risks of blood pressure or fluid storage. Promotes nitrogen retention without water logging.',
    typicalDosage: '200 mg - 500 mg weekly',
    frequencyText: 'Administered intramuscularly split into 1 or 2 injections weekly.',
    halfLife: 'Approx. 10 days',
    benefits: [
      'Promotes high-quality, completely dry skeletal muscle mass',
      'Increases skin elasticity, tissue conditioning, and lean vascularity',
      'Minimally suppresses liver or vascular enzymes compared to other compounds',
      'Enables rapid muscle definition during cutting protocols'
    ],
    sideEffects: [
      'Can accelerate male pattern baldness in individuals genetically inclined to DHT sensitivity',
      'Mild suppression of natural endocrine hormones',
      'Moderate impact on baseline HDL cholesterol levels'
    ],
    suggestedCycleWeeks: '10 - 16 weeks to achieve outstanding, lasting tissue outcomes.',
    deliveryForm: 'oil',
    realisticGains: 'Flawless, dry, and pure muscle fiber accumulation with zero water retention or facial bloat. Expect a realistic 4.0 to 7.0 lbs of clean contractile tissue over a 12-week layout. Gains are highly permanent and easily preserved during a post-cycle period compared to aromatizing compounds.',
    dietaryInteraction: 'Highly efficient on calorie-restricted diets. Support cholesterol lines and arterial walls by taking 3g of Citrus Bergamot daily and 2g of high-potency Omega-3 Krill oil to counter methenolone’s mild impact on HDL/LDL fractions.'
  },
  {
    id: 'masteron-propionate',
    name: 'Masteron',
    chemicalName: 'Drostanolone Propionate (Oil)',
    category: 'muscle',
    description: 'A structural DHT derivative with highly anti-estrogenic properties. It operates as a powerful muscle hardener and cosmetic drying agent, heavily utilized in the final weeks of fat-shredding cycles.',
    clinicalResearch: 'Drostanolone has an inherent chemical arrangement that prevents aromatization and acts as a mild aromatase inhibitor in peripheral tissue, helping to limit circulating estrogen levels.',
    typicalDosage: '200 mg - 400 mg weekly',
    frequencyText: 'Injected intramuscularly split every other day (EOD) as a short-ester agent.',
    halfLife: 'Approx. 2 days',
    benefits: [
      'Delivers an extremely dry, chiseled, and high-vascularity cosmetic appearance',
      'Blocks fluid logging, actively shedding subcutaneous water retention',
      'Inhibits aromatase to help manage estrogen markers from other compounds',
      'Increases muscle density and physical power'
    ],
    sideEffects: [
      'Aggressive DHT action can cause skin acne or hair thinning',
      'Vascular stress (reduces HDL cholesterol and increases LDL levels)',
      'HPGA endocrine axis suppression'
    ],
    suggestedCycleWeeks: '8 - 12 weeks, typically in combination with an active testosterone base.',
    deliveryForm: 'oil',
    realisticGains: 'Exceptional visual muscle-hardening, fiber separation, and vascular pop. Not a mass-builder; expect a realistic 2.0 to 4.0 lbs of dry tissue. However, physical appearance shifts are dramatic (creating a chiseled "photoshoot-ready" look) if starting body fat is already below 12%.',
    dietaryInteraction: 'Avoid processed sauces or meals high in sodium, as Masteron’s cosmetic diuretic mechanism is highly responsive to lower systemic water levels. Best coupled with a low-carb "pre-contest" style protocol to facilitate peak subcutaneous fat clearing.'
  },
  {
    id: 'anavar-oxandrolone',
    name: 'Anavar (Oxandrolone)',
    chemicalName: 'Oral 17α-Alkylated Class-I AAS',
    category: 'muscle',
    description: 'An oral anabolic steroid famous for its dry cosmetic results and highly favorable safety-to-potency ratio. It increases lean tissue and absolute power without aromatizing into estrogen.',
    clinicalResearch: 'Operates by actively storing intramuscular creatine phosphate levels, resulting in significant ATP replenishment. It exhibits minimized binding to estrogen receptors, preventing cosmetic bloating and water-logging.',
    typicalDosage: '20 mg - 80 mg daily',
    frequencyText: 'Taken orally in pill form daily, either all at once or split into morning/evening doses.',
    halfLife: 'Approx. 9 hours',
    benefits: [
      'Promotes extremely lean, highly vascular "dry" muscle mass accretion',
      'Profoundly escalates explosive muscle power via direct ATP system storage',
      'Protects skeletomuscular tissue from catabolic breakdown during caloric deficits',
      'Increases fat oxidation rates, facilitating subcutaneous fat trimming'
    ],
    sideEffects: [
      'Oral absorption strains AST/ALT liver enzymes (hepatotoxicity)',
      'Suppresses the natural endocrine testosterone production axis',
      'Dampens healthy HDL cholesterol levels, requiring continuous blood monitoring'
    ],
    suggestedCycleWeeks: '6 - 8 weeks maximum to prevent long-term liver enzyme elevation.',
    deliveryForm: 'pill',
    realisticGains: 'Pristine, dry muscle mass and substantial muscular power output. Expect a realistic 3.0 to 6.0 lbs of permanent structural lean tissue over a 6 to 8 week protocol, alongside deep subcutaneous fat clearing. Muscle fullness is highly pronounced due to cellular glycogen supercompensation with zero water bloat.',
    dietaryInteraction: 'Take alongside 5.0g of monohydrate creatine daily, as Anavar’s primary mechanism aggressively recruits creatine phosphate to synthesize high levels of cellular ATP (creating explosive strength bursts). To shield liver cells, add 1,200mg of NAC or 500mg of TUDCA daily.'
  },
  {
    id: 'dianabol-methandrostenolone',
    name: 'Dianabol',
    chemicalName: 'Methandrostenolone (Oral Pill)',
    category: 'muscle',
    description: 'The historic oral AAS archetype. Noted for driving rapid, massive increases in raw strength, intracellular glycogen, and overall bodyweight within days of starting.',
    clinicalResearch: 'Profoundly increases protein synthesis, nitrogen retention, and glycogenolysis. Rapidly shifts muscle tissue state to high-anabolism, storing extracellular hydration inside muscle fibers.',
    typicalDosage: '15 mg - 50 mg daily',
    frequencyText: 'Administered orally as a tablet daily, split into multiple portions to match half-life.',
    halfLife: 'Approx. 4.5 hours',
    benefits: [
      'Provides immediate, explosive increases in raw lifting power',
      'Supercharges glycogen synthesis, giving muscle tissue a full, round look',
      'Rapidly expands skeletal lean mass and overall cellular volume',
      'Speeds up muscular nutrient absorption'
    ],
    sideEffects: [
      'High rates of estrogen conversion (can cause immediate water weight spikes and gynecomastia)',
      'Hepatotoxicity (alkylated structure causes liver enzyme stress)',
      'Suppression of the HPGA endocrine cycle and natural testosterone levels'
    ],
    suggestedCycleWeeks: '4 - 6 weeks maximum to limit liver stress and blood pressure rises.',
    deliveryForm: 'pill',
    realisticGains: 'Rapid, explosive gains in raw muscle volume, force, and scale weight. Expect 8.0 to 12.0 lbs of total weight scale gain inside the first 21 days (primarily intramuscular hydration and glycogen swelling). Not a dry builder; significant water weight shifts will reverse slightly once administration concludes.',
    dietaryInteraction: 'Best stacked with a moderate to high caloric intake emphasizing complete carbohydrates to optimize glycogen storage. Have an active aromatase inhibitor (Arimidex, 0.5mg EOD) configured pre-cycle, as Dianabol converts to highly active Methylestradiol, initiating rapid water logging and gyno risks if estrogen routes are left unblocked.'
  },
  {
    id: 'winstrol-stanozolol',
    name: 'Winstrol (Stanozolol)',
    chemicalName: 'Stanozolol Oral DHT Derivative',
    category: 'muscle',
    description: 'A rapid-acting oral DHT derivative. Renowned for its ability to lower Sex Hormone-Binding Globulin (SHBG), freeing up other active hormones while promoting extreme definition.',
    clinicalResearch: 'Exhibits powerful binding to progesterone receptors and acts on SHBG. By lowering SHBG, it multiplies the active "free" testosterone level of standard stacked compounds.',
    typicalDosage: '20 mg - 50 mg daily',
    frequencyText: 'Taken orally in pill form daily, typically split to maintain stable blood concentrations.',
    halfLife: 'Approx. 9 hours',
    benefits: [
      'Dramatically reduces SHBG to maximize efficacy of all stacked compounds',
      'Renders muscle tissue extremely hard, dry, and tight with zero water logging',
      'Facilitates fat loss and helps preserve lean muscle during cutting cycles',
      'Provides high, immediate strength output without bloating'
    ],
    sideEffects: [
      'Hepatotoxic (causes acute hepatic strain, requiring NAC/TUDCA support)',
      'Dries out joint synovial fluid, potentially causing stiff, achy joints',
      'Unfavorable lipid shift, drastically suppressing HDL cholesterol'
    ],
    suggestedCycleWeeks: '6 - 8 weeks maximum due to joint stiffness and liver load.',
    deliveryForm: 'pill',
    realisticGains: 'Profound, instantaneous muscular dryness, vascular separation, and explosive power. Expect a realistic 3.0 to 5.0 lbs of dry, solid contractile fiber mass over 6 weeks. Lowering of body SHBG means any stacked compounds (like Testosterone) operate at 2x efficiency. Expect rapid joint drying and friction within 14 days.',
    dietaryInteraction: 'Limit dietary sodium to minimize fluid retention in joint tissues. Joint fluid depletion can lead to structural wear; daily supplementation of wild-caught Salmon oil (3g) and Glucosamine/Chondroitin is highly recommended to protect tendon and joint linings.'
  },
  {
    id: 'clenbuterol-hydrochloride',
    name: 'Clenbuterol',
    chemicalName: 'Clenbuterol HCl Beta-2 Agonist',
    category: 'weight_loss',
    description: 'A powerful sympathomimetic bronchodilator. While not a steroid, it is widely utilized to burn fat by directly stimulating beta-2 receptors, accelerating core body temperature and metabolic rate.',
    clinicalResearch: 'Acts on beta-2 adrenergic receptors, upregulating lipolysis and fat mobilization. Increases basal metabolic rate (BMR) by stimulating cellular mitochondria.',
    typicalDosage: '20 mcg - 80 mcg daily',
    frequencyText: 'Taken orally as a pill daily, slowly titrated up to manage cardiovascular adaptation.',
    halfLife: 'Approx. 36 hours',
    benefits: [
      'Aggressive thermogenesis (significantly accelerates daily fat burning)',
      'Enhances oxygen transportation and cellular aerobic respiratory capacity',
      'Exhibits minor anti-catabolic properties in skeletal muscle',
      'Suppresses central nervous system hunger metrics'
    ],
    sideEffects: [
      'Causes intense hand tremors, nervous system jitters, and sweating',
      'Cardiovascular strain (palpitations, elevated resting heart rate, risks of cardiac hypertrophy)',
      'Depletes cellular potassium and taurine, potentially causing severe muscle cramps'
    ],
    suggestedCycleWeeks: '2 weeks on, 2 weeks off (or 4-6 weeks continuously stacked with ketotifen to prevent receptor downregulation).',
    deliveryForm: 'pill',
    realisticGains: 'Potent thermogenic fat burning. Expect 1.5 to 3.0 lbs of accelerated adipose tissue removal weekly when combined with a metabolic calorie deficit. Noticeably increases lung airway volume and core body temperature (+1.0°F to 1.5°F).',
    dietaryInteraction: 'CRITICAL WARNING: Clenbuterol aggressively drives potassium and taurine out of cellular reservoirs, risking extreme muscular spasms or cardiac cramps. You MUST supplement with 3.0g to 5.0g of Taurine daily coupled with 500mg - 1000mg of dietary Potassium. Never consume alongside high-dose caffeine to avoid panic attacks or heart rate spikes.'
  },
  {
    id: 'tudca-liver-guard',
    name: 'TUDCA',
    chemicalName: 'Tauroursodeoxycholic Acid',
    category: 'healing',
    description: 'A clinically researched, naturally occurring bile acid salt that prevents liver cell death. It is considered the gold-standard support supplement to offset oral chemical toxicity.',
    clinicalResearch: 'Acts as a mitochondrial cell chaperone to eliminate cellular endoplasmic reticulum strain. TUDCA lowers bile acid saturation, preventing chemical stagnation (cholestasis) in liver tissues.',
    typicalDosage: '250 mg - 500 mg daily',
    frequencyText: 'Taken orally as capsule pills daily, typically split to correspond with oral compound doses.',
    halfLife: 'Approx. 3 hours',
    benefits: [
      'Protects liver cells from structural damage under heavy chemical stress',
      'Dramatically lowers AST/ALT enzyme burden on hepatic tissue structures',
      'Ameliorates bile stagnation, encouraging healthy gallbladder bile output',
      'Improves cellular insulin sensitivity and supports overall metabolic markers'
    ],
    sideEffects: [
      'Can induce loose stool or minor diarrhea in highly elevated dosages',
      'Mild stomach rumbling directly after uptake'
    ],
    suggestedCycleWeeks: '6 - 8 weeks matching the duration of any oral compound in the cycle.',
    deliveryForm: 'pill'
  },
  {
    id: 'nac-antioxidant',
    name: 'NAC (N-Acetyl Cysteine)',
    chemicalName: 'Glutathione Synthase Precursor',
    category: 'longevity',
    description: 'A powerful amino-acid precursor to Glutathione, the human body\'s primary self-defense oxidant. Widely used as a multi-organ support supplement to offset the systemic stress of complex schedules.',
    clinicalResearch: 'NAC provides a rate-limiting substrate for cellular glutathione generation, scavenging toxic reactive oxygen species (ROS) and neutralizing metabolic bioproducts to safeguard the liver and kidneys.',
    typicalDosage: '600 mg - 1200 mg daily',
    frequencyText: 'Taken orally in pill form daily (capsules), preferably in split morning and evening doses.',
    halfLife: 'Approx. 5.6 hours',
    benefits: [
      'Significantly speeds up multi-organ recovery and cellular detox patterns',
      'Maintains baseline liver cell viability facing oxidation stressors',
      'Safeguards kidney function and assists in processing blood filtration',
      'Fosters bronchial and lung respiratory health by thinning heavy mucous'
    ],
    sideEffects: [
      'May produce a mild sulfury aftertaste or mild gastric reflux',
      'Occasional light nausea if consumed on a completely empty stomach'
    ],
    suggestedCycleWeeks: 'Consistently cycled everyday alongside all compounds, continuing into recovery phases.',
    deliveryForm: 'pill'
  },
  {
    id: 'arimidex-anastrozole',
    name: 'Arimidex',
    chemicalName: 'Anastrozole Aromatase Inhibitor',
    category: 'healing',
    description: 'A highly potent non-steroidal selective aromatase inhibitor. It is the primary clinical compound used to prevent testosterone from converting into circulating estrogen.',
    clinicalResearch: 'Anastrozole binds reversibly to the aromatase enzyme, blocking the conversion of androgens into estrone and estradiol. Extremely effective at low doses, reducing estrogen by ~80%.',
    typicalDosage: '0.25 mg - 0.5 mg every other day (EOD) or as needed',
    frequencyText: 'Taken orally as tiny pills, usually once or split based on estrogenic markers.',
    halfLife: 'Approx. 50 hours',
    benefits: [
      'Dramatically curbs estrogen build-up, resolving water logging and bloating',
      'Protects against gynecomastia (breast tissue expansion)',
      'Helps maintain stable vascular parameters by limiting excessive water retention',
      'Fosters high free testosterone levels by blocking the aromatization path'
    ],
    sideEffects: [
      'Extremes can cause "estrogen crash" (fatigue, severe joint cracking, mood changes)',
      'Negative impact on vascular lipids if aromatase is over-suppressed',
      'Temporary hair thinning if hormone balance dips too low'
    ],
    suggestedCycleWeeks: 'Taken consistently throughout the cycle only when using aromatizing bases.',
    deliveryForm: 'pill'
  },
  {
    id: 'nolvadex-tamoxifen',
    name: 'Nolvadex',
    chemicalName: 'Tamoxifen Citrate SERM',
    category: 'healing',
    description: 'A select estrogen receptor modulator (SERM). Used widely to block estrogen receptors in breast tissue, and as a primary PCT agent to restart natural testosterone production.',
    clinicalResearch: 'Competes with estradiol for receptor targets in target tissues. Clinically shown to upregulate LH (luteinizing hormone) and FSH, signaling the pituitary to restart natural testosterone synthesis.',
    typicalDosage: '20 mg - 40 mg daily',
    frequencyText: 'Taken orally in pill form daily, typically for 4-6 weeks directly following cycle completion.',
    halfLife: 'Approx. 5 - 7 days',
    benefits: [
      'Safeguards breast areas from estrogenic tissue growth',
      'Upregulates LH production to restart natural endocrine pathways',
      'Acts as a mild estrogen agonist in liver tissue, supporting healthy cholesterol parameters',
      'Protects bone mineral density during transitions'
    ],
    sideEffects: [
      'Temporary hot flashes or light visual spot disturbances',
      'Mild reduction in absolute IGF-1 secretion levels',
      'Transient stomach cramps or light nausea'
    ],
    suggestedCycleWeeks: '4 - 6 weeks during Post Cycle Therapy (PCT) or acutely for estrogen control.',
    deliveryForm: 'pill',
    clinicalStudies: [
      {
        studyTitle: 'Endocrine Effects of Tamoxifen in Healthy Gonadal Males',
        citation: 'Journal of Clinical Endocrinology & Metabolism (JCEM), Vol 54, Issue 6',
        keyFinding: 'Administration of tamoxifen in normal adult men led to a substantial ~50% increase in circulating serum LH, FSH, and immunoreactive testosterone baselines through pituitary feed-back mechanisms.'
      }
    ]
  },
  {
    id: 'enclomiphene-citrate',
    name: 'Enclomiphene',
    chemicalName: 'Trans-Clomiphene Citrate (SERM)',
    category: 'healing',
    description: 'An isolated active trans-isomer of Clomiphene. Unlike Nolvadex or classic Clomid, Enclomiphene specifically antagonizes estrogen receptors in the pituitary without the long-lasting estrogen-agonist side effects of the zuclomiphene isomer, restoring endogenous testosterone levels safely.',
    clinicalResearch: 'Acts on pituitary estrogen receptors, blocking negative estrogen feedback. This significantly upregulates pulsatile secretion of LH and FSH, stimulating Leydig cells to produce high levels of natural testosterone while maintaining testicular volume and sperm production.',
    typicalDosage: '6.25 mg - 25 mg daily',
    frequencyText: 'Taken in oral fluid or pill form daily during Post Cycle Therapy (PCT) or as a stand-alone TRT alternative.',
    halfLife: 'Approx. 10 hours',
    benefits: [
      'Dramatically restores LH and FSH levels post-suppression',
      'Accelerates natural testosterone production back to healthy baselines',
      'Preserves fertility and maintains healthy spermatogenesis/testicular size',
      'Avoids the mood swings, lethargy, or visual floaters associated with traditional Clomid'
    ],
    sideEffects: [
      'Mild acne or temporary skin oiliness from testosterone upregulation',
      'Slight increase in sex hormone-binding globulin (SHBG)',
      'Subtle libido fluctuations as hormonal baselines reorganize'
    ],
    suggestedCycleWeeks: '3 - 5 weeks directly following cycle cessation, or ongoing for fertility optimization.',
    deliveryForm: 'pill',
    clinicalStudies: [
      {
        studyTitle: 'Evaluation of Enclomiphene Citrate for Hypogonadism: A Randomized, Double-Blind Study',
        citation: 'BJU International Journal of Urology, Vol 116, Issue 3',
        keyFinding: 'Enclomiphene restored serum total testosterone levels into the normal range, showing a significantly superior LH/FSH stimulus profile and better sperm parameter metrics than topical testosterone gels.'
      }
    ],
    realisticGains: 'Rapid recovery of endogenous hormones. Expect baseline LH and FSH pituitary markers to surge by 150% to 250% within 14 days of beginning therapy, restoring raw testicle synthesis of free bioidentical testosterone. Crucial for maintaining and cementing 80%+ of cycle-acquired muscle gains.',
    dietaryInteraction: 'Highly synergistic when coupled with dietary Zinc (30mg - 50mg daily) and Magnesium (400mg daily) to feed Leydig cell raw materials. Do not run severe calorie restricted diets during PCT, as high fasting deficits stifle recovering natural testosterone pulses.'
  },
  {
    id: 'hcg-secretagogue',
    name: 'hCG',
    chemicalName: 'Human Chorionic Gonadotropin',
    category: 'healing',
    description: 'A biological glycoprotein hormone mimicking luteinizing hormone (LH). It acts as an endocrine bridge to prevent testicular atrophy and maintain native steroidogenesis during suppressive chemical cycles.',
    clinicalResearch: 'Directly stimulates the LH receptor on Leydig cells, mimicking endogenous LH. This maintains intratesticular testosterone levels and keeps the cellular machinery active, preventing atrophy and making post-cycle recovery substantially faster.',
    typicalDosage: '250 IU - 500 IU 2-3 times weekly',
    frequencyText: 'Administered sub-Q or intra-muscularly 2 to 3 times per week during a suppressive cycle or as a kickstart directly before PCT.',
    halfLife: 'Approx. 24 - 36 hours',
    benefits: [
      'Maintains testicular physical mass, function, and endocrine sensitivity',
      'Safeguards fertility and germ cell health under chemical stress',
      'Boosts response parameters for post-cycle SERMs like Nolvadex or Enclomiphene',
      'Prevents estrogenic rebound by optimizing direct intratesticular ratios'
    ],
    sideEffects: [
      'Can cause mild aromatization (elevated estrogen) if dosed excessively',
      'Injected site sensitivity or mild fluid retention',
      'Pituitary LH receptor desensitization if used continuously at high doses'
    ],
    suggestedCycleWeeks: 'Used on-cycle alongside suppressive compounds, or for 2-3 weeks immediately prior to beginning SERM therapy.',
    deliveryForm: 'peptide',
    clinicalStudies: [
      {
        studyTitle: 'Low-Dose Human Chorionic Gonadotropin Preserves Intratesticular Testosterone',
        citation: 'The Journal of Clinical Endocrinology, Vol 90, Issue 5',
        keyFinding: 'Doses of 250 IU of hCG subcutaneously every other day successfully maintained intratesticular testosterone levels near baseline in men undergoing experimental gonadotropin suppression.'
      }
    ],
    realisticGains: 'Sustains 100% of physical testicular volume and Leydig cell sensitivity during highly suppressive cycles. Retains muscular fullness, mental drive, and prevents the depressive endocrine flatline typical of testicular atrophy.',
    dietaryInteraction: 'hCG stimulates direct intratesticular aromatase pathways. Adhere to a clean, anti-inflammatory whole-foods diet and consume green tea extract (rich in EGCG) to maintain optimal hepatic estrogen clearing pathways.'
  },
  {
    id: 'citrus-bergamot-lipids',
    name: 'Citrus Bergamot',
    chemicalName: 'Citrus Bergamia Extract (Polyphenols)',
    category: 'longevity',
    description: 'An organic clinical supplement extracted from the Citrus Bergamia fruit. Highly rich in flavonoids, it is considered the most clinically effective natural compound for optimizing lipid profiles (cholesterol) and mitigating cardiovascular risk under androgen-induced load.',
    clinicalResearch: 'Inhibits HMG-CoA reductase (similar to statins but without negative musculoskeletal side effects) and boosts bile acid excretion. It elevates AMPK pathways, directly improving HDL, reducing LDL, and dropping triglycerides.',
    typicalDosage: '500 mg - 1000 mg daily',
    frequencyText: 'Taken orally as capsule pills daily, typically split into pre-meal and bed-time doses.',
    halfLife: 'Approx. 12 hours',
    benefits: [
      'Dramatically elevates high-density lipoprotein (HDL - "good" cholesterol)',
      'Lowers low-density lipoprotein (LDL) and extremely low-density lipoprotein (VLDL)',
      'Substantially improves arterial compliance and endothelial capillary health',
      'Acts as a broad-spectrum cellular antioxidant protecting vascular cells'
    ],
    sideEffects: [
      'Mild stomach acidity if taken without food',
      'Slight hypoglycemic effect (lowers blood sugar, which is generally protective)'
    ],
    suggestedCycleWeeks: 'Used continuously throughout all phases of cycles, bridging, and recovery.',
    deliveryForm: 'pill',
    clinicalStudies: [
      {
        studyTitle: 'Hepatoprotective and Hypolipidemic Activity of Citrus Bergamot Polyphenols',
        citation: 'Phytomedicine International Journal, Vol 18, Issues 15',
        keyFinding: 'Clinical intervention trials showed that Citrus Bergamot intake decreased total cholesterol by 31%, LDL by 39%, and triglycerides by 42.6%, while dramatically increasing protective HDL by 22.3% over 30 days.'
      }
    ],
    realisticGains: 'Substantial cardiovascular lipid protection. Expect a realistic 15% to 25% reduction in circulating LDL particles and up to a 20% increase in protective HDL fractions within 30 days of consistent use under cycle strain.',
    dietaryInteraction: 'Consume twice daily alongside fat-containing whole meals (like whole eggs, avocado, or nuts) to elevate flavonoid lipid-solubility and cellular absorption.'
  },
  {
    id: 'coq10-ubiquinol',
    name: 'CoQ10 (Ubiquinol)',
    chemicalName: 'Coenzyme Q10 Active Ubiquinol',
    category: 'longevity',
    description: 'The highly bioavailable, reduced form of Coenzyme Q10. A critical biochemical compound in cellular ATP energy generation, offering powerful cardiovascular and mitochondrial support against androgen-induced oxidative strain.',
    clinicalResearch: 'Serves as an essential electron carrier in the cardiac mitochondrial respiratory chain. Ubiquinol protects cellular membranes from fat peroxidation and helps stabilize systemic blood pressure levels on cycle.',
    typicalDosage: '100 mg - 200 mg daily',
    frequencyText: 'Taken orally as a pill (lipid softgel) once daily, preferably with a fat-containing meal to maximize uptake.',
    halfLife: 'Approx. 33 hours',
    benefits: [
      'Plus (+): Dramatically neutralizes oxidative stress in vascular and cardiac tissues',
      'Plus (+): Aids in maintaining normal, non-elevated blood pressure ranges',
      'Plus (+): Restores active mitochondria energy outputs and reduces cycle-induced lethargy',
      'Plus (+): Optimizes systemic heart muscle efficiency and general longevity'
    ],
    sideEffects: [
      'Minus (-): Very rare mild stomach rumble or wakefulness if taken late at night'
    ],
    suggestedCycleWeeks: 'Consistently cycled everyday, particularly critical during high-androgen phases to minimize cardiovascular load.',
    deliveryForm: 'pill',
    clinicalStudies: [
      {
        studyTitle: 'Coenzyme Q10 and Cardiovascular Health: Clinical Evidence in Antioxidant Therapy',
        citation: 'BioFactors Cellular Signaling, Vol 32, Issue 4',
        keyFinding: 'Supplementation with active Ubiquinol improved left ventricular ejection fraction and supported robust systemic endothelial function, reducing vascular strain.'
      }
    ],
    realisticGains: 'Vastly improved cardiac efficiency and cellular stamina. Expect resting blood pressure metrics to decrease by 5-10 mmHg (systolic & diastolic) if elevated on cycle within 3 weeks of continuous use. Significantly curbs the chronic fatigue or lethargy associated with aggressive cardiotoxic cycle protocols.',
    dietaryInteraction: 'CoQ10 is extremely hydrophobic and fat-soluble. To achieve high systemic bioavailability, always ingest CoQ10 alongside fat-rich meals containing whole eggs, red meat, avocados, or wild-caught fish oils.'
  },
  {
    id: 'vitamin-d3-k2',
    name: 'Vitamin D3 + K2',
    chemicalName: 'Cholecalciferol & Menaquinone-7 Complex',
    category: 'longevity',
    description: 'A synergistic fat-soluble vitamin pairing. D3 regulates immune defenses and natural hormone production, while K2 (as MK-7) directs calcium deposition directly into bone tissues, keeping it out of arterial pathways to prevent vascular calcification during cycles.',
    clinicalResearch: 'D3 acts fundamentally as a pre-hormone, modulating endocrine expression and supporting luteinizing hormone receptor activity. K2 activates osteocalcin and matrix Gla-protein (MGP), preventing arterial stiffness and maintaining cardiac safety.',
    typicalDosage: '5000 IU D3 + 100 mcg K2 daily',
    frequencyText: 'Taken orally as a capsule softgel once daily with your largest lipid-containing meal.',
    halfLife: 'D3: Approx. 15 days, K2: Approx. 72 hours',
    benefits: [
      'Plus (+): Supports healthy baseline endogenous hormone synthesis and receptor density',
      'Plus (+): Prevents ectopic arterial calcification and structural blood vessel stiffness',
      'Plus (+): Improves muscle contraction speed, power density, and cellular repair rates',
      'Plus (+): Enhances natural immunity and supports deep sleep and neurotransmitter balance'
    ],
    sideEffects: [
      'Minus (-): Virtually none at physiological doses. Crucial to verify serum levels periodically.'
    ],
    suggestedCycleWeeks: 'Used year-round to stabilize cellular hormone baselines and ensure deep cardiovascular safety.',
    deliveryForm: 'pill',
    clinicalStudies: [
      {
        studyTitle: 'Synergistic Effect of Combined Vitamin D3 and Vitamin K2 on Bone and Vascular Health',
        citation: 'International Journal of Endocrinology, Vol 2017',
        keyFinding: 'Clinical data showed that combined supplementation of D3 and K2 supports cardiac protection by inhibiting coronary artery calcification, while significantly enhancing serum testosterone precursors.'
      }
    ],
    realisticGains: 'Robust immunological resilience, skeletal bone defense, and endocrine stabilization. Maintains strong testosterone precursor synthesis during recovery, and prevents dangerous calcification inside arterial blood vessel walls under cycle strains.',
    dietaryInteraction: 'D3 and K2 are highly lipophilic fat-soluble vitamins. Always consume in the morning alongside whole food lipids (egg yolks, dairy fats, or seed oils). Avoid taking near high-fiber meals, which can physically bind to fat-soluble nutrients and inhibit absorption.'
  },
  {
    id: 'milk-thistle-silymarin',
    name: 'Milk Thistle',
    chemicalName: 'Silymarin / Silybin Phytosome',
    category: 'healing',
    description: 'A traditional botanical cardioprotectant and hepatoprotectant extract. Contains Silymarin, a powerful flavonoid complex that stabilizes liver cell membranes and blocks toxic cellular uptake.',
    clinicalResearch: 'Silymarin alters outer hepatocyte cell membranes, preventing foreign chemical toxins from entering cells. It stimulates ribosomal RNA protein synthesis, directly speeding up liver tissue regeneration and repair.',
    typicalDosage: '175 mg - 500 mg daily',
    frequencyText: 'Taken orally as capsule daily, ideally split with morning and evening food.',
    halfLife: 'Approx. 6 hours',
    benefits: [
      'Plus (+): Provides a secondary layer of protection for liver cell borders under chemical strain',
      'Plus (+): Supports fast ALT/AST enzyme stabilization post-cycle',
      'Plus (+): Acts as a potent lipid-soluble free radical scavenger',
      'Plus (+): Encourages protein synthesis within liver cells to promote natural cellular healing'
    ],
    sideEffects: [
      'Minus (-): Mild digestive laxative effect at very high doses',
      'Minus (-): Rare mild allergic reactions in individuals sensitive to ragweed'
    ],
    suggestedCycleWeeks: 'Taken alongside liver-stressing oral compounds or during transition recovery bridging.',
    deliveryForm: 'pill',
    clinicalStudies: [
      {
        studyTitle: 'Silymarin Clinical trials on Liver Diseases and Hepatic Integrity',
        citation: 'World Journal of Gastroenterology, Vol 20, Issue 39',
        keyFinding: 'Patients treated with Silymarin showed significant decreases in liver enzyme levels (AST/ALT) and improved antioxidant parameters of hepatocytes facing heavy toxic loads.'
      }
    ],
    realisticGains: 'Mild hepatic cell membrane security. Slows the cellular degeneration rate of hepatocytes when exposed to oral anabolics, facilitating natural liver cell regeneration and helping return AST/ALT values back to baseline within 4 weeks post-cycle.',
    dietaryInteraction: 'Take twice daily with a protein-dense meal. Silymarin has low native bioavailability on its own; pairing it with black pepper extract (piperine) or taking it alongside lipids can increase intestinal absorption by 2x to 3x.'
  },
  {
    id: 'bpc-tb-healing-blend',
    name: 'Wolverine Healing Blend [BLEND]',
    chemicalName: 'BPC-157 (5mg) + TB-500 (5mg) Co-Reconstitution',
    category: 'healing',
    description: 'A custom pre-mixed synergistic blend combining Body Protection Compound 157 and Thymosin Beta-4. It is engineered to trigger tissue repair from multiple angles simultaneously: BPC-157 stimulates rapid localized angiogenesis and collagen fibroblast growth, while TB-500 accelerates cell migration and actin polymerization to dissolve chronic scar tissue.',
    clinicalResearch: 'Multiple clinical and laboratory animal models confirm that combining G-protein-coupled healing regulators (such as BPC-157) with actin-binding factors (TB-500) results in a powerful healing synergy. Together, they orchestrate up-regulated gene expression, capillary growth, and muscular elasticity, resulting in recovery speeds up to 2x faster than using either peptide in isolation.',
    typicalDosage: '250 mcg BPC / 250 mcg TB-500 twice daily',
    frequencyText: 'Administered via subcutaneous or localized dry-needle injections twice daily, ideally placed near the injured tendon or joint.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to the pre-blended 5mg BPC-157 + 5mg TB-500 vial. This yields a concentration of 250 mcg of each peptide per 10 units (0.1 ml) on a U100 insulin syringe.',
    halfLife: 'BPC-157: ~4 Hours | TB-500: ~7 Days',
    benefits: [
      'Plus (+): Double-action healing that accelerates tendon, collateral ligament, and cartilage reconstruction at twice the normal speed',
      'Plus (+): Heavily minimizes persistent scar tissue formation and restores tissue elasticity',
      'Plus (+): Provides profound localized anti-inflammatory relief, easing joint stiffness',
      'Plus (+): Rebuilds compromised stomach lining and resolves leaky gut issues systemically'
    ],
    sideEffects: [
      'Minus (-): Transient injection site burning or standard localized itching',
      'Minus (-): Slight, passing head rush immediately post-shot',
      'Minus (-): Mild fatigue or drowsiness if administered during busy daylight hours'
    ],
    suggestedCycleWeeks: '6 - 12 weeks of continuous administration, followed by a 4-week wash period.',
    deliveryForm: 'peptide',
    realisticGains: 'Expect a remarkable 50% to 75% reduction in biological healing timelines for acute ligament sprains, tendonitis, or muscle tears. Chronic joint irritation and range-of-motion limitations are noticeably relieved within 10 to 14 days, allowing a return to heavy resistance training without structural relapse. No muscle hypertrophy.',
    dietaryInteraction: 'Highly synergistic with daily supplementation of 15g - 20g of high-quality hydrolyzed Bovine Collagen peptides and 1,000mg of Vitamin C to serve as the structural substrates for new collagen synthesis. Completely omit highly processed, inflammatory seed oils and excess refined sugars to maximize therapeutic healing speeds.'
  },
  {
    id: 'cjc-ipam-somato-blend',
    name: 'Somatic Secretagogue [BLEND]',
    chemicalName: 'CJC-1295 No DAC (5mg) + Ipamorelin (5mg) Blend',
    category: 'longevity',
    description: 'The definitive Growth Hormone Releasing Hormone (GHRH) and Growth Hormone Releasing Peptide (GHRP) synergistic pairing. Combining CJC-1295 (without Drug Affinity Complex) and Ipamorelin triggers a powerful, clean, pulsatile surge of endogenous growth hormone from the pituitary. It bypasses somatostatin inhibitory blockages without elevating prolactin, cortisol, or obsessive hunger.',
    clinicalResearch: 'Pituitary somatotropic cells contain distinct receptors for GHRH and GHRP. Laboratory assays demonstrate that when a GHRH analogue (CJC-1295) and a GHS agonist (Ipamorelin) are co-administered, their signaling pathways cooperate, resulting in a synergistic (multiplicative) growth hormone secretion up to 5x greater than singular usage.',
    typicalDosage: '100 mcg CJC / 100 mcg Ipamorelin once or twice daily',
    frequencyText: 'Injected subcutaneously on an empty, fasting stomach—preferably prior to sleep or early morning.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to the 5mg + 5mg (10mg total) pre-blended vial. Pulling to exactly 4 units on a standard U100 insulin syringe yields a dose of 100 mcg of each active compound.',
    halfLife: 'CJC-1295 No DAC: ~30 Min | Ipamorelin: ~2 Hours',
    benefits: [
      'Plus (+): Multiplies natural growth hormone pulses safely by 300% to 500%',
      'Plus (+): Substantially deepens slow-wave deep sleep, enhancing nocturnal physical recovery',
      'Plus (+): Accelerates systemic collagen remodeling, skin cellular thickness, and nail growth',
      'Plus (+): Drives steady, muscle-sparing fat oxidation and dry body recomposition'
    ],
    sideEffects: [
      'Minus (-): Mild head flush, warmth, or direct blood pressure rush lasting 10 minutes post-dose',
      'Minus (-): Potential target-nerve tingling in fingers or ankles (mild water-shift pressure)',
      'Minus (-): Slight sleepiness if taken during hours of daylight executive demand'
    ],
    suggestedCycleWeeks: '12 - 24 weeks for structural facial rejuvenation and lean tissue stabilization.',
    deliveryForm: 'peptide',
    realisticGains: 'Exceptional sleep consolidation and cellular skin rejuvenation. Provides deep, restorative sleep from Night 1, yielding high waking alertness. Within 4 to 6 weeks, skin tone, hair thickness, and nail speed increase noticeably. By week 12, a steady 3% to 5% reduction in body fat is achieved without causing water bloat.',
    dietaryInteraction: 'STRICT INJECTION PROTOCOL: Administer strictly on a 100% fasting stomach (minimum 2 hours post-meal) and maintain complete starvation for 30 to 45 minutes after dosing. Any increase in circulating glucose or insulin recruits Somatostatin, which immediately neutralizes the pituitary growth hormone pulse.'
  },
  {
    id: 'tirzepatide-bpc-shred-blend',
    name: 'Metabolic Shred & Shield [BLEND]',
    chemicalName: 'Tirzepatide (10mg) + BPC-157 (5mg) Gut-Shield',
    category: 'weight_loss',
    description: 'An advanced medical-wellness blend combining the dual GLP-1/GIP receptor agonist Tirzepatide with the gut-lining and joint protective peptide BPC-157. Formulated to neutralize common GLP-1 gastrointestinal side effects while facilitating rapid weight loss and safeguarding active joint and muscle tissues from deficit-induced catabolism.',
    clinicalResearch: 'Clinical observations indicate that delayed gastric transit from Tirzepatide can occasionally trigger stomach tissue irritation, heartburn, or mild nausea. Co-administering BPC-157 upregulates mucosal gastric defense mechanisms, preventing inflammation. BPC-157 also preserves existing tendon and muscle structures during deep caloric deficits.',
    typicalDosage: '2.5 mg Tirzepatide / 250 mcg BPC-157 weekly (with daily BPC-157 sub-Q top-offs)',
    frequencyText: 'Administered subcutaneously once weekly for the metabolic Tirzepatide dose, paired with optional daily sub-Q micro-doses of BPC-157.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to the 10mg + 5mg blend vial. Titrate dosage carefully following medical and weight-loss guidelines.',
    halfLife: 'Tirzepatide: ~5 Days | BPC-157: ~4 Hours',
    benefits: [
      'Plus (+): Highly aggressive subcutaneous and visceral abdominal fat reduction',
      'Plus (+): Drastically shields the stomach lining, preventing GLP-1 induced nausea or acid reflux',
      'Plus (+): Completely silences obsessive food searches and psychological appetite cravings',
      'Plus (+): Safeguards critical skeletal joints and tendons from breaking down under nutritional deficits',
      'Plus (+): Establishes steady, flatline cardiovascular glycemic control'
    ],
    sideEffects: [
      'Minus (-): Mild gastrointestinal slow-down or temporary constipation',
      'Minus (-): Suppresses natural physical thirst, creating a subtle risk of dehydration',
      'Minus (-): Minor subcutaneous redness or localized skin sensitivity'
    ],
    suggestedCycleWeeks: '12 - 24 weeks alongside active metabolic body restructuring.',
    deliveryForm: 'peptide',
    realisticGains: 'Viscose fat will melt away rapidly. Expect highly comfortable, nausea-free fat loss averaging 1.5 to 3.0 lbs weekly once therapeutic tiers are reached. Existing joint strains and tendon issues remain solid and protected even under heavy gym weights.',
    dietaryInteraction: 'Maintain a minimum fiber baseline of 30g daily and drink 3.5+ liters of mineralized water to maintain regular digestion. Consume 0.8g to 1.0g of protein per lb of bodyweight to force the body to burn storage fat rather than precious skeletal lean mass.'
  },
  {
    id: 'semax-selank-cognitive-blend',
    name: 'Neuro-Focus & Calm [BLEND]',
    chemicalName: 'Semax (10mg) + Selank (10mg) Nootropic Complex',
    category: 'cognitive',
    description: 'A cutting-edge neuroregulatory peptide blend pairing Semax (a synthetic ACTH fragment) with Selank (a synthetic Tuftsin analogue). Together, they synthesize a balanced, highly productive focus state: Semax upregulates Brain-Derived Neurotrophic Factor (BDNF) for memory and executive processing, while Selank promotes GABAergic activity to block anxiety and nervous system distraction.',
    clinicalResearch: 'Comprehensive neurological studies show that Semax elevates BDNF and Nerve Growth Factor (NGF) in the brain, improving synaptogenesis. Concurrently, Selank modulates serotonin and GABA receptors, preventing emotional overwhelm. The combined profile provides clean cognitive drive without causing heart palpitations, high blood pressure, or stimulant crashes.',
    typicalDosage: '250 mcg Semax / 250 mcg Selank twice daily',
    frequencyText: 'Administered intranasally (nasal spray pumps) or subcutaneously in the morning and early afternoon.',
    reconstitutionText: 'Reconstitute the 10mg + 10mg vial with 2.0 ml of Sterile Water (or direct saline) for nasal spray dispensers. Generates 250 mcg of each active peptide per nasal pump.',
    halfLife: 'Semax: ~30 Min | Selank: ~2 Hours (with day-long downstream neurological activation)',
    benefits: [
      'Plus (+): Upregulates BDNF and NGF by up to 200%, dramatically enhancing memory formation and recall speed',
      'Plus (+): Silences obsessive anxiety loops, physical jitters, and stressful sensory overload',
      'Plus (+): Improves verbal fluency, logical processing, and executive decision-making speed',
      'Plus (+): Zero stimulant crash, physical dependence, or sleeping schedule disruption'
    ],
    sideEffects: [
      'Minus (-): Mild local nasal dryness or temporary tingling using nasal spray deliveries',
      'Minus (-): Sustained mental alertness that can delay sleep if administered after 6:00 PM',
      'Minus (-): Slight increase in dream vividness or memory recall during night sleep'
    ],
    suggestedCycleWeeks: '4 - 8 weeks during high-demand cognitive projects or study periods, rested for 2 weeks.',
    deliveryForm: 'peptide',
    realisticGains: 'Expect a rapid, stable transition into crystal-clear mental focus within 30 minutes of dosing. Generates a 30% to 40% gain in daily work endurance, eliminating procrastination. Severe mental stress and anxiety are comfortably muted without inducing brain fog or sluggish laziness.',
    dietaryInteraction: 'Highly synergistic when paired with 300mg of dietary Alpha-GPC (Choline) and 200mg of L-Theanine daily to provide the acetylcholine and neural precursor substrates required for boosted synaptic signaling.'
  },
  {
    id: 'ghk-cu-epitalon-glow-blend',
    name: 'Glow (Klow) Skin & Cellular [BLEND]',
    chemicalName: 'GHK-Cu (50mg) + Epitalon (50mg) Rejuvenation Complex',
    category: 'longevity',
    description: 'The definitive anti-aging and skin health peptide pairing, widely referred to as the Glow (or Klow) blend. Combining the pineal-enhancing telomerase activator Epitalon with copper-complexed GHK-Cu, this synergistic blend targets cellular longevity from the inside out. Epitalon resets biological clocks and elongates telomeres, while GHK-Cu accelerates subcutaneous dermal remodeling, wound healing, and collagen synthesis.',
    clinicalResearch: 'Dermal assays indicate GHK-Cu significantly upregulates type I collagen, glycosaminoglycans, and blood vessel formation. Conversely, molecular research shows Epitalon stimulates telomerase activity in human fibroblasts, extending cellular replication limits (the Hayflick Limit) and restoring nocturnal pineal melatonin secretion patterns.',
    typicalDosage: '1.5 mg GHK-Cu / 1.5 mg Epitalon daily',
    frequencyText: 'Injected subcutaneously once daily, preferably before sleep to align with pineal restoration.',
    reconstitutionText: 'Add 3.0 ml of Bacteriostatic Water to the 100mg total blend vial. Pulling to 9 units on a standard U100 insulin syringe delivers a dose of 1.5 mg of each compound.',
    halfLife: 'GHK-Cu: ~1 hour (local binding) | Epitalon: ~1 hour (day-long epigenetic cascade)',
    benefits: [
      'Plus (+): Dramatically enhances skin elasticity, moisture barrier, and visual radiance (your natural "glow")',
      'Plus (+): Stimulates follicular vascularization to increase hair thickness and slow loss',
      'Plus (+): Optimizes pineal gland activity to restore deep Delta sleep and circadian rhythms',
      'Plus (+): Induces systemic anti-senescence pathways by expanding replication boundaries in critical cell lines'
    ],
    sideEffects: [
      'Minus (-): Stinging or mild localized burning at the injection site (typical of copper combinations)',
      'Minus (-): Temporary metallic taste in the mouth shortly after administration',
      'Minus (-): Mild head flush or transient blood pressure drop during the first 5 minutes'
    ],
    suggestedCycleWeeks: '6 - 12 weeks during restorative cycles, followed by a 12-week wash period.',
    deliveryForm: 'peptide',
    realisticGains: 'Visible complexion evening, enhanced skin firmness, and a massive boost in deep sleep quality. Overnight sleep architectures feel locked-in from week 1. By week 4, fine lines start smoothing and scalp shedding decreases. Perfect for comprehensive bio-hacking.',
    dietaryInteraction: 'Maintain steady nutritional intake of trace minerals, particularly extra Zinc (15mg - 30mg daily) to offset the high systemic intake of Copper from GHK-Cu, balancing the core Zn/Cu ratio.'
  },
  {
    id: 'semaglutide-l-carnitine-shred-blend',
    name: 'Metabolic Shred (Slight-Lean) [BLEND]',
    chemicalName: 'Semaglutide (5mg) + L-Carnitine (500mg) Synergy Complex',
    category: 'weight_loss',
    description: 'A cutting-edge double-mechanism metabolic blend. Semaglutide acts centrally to slow digestion and suppress hunger cues, while L-Carnitine acts cell-side to upregulate mitochondrial transfer of fatty acids so they can be burned for active ATP energy. This limits the muscle fatigue and sluggishness commonly reported with caloric deficits on GLP-1 therapy.',
    clinicalResearch: 'GLP-1 receptor activation significantly suppresses hepatic gluconeogenesis and coordinates central neurotransmitter appetite suppression, while L-carnitine administration rescues lipid oxidation indices in skeletal myocytes, enhancing free fatty acid transport across the inner mitochondrial membrane.',
    typicalDosage: '0.25 mg Semaglutide / 25 mg L-Carnitine weekly',
    frequencyText: 'Injected subcutaneously once weekly. Dosage titrated upward monthly depending on individual fat loss velocity and feedback.',
    reconstitutionText: 'This blend is typically supplied pre-compounded as an injectable solution. Check standard clinical vials for exact dosage matching.',
    halfLife: 'Semaglutide: ~7 Days | L-Carnitine: ~15 Hours',
    benefits: [
      'Plus (+): Accelerates visceral fat oxidation while maintaining lean physical endurance',
      'Plus (+): Drastically suppresses systemic food noise and sugars/carbs cravings',
      'Plus (+): Boosts free cellular energy and prevents diet-induced brain fog',
      'Plus (+): Enhances cardiovascular output and skeletal muscle stamina'
    ],
    sideEffects: [
      'Minus (-): Mild initial nausea, transient reflux, or abdominal fullness',
      'Minus (-): Sublingual thirst reduction requiring active hydration reminders',
      'Minus (-): Potential localized muscle ache near the site of injection'
    ],
    suggestedCycleWeeks: '12 - 24 weeks alongside active body fat minimization protocols.',
    deliveryForm: 'peptide',
    realisticGains: 'Steady, highly energetic fat reduction averaging 1.5 to 2.5 Lbs per week, accompanied by enhanced gym cardiovascular stamina rather than the raw fatigue common during standard dieting.',
    dietaryInteraction: 'Pair with early morning cardiovascular training when blood glucose is at baseline to maximize the fatty-acid transport efficacy generated by L-Carnitine.'
  },
  {
    id: 'pt141-melanotan2-synergy-blend',
    name: 'Barbie & Ken Love Synergy [BLEND]',
    chemicalName: 'PT-141 Bremelanotide (10mg) + Melanotan II (10mg) Blend',
    category: 'sexual_health',
    description: 'An ultra-popular dual melanocortin agonist blend. Melanotan II targets MC1R and MC4R to trigger rapid skin hyperpigmentation, building a deep, sunless protective tan. PT-141 (Bremelanotide) selectively acts on MC3R and MC4R in the central nervous system to rapidly boost neurological sexual desire and erectile function, creating intense systemic synergy.',
    clinicalResearch: 'Melanotans invoke potent central nervous system neurotransmission pathways. PT-141 acts on neural pathways in the brain to facilitate sexual excitation response, while MT-II targets follicular pigment pathways, stimulating eumelanin synthesis for accelerated dermal pigmentation.',
    typicalDosage: '1.5 mg PT-141 / 1.5 mg MT-II per administration',
    frequencyText: 'Injected subcutaneously on an as-needed basis, typically 4 to 6 hours prior to anticipated activity or light exposure.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to the 20mg combined blend vial. This yields a concentration of 1.0 mg of each active peptide per 10 units (0.1 ml) on an insulin syringe.',
    halfLife: 'PT-141: ~2.5 Hours | Melanotan II: ~2 Hours (with prolonged downstream skin/libido duration)',
    benefits: [
      'Plus (+): Builds a smooth, highly uniform dark skin tan with minimal UV-light exposure',
      'Plus (+): Significantly increases raw physiological libido and relational performance',
      'Plus (+): Suppresses central food cravings and enhances core vascular warmth',
      'Plus (+): Restores natural responsive erectile and libido mechanisms'
    ],
    sideEffects: [
      'Minus (-): Temporary mild nausea or standard face flushing for 30 minutes post-injection',
      'Minus (-): Transient yawning and minor stretch reflexes as dopamine systems stimulate',
      'Minus (-): Rapid development of freckles or localized skin spot darkening if overusing UV exposure'
    ],
    suggestedCycleWeeks: 'Used intermittently as needed, or up to 4 - 6 weeks for active tanning initialization.',
    deliveryForm: 'peptide',
    realisticGains: 'Rapid, profound activation of relational arousal within 2 to 6 hours. Within 10 to 14 days of low-dose usage, a rich bronze skin pigmentation develops that lasts for months with nominal sun exposure.',
    dietaryInteraction: 'Take on a relatively empty stomach or paired with anti-nausea options like peppermint extract if sensitive to the melanocortin-induced satiety reflex.'
  },
  {
    id: 'ta1-thymulin-immune-blend',
    name: 'Immune Guard Super Shield [BLEND]',
    chemicalName: 'Thymosin Alpha-1 (10mg) + Thymulin (10mg) Blend',
    category: 'healing',
    description: 'A preeminent dual thymus-derived peptide blend focused entirely on rebuilding immune resilience. Thymosin Alpha-1 upregulates T-cell helper and natural killer cell activity, while Thymulin binds copper to modulate broad cytokine responses and downregulate inflammatory signaling, safeguarding the body under physical cycle stress.',
    clinicalResearch: 'Clinical evaluations of Thymosin Alpha-1 show increased expression of major histocompatibility complex (MHC) class I, leading to enhanced viral clearance. Thymulin, an peptide hormone produced by thymic epithelial cells, modulates pro-inflammatory cytokines such as TNF-alpha and IL-6 to keep immune markers healthy.',
    typicalDosage: '1.5 mg TA1 / 1.5 mg Thymulin daily',
    frequencyText: 'Injected subcutaneously once daily during periods of high physiological stress, infection, or cycle transitions.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to the 20mg combined thymus blend vial. This yields a concentration of 1.0 mg of each active peptide per 10 units (0.1 ml) on an insulin syringe.',
    halfLife: 'Thymosin Alpha-1: ~2 hours | Thymulin: ~1.5 hours (with persistent immune resetting effect)',
    benefits: [
      'Plus (+): Restores balanced, defensive T-cell populations and cellular antibody production',
      'Plus (+): Reduces autoimmune flare-ups and suppresses long-term chronic cytokine signaling',
      'Plus (+): Enhances wound healing speed and accelerates nervous system recovery',
      'Plus (+): Rebuilds systemic immunotolerance post heavy chemical cycles'
    ],
    sideEffects: [
      'Minus (-): Mild local skin redness or localized itching at the injection point',
      'Minus (-): Transient systemic warmth or a sense of mild immune activation',
      'Minus (-): Slight, temporary lymph node tenderness as immune cells mobilize'
    ],
    suggestedCycleWeeks: '2 - 4 weeks during peak immune vulnerability or cycle PCT transitions.',
    deliveryForm: 'peptide',
    realisticGains: 'Saves the immune system from stress-induced crash. Complete protection against opportunistic seasonal infections. Muscle and joint tissue inflammation will feel subdued, and overall core systemic resilience is rapidly restored.',
    dietaryInteraction: 'Maintain abundant dietary Zinc (30mg daily) and Vitamin D3/K2 to provide the key metabolic co-factors that thymus gland peptides utilize to activate native immune cells.'
  },
  {
    id: 'anadrol-oxymetholone',
    name: 'Anadrol',
    chemicalName: 'Oxymetholone (Oral DHT Derivative)',
    category: 'muscle',
    description: 'One of the most powerful and fast-acting oral anabolic steroids in existence. Extensively deployed by powerlifters and bodybuilders looking to break strength plateaus and pack on massive overall size in record timelines.',
    clinicalResearch: 'Oxymetholone aggressively stimulates erythropoietin (EPO), resulting in an unprecedented increase in red blood cell volume and oxygen transportation. It upregulates protein synthesis while stimulating intense fluid accumulation within muscle cells, protecting joints under extreme loads.',
    typicalDosage: '25 mg - 100 mg daily',
    frequencyText: 'Taken orally in pill format daily, usually split or consumed 1-2 hours pre-workout.',
    halfLife: 'Approx. 9 hours',
    benefits: [
      'Plus (+): Unprecedented, lightning-fast increases in raw muscular lifting power and bone leverage',
      'Plus (+): Extreme muscular hydration and glycogen swelling, creating a massive, round physical look',
      'Plus (+): Aggressive red blood cell generation, delivering muscle pumps that delay fatigue',
      'Plus (+): Pads and lubricates heavy joint structures via local intracellular fluid retention'
    ],
    sideEffects: [
      'Minus (-): Heavy liver stress (highly hepatotoxic 17-alpha-alkylated structure)',
      'Minus (-): Intense fluid retention, potentially elevating systemic blood pressure levels rapidly',
      'Minus (-): Strong androgenic impacts (acne, male pattern hair loss, prostate symptoms)',
      'Minus (-): Drastic lipid deterioration, crushing protective HDL and driving up LDL fractions'
    ],
    suggestedCycleWeeks: '4 - 6 weeks maximum due to extreme cardiovascular and hepatic strain.',
    deliveryForm: 'pill',
    realisticGains: 'Explosive gains. Expect to gain between 10.0 and 15.0 lbs of bodyweight inside the first 3 to 4 weeks of administration, coupled with a 20% to 30% surge in raw lifting strength. Note that a portion of this initial weight is intramuscular water and glycogen, which will normalize post-cycle.',
    dietaryInteraction: 'Take alongside powerful liver-protectants like 1000mg of NAC and 500mg of TUDCA daily. Limit dietary sodium strictly to mitigate high fluid pressure and heart strain. Highly synergistic with a high-calorie bulk diet (400-500 kcal surplus) rich in clean proteins.'
  },
  {
    id: 'superdrol-methasterone',
    name: 'Superdrol',
    chemicalName: 'Methasterone (Oral Designer Steroid)',
    category: 'muscle',
    description: 'An extremely potent oral anabolic steroid derived from drostanolone. Often termed "oral masteron on steroids," it is highly revered for building incredibly dry, dense, and full muscle structures without any estrogenic conversion.',
    clinicalResearch: 'Methasterone is a 17-alpha-alkylated steroid with high anabolic-to-androgenic separation. It drives massive intracellular glycogen and fluid loading into skeletal muscle cells without converting to estrogen, keeping the muscle cosmetic totally dry.',
    typicalDosage: '10 mg - 20 mg daily',
    frequencyText: 'Taken orally in tablet form daily, typically limited to short bursts.',
    halfLife: 'Approx. 8 hours',
    benefits: [
      'Plus (+): Near-instantaneous muscle hardening, vascular separation, and "3D" fullness',
      'Plus (+): Drastic strength increases with zero estrogen conversion or subcutaneous water logging',
      'Plus (+): Aggressive nutrient partitioning, channeling dietary carbs directly into muscle beds',
      'Plus (+): Extremely fast visual physique transformations within 7 to 10 days'
    ],
    sideEffects: [
      'Minus (-): Harsh liver stress (AST/ALT enzymes can spike dramatically within days)',
      'Minus (-): Severe lethargy and loss of natural appetite, making food consumption difficult',
      'Minus (-): Extreme muscle pumps (such as lower back pumps) that can restrict training movement',
      'Minus (-): Devastating lipid disruption, reducing protective HDL cholesterol to near-zero'
    ],
    suggestedCycleWeeks: '3 - 4 weeks maximum due to rapid, severe liver and cholesterol strain.',
    deliveryForm: 'pill',
    realisticGains: 'Expect to gain 4.0 to 8.0 lbs of 100% dry, permanent contractile muscle tissue over a 3-week exposure, paired with a massive cosmetic drying out of the skin. Physical strength spikes are extreme, enabling immediate lifting PRs.',
    dietaryInteraction: 'Mandatory intake of TUDCA (500mg daily) and NAC (1200mg daily) is essential to preserve liver integrity. Take with a highly structured carbohydrate-dense diet to feed Superdrol\'s intense intramuscular glycogen loading, and ensure high taurine intake (3-5g daily) to prevent severe lower-back cramping.'
  },
  {
    id: 'equipoise-boldenone',
    name: 'Equipoise',
    chemicalName: 'Boldenone Undecylenate (Oil)',
    category: 'muscle',
    description: 'A long-acting injectable veterinary-turned-human anabolic steroid structurally related to testosterone. It is highly valued for delivering clean, steady muscle growth, extreme athletic endurance, and massive vascularity over extended cycle periods.',
    clinicalResearch: 'Boldenone is a 1-dehydro derivative of testosterone. It exhibits highly favorable nitrogen retention and protein synthesis properties while converting to estrogen at only half the rate of testosterone, minimizing fluid retention.',
    typicalDosage: '300 mg - 600 mg weekly',
    frequencyText: 'Injected intramuscularly once or twice weekly in slow-acting oil volumes.',
    halfLife: 'Approx. 14 days (extremely long ester)',
    benefits: [
      'Plus (+): Steady, high-quality lean muscle fiber development with very low fluid logging',
      'Plus (+): Massive boost in red blood cells, delivering unparalleled vascularity and muscular oxygenation',
      'Plus (+): Drastically elevates systemic appetite, helping hardgainers consume high caloric quantities',
      'Plus (+): Highly mild on liver enzymes and possesses low rates of estrogenic side effects'
    ],
    sideEffects: [
      'Minus (-): Slow clearance from the body, requiring a long wait time before commencing a PCT',
      'Minus (-): Can increase hematocrit (blood thickness) to dangerous levels if dosed excessively',
      'Minus (-): Renowned for causing mental anxiety, panic flushes, or paranoia in sensitive users',
      'Minus (-): Suppresses natural testosterone axes completely'
    ],
    suggestedCycleWeeks: '12 - 20 weeks to allow the long undecylenate ester to truly manifest.',
    deliveryForm: 'oil',
    realisticGains: 'Steady, dry, and aesthetic tissue builder. Over an extended 16-week protocol, expect a realistic gain of 7.0 to 12.0 lbs of clean, vascular, permanent muscle tissue with zero water bloat. Cardinal endurance and oxygen stamina are noticeably improved within 4 weeks.',
    dietaryInteraction: 'Because Equipoise can heavily thicken the blood (by over-elevating hematocrit), keep daily hydration high (4+ liters of water) and supplement with 2,000mg of organic Fish Oil daily to support blood flow. Leverage the surge in appetite by feeding the body with highly nutritious whole meals.'
  },
  {
    id: 'halotestin-fluoxymesterone',
    name: 'Halotestin',
    chemicalName: 'Fluoxymesterone (Oral Methylated AAS)',
    category: 'muscle',
    description: 'An extremely potent oral anabolic-androgenic steroid with incredibly strong androgenic properties. It does not convert to estrogen and is used almost exclusively in final weeks of powerlifting pre-contests and athletic combats to force maximum neurological aggression and absolute strength.',
    clinicalResearch: 'Fluoxymesterone belongs to the 17-alpha-methylated family. It causes direct modifications of cells to support hemoglobin production and oxygen transport, while targeting central nervous system receptors directly to trigger peak aggression, raw force, and competitive drive.',
    typicalDosage: '100 mcg - 500 mcg once daily',
    frequencyText: 'Taken orally as a pill daily, usually administered 1-2 hours before heavy strength training or athletic competition.',
    halfLife: 'Approx. 9.2 hours',
    benefits: [
      'Plus (+): Unrivaled leaps in central-nervous strength and explosive power without any weight gain',
      'Plus (+): Promotes peak psychological focus, competitive drive, and lifting aggression',
      'Plus (+): Delivers an extremely dense, hard cosmetic look, forcing water out from beneath the skin',
      'Plus (+): Does not aromatize into Estrogen, eliminating female hormone side effects entirely'
    ],
    sideEffects: [
      'Minus (-): Highly toxic to liver and kidneys (extreme 17aa configuration)',
      'Minus (-): Can cause dangerous behavioral changes, extreme irritability, and unmotivated rage',
      'Minus (-): Severely suppresses the HPG natural hormone axis',
      'Minus (-): Crushes cardiovascular lipids and elevates systemic blood pressure rapidly'
    ],
    suggestedCycleWeeks: '2 - 4 weeks maximum, reserved strictly for pre-contest peak outputs.',
    deliveryForm: 'pill',
    realisticGains: 'Zero muscle mass or weight shifts. Expect an immediate, near-instant 15% to 25% surge in raw neurological lifting power and absolute strength, along with a dense, hardened physical appearance. Muscle leverage handles are secured perfectly.',
    dietaryInteraction: 'Absolutely critical to supplement with extensive liver shield arrays: TUDCA (500mg) and NAC (1200mg) daily. Avoid taking Halotestin alongside any oral stimulants (like Ephedrine or high caffeine) to minimize the risk of cardiovascular panic or dangerous behavioral anger.'
  },
  {
    id: 'kpv-peptide',
    name: 'KPV',
    chemicalName: 'Lysine-Proline-Valine (Tripeptide)',
    category: 'healing',
    description: 'An active tripeptide fragment of alpha-Melanocyte Stimulating Hormone (α-MSH) with extremely powerful immune-modulating and anti-inflammatory pathways, especially in gastrointestinal systems.',
    clinicalResearch: 'KPV works by binding to melanocortin receptors, reducing pro-inflammatory cytokine expression, and directly inhibiting NF-kB signaling pathways. This decreases intestinal mucosal cell destruction and downregulates general skin inflammation.',
    typicalDosage: '200 mcg - 500 mcg once daily',
    frequencyText: 'Administered subcutaneously, orally, or topically as a cream once daily.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 2 mg KPV vial. This yields a concentration of 100 mcg per 10 units (0.1 ml) on a U100 insulin syringe.',
    halfLife: 'Approx. 1.5 hours',
    benefits: [
      'Plus (+): Highly powerful systemic and localized gastrointestinal anti-inflammatory effects',
      'Plus (+): Supports recovery from Ulcerative Colitis, IBS, and Crohn\'s disease symptoms',
      'Plus (+): Relieves severe dermal flare-ups associated with psoriasis and eczema',
      'Plus (+): Exhibits broad-spectrum antimicrobial properties against pathogenic bacteria and Candida'
    ],
    sideEffects: [
      'Minus (-): Occasional mild injection site itching or transient redness',
      'Minus (-): Mild stomach rumbling if taken orally on an empty stomach'
    ],
    suggestedCycleWeeks: '4 - 8 weeks during active inflammatory flares.',
    deliveryForm: 'peptide',
    realisticGains: 'Near-complete resolution of acute gut irritation, micro-bleeding, and inflammatory discomfort within 2 to 3 weeks of continuous therapy. Dramatic easing of localized skin redness and flaky dermal layers.',
    dietaryInteraction: 'Take on an empty stomach or with mild non-inflammatory fats. Limit dietary lectins, gluten, and artificial food dyes to support KPV\'s gut healing and barrier-strengthening mechanisms.'
  },
  {
    id: 'mots-c-peptide',
    name: 'MOTS-c',
    chemicalName: 'Mitochondrial Open Reading Frame of the 12S rRNA Type-c',
    category: 'longevity',
    description: 'An extremely unique mitochondrial-derived peptide of 16 amino acids. It coordinates systemic metabolic homeostasis, mimics exercise benefits, increases insulin sensitivity, and elevates cellular energy levels.',
    clinicalResearch: 'MOTS-c activates the AMPK signaling pathway, which is the primary sensor of cellular energy stress. In clinical models, it significantly boosts glucose uptake, enhances fatty acid oxidation, prevents diet-induced obesity, and preserves muscle mass under metabolic stress.',
    typicalDosage: '5 mg - 10 mg twice weekly',
    frequencyText: 'Administered via subcutaneous injection twice weekly.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 10 mg MOTS-c vial. This yields a concentration of 5 mg per 1.0 ml (100 units on a U100 insulin syringe).',
    halfLife: 'Approx. 4 hours (downstream effects persist for days)',
    benefits: [
      'Plus (+): Stimulates central AMPK pathways, accelerating cellular glucose transport',
      'Plus (+): Mimics high-intensity metabolic workout benefits at a cellular level',
      'Plus (+): Promotes fat oxidation and metabolic rate increases',
      'Plus (+): Promotes mitochondrial biogenesis and structural cellular longevity'
    ],
    sideEffects: [
      'Minus (-): Temporary post-injection fatigue or tiredness (indicates cellular ATP restructuring)',
      'Minus (-): Minor muscle soreness resembling post-exercise tension'
    ],
    suggestedCycleWeeks: '4 - 6 weeks, repeated 2-3 times per year.',
    deliveryForm: 'peptide',
    realisticGains: 'Noticeable enhancement in athletic stamina, exercise recovery times, and metabolic energy levels within 10 days. Supports fat loss of 2.0 to 4.0 lbs of pure lipid tissue over a 4-week protocol with no skeletal muscle loss.',
    dietaryInteraction: 'Extremely responsive to carbohydrate-conscious styling. Pair with low-glycemic, whole foods to accelerate MOTS-c guided fatty acid oxidation and maximize cellular metabolic efficiency.'
  },
  {
    id: 'ss-31-elamipretide',
    name: 'SS-31 (Elamipretide)',
    chemicalName: 'D-Arg-Dmt-Lys-Phe-NH2',
    category: 'longevity',
    description: 'A groundbreaking mitochondria-targeting tetrapeptide that binds selectively to cardiolipin on the inner mitochondrial membrane, optimizing mitochondrial structure and boosting ATP synthesis rapidly.',
    clinicalResearch: 'SS-31 prevents pathological mitochondrial swelling and degradation under metabolic stress. It significantly reduces the production of toxic reactive oxygen species (ROS) while preserving critical respiratory chain supercomplexes, restoring cell energetic efficiency.',
    typicalDosage: '1 mg - 4 mg once daily',
    frequencyText: 'Administered via subcutaneous injection once daily, ideally in the morning.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 10 mg SS-31 vial. This yields a concentration of 1 mg per 20 units (0.2 ml) on a U100 insulin syringe.',
    halfLife: 'Approx. 2 hours (cellular mitochondrial stabilization lasts 24 hours)',
    benefits: [
      'Plus (+): Stabilizes the inner mitochondrial membrane and optimizes cardiolipin structures',
      'Plus (+): Restores cellular ATP (energy) generating capacity in aged or stressed tissues',
      'Plus (+): Drastically lowers cellular reactive oxygen species (ROS) and oxidative stress',
      'Plus (+): Protects micro-vascular cardiovascular systems and promotes muscle tissue endurance'
    ],
    sideEffects: [
      'Minus (-): Injection site warmth or direct mild redness',
      'Minus (-): Occasional passing headache if systemic hydration levels are sub-optimal'
    ],
    suggestedCycleWeeks: '4 - 8 weeks of intensive mitochondrial therapy.',
    deliveryForm: 'peptide',
    realisticGains: 'Extremely rapid improvements in physical stamina, cognitive sharpness, and overall physical endurance within 7 to 10 days. Elevates morning baseline energy states and dramatically accelerates muscular recovery from intense athletic efforts.',
    dietaryInteraction: 'Highly synergistic with Coenzyme Q10 and Alpha-Lipoic Acid. Co-supplementing with clean, healthy phospholipids (such as Sunflower Lecithin) provides structural lipids for cardiolipin membrane restoration.'
  },
  {
    id: 'follistatin-344-myostatin',
    name: 'Follistatin-344',
    chemicalName: 'FST-344 (Myostatin Inhibitor)',
    category: 'muscle',
    description: 'An autocrine glycoprotein encoded by the FST gene. It is a potent inhibitor of myostatin (GDF-8), a signaling peptide that normally suppresses skeletal muscle growth, making it a valuable peptide for rapid skeletal hypertrophy.',
    clinicalResearch: 'Clinical and preclinical studies show that binding of Follistatin to myostatin blocks downstream receptor signaling. This releases the biological limitations on muscle building, allowing rapid muscle cell proliferation and lean tissue development.',
    typicalDosage: '100 mcg daily for 10-20 days',
    frequencyText: 'Injected subcutaneously or intramuscularly inside target muscle groups once daily.',
    reconstitutionText: 'Add 1.0 ml of Sterile Water to a 1 mg Follistatin-344 vial. This yields a concentration of 100 mcg per 10 units (0.1 ml) on a U100 insulin syringe.',
    halfLife: 'Approx. 36 hours',
    benefits: [
      'Plus (+): Strongly blocks myostatin, promoting accelerated skeletal muscle cell size',
      'Plus (+): Boosts myofibrillar density and enhances overall muscle volume',
      'Plus (+): Aids in rebuilding severely wasted or standard atrophied muscle groups',
      'Plus (+): Accelerates joint ligament and muscle tendon recovery'
    ],
    sideEffects: [
      'Minus (-): Can cause localized muscle stiffness or temporary aching',
      'Minus (-): Increased mechanical strain on tendons due to rapid muscle power acquisition',
      'Minus (-): Mild, temporary elevation in core metabolic temperature'
    ],
    suggestedCycleWeeks: '10 - 20 days (typically done as short, targeted shock-therapy phases).',
    deliveryForm: 'peptide',
    realisticGains: 'Incredible, rapid gains. Expect a solid 5.0 to 10.0 lbs of overall lean muscle mass acquisition inside a 20-day intensive loading phase, accompanied by dramatic muscle hardness. Physical lifting milestones are quickly broken.',
    dietaryInteraction: 'Must be paired with a generous caloric surplus and high protein intake (1.2g+ per lb of bodyweight). Take alongside Glucosamine and high-quality collagen to ensure tendon resilience matching accelerated muscle hypertrophy.'
  },
  {
    id: 'aod-9604-anti-obesity',
    name: 'AOD-9604',
    chemicalName: 'Advanced Obesity Drug (HGH Fragment 177-191 Variant)',
    category: 'weight_loss',
    description: 'A modified synthetic variant of the 15 amino acid carboxyl-terminus of human growth hormone (HGH). It targets local fat cells and drives fat oxidation, without modifying systemic blood sugar or IGF-1 levels.',
    clinicalResearch: 'Pre-clinical and clinical trials demonstrate that AOD-9604 selectively stimulates lipolysis (fat breakdown) and inhibits lipogenesis (accumulation of lipid structures in fat cells), especially in stubborn fat deposits. It acts directly without altering insulin sensitivity.',
    typicalDosage: '250 mcg - 500 mcg once daily',
    frequencyText: 'Administered via subcutaneous injection in the morning on an empty stomach.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 5 mg AOD-9604 vial. This yields a concentration of 250 mcg per 10 units (0.1 ml) on a U100 insulin syringe.',
    halfLife: 'Approx. 3 hours',
    benefits: [
      'Plus (+): Highly targeted cellular lipolysis without impacting serum insulin levels',
      'Plus (+): Decreases the conversion of dietary carbohydrates into storage triglycerides',
      'Plus (+): Demonstrates regenerative cartilage-healing benefits in osteoarthritis settings',
      'Plus (+): Excellent safety profile with zero risk of pituitary down-regulation'
    ],
    sideEffects: [
      'Minus (-): Occasional local injection site tingling or mild itching',
      'Minus (-): Mild headache if injected while dehydrated'
    ],
    suggestedCycleWeeks: '8 - 12 weeks of continuous fat loss support.',
    deliveryForm: 'peptide',
    realisticGains: 'Steady, ongoing burning of stubborn adipose fat, particularly around the lower belly and waistline. Expect a progressive loss of 1.0 to 2.0 lbs of subcutaneous body fat per week under a standard caloric deficit, with zero muscle loss.',
    dietaryInteraction: 'MUST be injected fasting in the morning. Fast for at least 30 to 45 minutes post-dose to prevent elevations in insulin from inhibiting AOD-9604\'s lipid-breakdown signaling.'
  },
  {
    id: 'ara-290-neuropathy',
    name: 'ARA-290',
    chemicalName: 'Cibinetide (Innate Repair Receptor Peptide)',
    category: 'healing',
    description: 'A specialized synthetic peptide designed to bind selectively to the Innate Repair Receptor (IRR). It targets neuropathic pain, speeds neural cell repairs, and inhibits severe inflammatory pathways.',
    clinicalResearch: 'Derived from erythropoietin (EPO), ARA-290 represents a non-erythropoietic isoform. It does not elevate red blood cell thickness but is strongly anti-inflammatory, promoting local tissue repair and healing damaged peripheral nerve pain fibers.',
    typicalDosage: '1 mg - 4 mg once daily',
    frequencyText: 'Administered via subcutaneous injection once daily.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to a 10 mg ARA-290 vial. This yields a concentration of 1 mg per 20 units (0.2 ml) on a U100 insulin syringe.',
    halfLife: 'Approx. 2 hours (with prolonged down-stream neuroprotective effects)',
    benefits: [
      'Plus (+): Profoundly reduces chronic neuropathic pain and diabetic nerve discomfort',
      'Plus (+): Direct healing and reconstruction of damaged nerve fibers',
      'Plus (+): Blocks major inflammatory cytokines, protecting systemic tissues',
      'Plus (+): Accelerates general healing of target organs without expanding hematocrit levels'
    ],
    sideEffects: [
      'Minus (-): Mild post-injection skin stinging or localized redness',
      'Minus (-): Passing metallic taste in mouth shortly after administration'
    ],
    suggestedCycleWeeks: '4 - 6 weeks of targeted nerve recovery.',
    deliveryForm: 'peptide',
    realisticGains: 'Significant, steady reduction in burning nerve pain, tingling, and local joint physical sensitivity within 14 days of beginning therapy. Restores neuromuscular pathways and improves motor coordination.',
    dietaryInteraction: 'Ensure high daily intake of active B-vitamins (particularly Methylcobalamin B12 and Folate) and Alpha-Lipoic Acid to supply the biochemical materials needed for myelin nerve sheath reconstruction.'
  },
  {
    id: 'vasoactive-intestinal-peptide-vip',
    name: 'VIP',
    chemicalName: 'Vasoactive Intestinal Peptide (28 amino acid sequence)',
    category: 'lifestyle',
    description: 'A powerful neuropeptide and neuroregulatory hormone that functions as a major systemic vasodilator, immunomodulator, and crucial component of brain-bioxin clearance pathways.',
    clinicalResearch: 'Research shows VIP upregulates pulmonary arterial dilation, modulates immunological responses, and enhances tight junction integrity in the blood-brain barrier. It plays a highly protective role in neurological and respiratory tissues facing biotoxins.',
    typicalDosage: '50 mcg - 200 mcg daily',
    frequencyText: 'Administered via nasal spray pump or sterile subcutaneous injection 1-2 times daily.',
    reconstitutionText: 'For nasal spray formulation, reconstitute 5mg of VIP with 5ml of sterile saline. This creates a concentration of 100 mcg per standard nasal spray pump.',
    halfLife: 'Approx. 2 minutes',
    benefits: [
      'Plus (+): Dramatically downregulates neuroinflammation in Chronic Inflammatory Response Syndrome',
      'Plus (+): Promotes pulmonary health, respiratory lung volume, and reduces arterial strain',
      'Plus (+): Enhances blood-brain barrier integrity and assists in cerebral biotoxin clear-out',
      'Plus (+): Minimizes autoimmune gut flares, restoring intestinal epithelial health'
    ],
    sideEffects: [
      'Minus (-): Transient, passing facial flushing or warm skin sensation immediately post-delivery',
      'Minus (-): Mild nasal drying or sneezing if utilizing nasal spray options',
      'Minus (-): Slight, passing increase in resting heart rate for 5-10 minutes'
    ],
    suggestedCycleWeeks: '8 - 12 weeks of mold/biotoxin protocols.',
    deliveryForm: 'peptide',
    realisticGains: 'Complete clearance of the brain fog, localized joint aches, and chronic fatigue associated with toxic mold exposure within 3 to 4 weeks. Drastically optimizes breathing volume.',
    dietaryInteraction: 'Pairs perfectly with high-solubility dietary fiber or active binding agents (like Cholestyramine) to trap and clear bodily biotoxins as VIP shifts them out of tissues.'
  },
  {
    id: 'npp-nandrolone',
    name: 'NPP',
    chemicalName: 'Nandrolone Phenylpropionate (Short-Ester Nor-testosterone Oil)',
    category: 'muscle',
    description: 'A fast-acting, short-ester version of the legendary anabolic steroid Nandrolone (Deca-Durabolin). Ideal for rapid lean muscle accumulation, strength gains, and profound joint lubrication with quick systemic clearance.',
    clinicalResearch: 'Nandrolone exhibits strong anabolic properties and low rate of androgenic conversion. The short phenylpropionate ester enters blood systems quickly, rapidly stimulating nitrogen retention, cellular protein translation, and collagen synthesis.',
    typicalDosage: '200 mg - 400 mg weekly',
    frequencyText: 'Injected intramuscularly every other day (EOD) due to its short ester half-life.',
    halfLife: 'Approx. 2.5 to 3 days',
    benefits: [
      'Plus (+): Extremely fast and substantial gains in dense, lean muscle tissue',
      'Plus (+): Substantially upregulates collagen synthesis to lubricate and repair aching joints',
      'Plus (+): High nitrogen retention, maintaining a deep, non-catabolic state',
      'Plus (+): Noticeably lower water logging compared to standard long-ester Deca-Durabolin'
    ],
    sideEffects: [
      'Minus (-): Complete suppression of natural endogenous testosterone synthesis',
      'Minus (-): Increases prolactin levels, requiring monitoring of estrogen and progesterone fields',
      'Minus (-): Cardiovascular lipid stress and mild blood viscosity increases'
    ],
    suggestedCycleWeeks: '8 - 12 weeks of structured muscular development.',
    deliveryForm: 'oil',
    realisticGains: 'Profound muscular size and Joint Relief. Expect 8.0 to 12.0 lbs of high-quality contractile muscle mass over a 10-week protocol, while chronic tendonitis or shoulder/knee joint aches disappear within the first 10 days.',
    dietaryInteraction: 'Requires a dedicated calorie surplus with plenty of clean carbs and complete proteins (1g+ per lb). Take alongside active vitamin B6 (P-5-P) at 100mg daily to manage Prolactin levels.'
  },
  {
    id: 'proviron-mesterolone',
    name: 'Proviron',
    chemicalName: 'Mesterolone (Oral 1-Methylated DHT)',
    category: 'muscle',
    description: 'An oral androgenic steroid derived from DHT. It does not convert to estrogen and exhibits an extremely high binding affinity for Sex Hormone-Binding Globulin (SHBG), increasing free testosterone and muscle hardness.',
    clinicalResearch: 'Mesterolone bonds tightly to SHBG. Because SHBG normally binds to circulating testosterone and renders it inactive, Proviron frees up a much larger percentage of bioactive free testosterone, making any stacked steroid cycle perform significantly better.',
    typicalDosage: '25 mg - 75 mg daily',
    frequencyText: 'Taken orally as a pill once or twice daily.',
    halfLife: 'Approx. 12 hours',
    benefits: [
      'Plus (+): Frees up bound testosterone molecules, maximizing stacked cycle performance',
      'Plus (+): Delivers a dry, dense muscle appearance by acting as a mild anti-aromatase',
      'Plus (+): Substantially elevates sexual libido, drive, and vascular performance',
      'Plus (+): Minimal liver stress compared to standard 17-alpha-alkylated oral compounds'
    ],
    sideEffects: [
      'Minus (-): High androgenic potential (sebaceous acne, hair thinning in genetically prone cells)',
      'Minus (-): Suppresses natural testosterone axes (though comparatively milder in isolation)',
      'Minus (-): Lowers protective HDL cholesterol and increases LDL particle counts'
    ],
    suggestedCycleWeeks: '6 - 12 weeks of active cycle enhancement.',
    deliveryForm: 'pill',
    realisticGains: 'Extremely dry, hard muscles with enhanced vascularity and a sharp increase in drive and motivation. Perfect for cutting phases to maintain solid strength states while dieting.',
    dietaryInteraction: 'Take with fat-containing meals to optimize oral absorption. Highly synergistic when coupled with dietary saturated fats (like whole grass-fed beef or organic eggs).'
  },
  {
    id: 'lgd-4033-ligandrol',
    name: 'LGD-4033 (Ligandrol)',
    chemicalName: 'Selective Androgen Receptor Modulator LGD-4033',
    category: 'muscle',
    description: 'One of the most powerful selective androgen receptor modulators (SARMs). It selectively targets androgen receptors in skeletal muscles and bones, producing massive lean tissue growth for overall size build-up.',
    clinicalResearch: 'Ligandrol binds selectively to androgen receptors, demonstrating high tissue selectivity. This allows high anabolic effects in muscle and bone tissue while minimizing androgenic activity in prostate and skin tissue.',
    typicalDosage: '5 mg - 10 mg daily',
    frequencyText: 'Taken orally as a liquid or pill once daily in the morning.',
    halfLife: 'Approx. 24 to 36 hours',
    benefits: [
      'Plus (+): Highly selective muscle hypertrophy without prostatic androgenic strain',
      'Plus (+): Dramatically elevates physical lifting strength and structural power outputs',
      'Plus (+): Substantially upregulates bone density and skeletal structural resilience',
      'Plus (+): Minimizes tissue degradation during intense caloric restrictions'
    ],
    sideEffects: [
      'Minus (-): Noticeable suppression of natural LH and FSH hormones (requires a mild PCT phase)',
      'Minus (-): Mild water retention if dietary carbohydrates are excessively elevated',
      'Minus (-): Delivers temporary suppression of protective HDL cholesterol'
    ],
    suggestedCycleWeeks: '8 - 12 weeks of muscle bulk protocols.',
    deliveryForm: 'pill',
    realisticGains: 'Rapid lean mass accumulation. Expect a realistic weight gain of 6.0 to 12.0 lbs over an 8-week cycle (mostly clean dry tissue with minor glycogen-water storage). Muscle fullness is highly elevated by Week 2.',
    dietaryInteraction: 'Requires a dedicated, clean caloric surplus (300 to 500 kcal above maintenance) with high-density protein (0.9g to 1.0g per lb). Restrict simple sugars to prevent excess water weight.'
  },
  {
    id: 'rad-140-testolone',
    name: 'RAD-140 (Testolone)',
    chemicalName: 'Selective Androgen Receptor Modulator RAD-140',
    category: 'muscle',
    description: 'An extremely potent SARM designed to mimic the high anabolic outputs of testosterone, providing dry muscle gains and high-intensity strength surges with robust neuroprotection.',
    clinicalResearch: 'RAD-140 binds selectively to androgen receptors in muscle, demonstrating high selectivity. Studies show it provides high lean tissue stimulation with low androgenic activity, while exhibiting neuroprotective properties in brain tissue.',
    typicalDosage: '10 mg - 20 mg daily',
    frequencyText: 'Taken orally as a liquid or pill once daily.',
    halfLife: 'Approx. 20 to 24 hours',
    benefits: [
      'Plus (+): Unrivaled muscle hardness, dry vascularity, and rapid raw lifting power',
      'Plus (+): Exhibits highly beneficial neuroprotective support for cerebral health',
      'Plus (+): Selectively builds lean contractile muscle tissue with zero estrogen conversions',
      'Plus (+): Noticeably improves fat loss by optimizing muscle tissue calorie demands'
    ],
    sideEffects: [
      'Minus (-): Moderately suppressive to the natural HPG hormone axis',
      'Minus (-): Can cause mild irritability or brief sleeplessness in sensitive users',
      'Minus (-): Negative shift in lipids, lowering circulating protective HDL cholesterol'
    ],
    suggestedCycleWeeks: '8 - 10 weeks of dry tissue build-up.',
    deliveryForm: 'pill',
    realisticGains: 'Extremely dry, high-density muscle tissue. Expect a gain of 4.0 to 8.0 lbs of pure lean muscle mass over 8 weeks, with visible vascular pop, fat clearing, and a dramatic increase in physical gym stamina.',
    dietaryInteraction: 'To support healthy cholesterol lines, supplement with 3g daily of Citrus Bergamot and 2g of high-potency Omega-3s. Highly compatible with high-protein diets.'
  },
  {
    id: 'mk-2866-ostarine',
    name: 'MK-2866 (Ostarine)',
    chemicalName: 'Enobosarm (Selective Androgen Receptor Modulator)',
    category: 'healing',
    description: 'A highly versatile SARM widely researched for its tissue-protective properties. It excels at preserving muscle mass during caloric deficits and accelerating the repair of skeletal joints and bone tissues.',
    clinicalResearch: 'Ostarine has been extensively researched in clinical trials for muscle wasting conditions. It selectively targets bone and muscle pathways with very low side effects, stimulating cellular repair without converting to estrogen.',
    typicalDosage: '15 mg - 25 mg daily',
    frequencyText: 'Taken orally as a pill or liquid once daily, preferably in the morning.',
    halfLife: 'Approx. 24 hours',
    benefits: [
      'Plus (+): Promotes repair of tendons, ligaments, and bone issues',
      'Plus (+): Preserves lean muscle mass during aggressive low-calorie cutting phases',
      'Plus (+): Highly mild hormone suppression compared to other selective modulators',
      'Plus (+): Enhances insulin sensitivity and metabolic resource partition'
    ],
    sideEffects: [
      'Minus (-): Mild, transient suppression of natural LH and FSH hormones at higher doses',
      'Minus (-): Minor impact on high-density lipid markers'
    ],
    suggestedCycleWeeks: '6 - 8 weeks of joint recovery and muscle preservation.',
    deliveryForm: 'pill',
    realisticGains: 'Excellent preservation of existing lean tissue during fat loss phases, and complete resolution of joint aches, tendonitis, and physical fatigue. Expect a loss of 3.0 to 6.0 lbs of fat when combined with a deficit.',
    dietaryInteraction: 'Highly synergistic with daily ingestion of Glucosamine, Chondroitin, and Vitamin D3. Ensure high whole-protein intake to maximize the amino-acid partitioning effect on joints.'
  },
  {
    id: 'cardarine-gw501516',
    name: 'Cardarine',
    chemicalName: 'GW-501516 (PPAR-Delta Receptor Agonist)',
    category: 'weight_loss',
    description: 'Not a SARM or steroid, but a selective PPAR-delta receptor agonist. Extensively used to drive cellular lipid burning, improve heart efficiency, and boost athletic endurance to legendary heights.',
    clinicalResearch: 'GW-501516 activates the PPAR-delta pathway, the same pathway stimulated by aerobic exercise. In clinical trials, it significantly increases glucose uptake in skeletal muscle, shifts the body\'s energy source from glucose to fat, and reverses metabolic abnormalities.',
    typicalDosage: '10 mg - 20 mg daily',
    frequencyText: 'Taken orally as a pill or liquid once daily, ideally 45 minutes before cardiovascular exercise.',
    halfLife: 'Approx. 16 to 24 hours',
    benefits: [
      'Plus (+): Legendary increases in lung volume, respiratory stamina, and physical endurance',
      'Plus (+): Accelerates systemic lipolysis, rapidly stripping fat cells of fatty acids',
      'Plus (+): Uniquely improves cardiovascular lipids, elevating protective HDL and lowering LDL',
      'Plus (+): Spares muscle glycogen reserves, protecting skeletal muscle tissue from wasting'
    ],
    sideEffects: [
      'Minus (-): Requires strict adherence to recommended therapeutic doses',
      'Minus (-): Can elevate liver enzyme counts if taken at high, unmonitored cycles'
    ],
    suggestedCycleWeeks: '8 - 12 weeks of intense athletic and weight-loss coaching.',
    deliveryForm: 'pill',
    realisticGains: 'No muscle mass gains. Expect a dramatic, immediate 50% to 100% surge in cardiovascular endurance, allowing hours of training without fatigue. Rapidly strips 1.5 to 3.0 lbs of fat weekly.',
    dietaryInteraction: 'Extremely responsive to clean fatty-acid diets. Pair with omega-rich fats (Salmon, Olive oil, walnuts) to support cardioprotective lipid pathways and accelerate PPAR-delta driven fat burning.'
  },
  {
    id: 'stenabolic-sr9009',
    name: 'Stenabolic',
    chemicalName: 'SR-9009 (Rev-ErbA Receptor Agonist)',
    category: 'weight_loss',
    description: 'A synthetic Rev-ErbA agonist that upregulates mitochondria counts, optimizes lipid/glucose metabolism, and acts as a powerful bio-mimetic of cardiovascular physical exercise.',
    clinicalResearch: 'SR-9009 binds to Rev-ErbA, a transcription factor that plays a crucial role in regulating circadian rhythm and mitochondrial networks. This triggers the biogenesis of new mitochondria in skeletal muscles, increasing oxygen consumption.',
    typicalDosage: '10 mg - 30 mg daily (split doses)',
    frequencyText: 'Taken orally as a liquid/pill every 4-5 hours due to its short systemic half-life.',
    halfLife: 'Approx. 4 hours',
    benefits: [
      'Plus (+): Noticeably upregulates muscle mitochondrial counts, boosting physical power',
      'Plus (+): Drives rapid fat oxidation, utilizing carbohydrate reserves effectively',
      'Plus (+): Drastically lowers systemic inflammation, optimizing joint movement',
      'Plus (+): Standardizes circadian sleep-wake cycles, enhancing rest states'
    ],
    sideEffects: [
      'Minus (-): Demands frequent daily oral dosing due to rapid clearance',
      'Minus (-): Low raw bioavailability if taken orally (sublingual is highly preferred)',
      'Minus (-): Mild morning wakefulness if taken past dusk'
    ],
    suggestedCycleWeeks: '6 - 10 weeks of high-intensity fat burning.',
    deliveryForm: 'pill',
    realisticGains: 'Extremely clean visual tightening, high stamina levels, and a noticeable increase in endurance. Complements fat reduction cycles by enabling sustained caloric deficits.',
    dietaryInteraction: 'Take sublingually under the tongue on an empty or light-food stomach. Consuming alongside green tea or CoQ10 boosts mitochondrial activity.'
  },
  {
    id: 'yk-11-myostatin-sarm',
    name: 'YK-11',
    chemicalName: 'Selective Androgen Receptor Modulator and Myostatin Inhibitor YK-11',
    category: 'muscle',
    description: 'The ultimate hybrid SARM and myostatin blocker. It binds to androgen receptors to stimulate high follistatin production, allowing rapid muscle gains that bypass normal genetic limits.',
    clinicalResearch: 'YK-11 stimulates muscle cells to produce high levels of Follistatin, which actively inhibits myostatin activity. It behaves as a complete androgen receptor agonist, making it significantly more anabolic than traditional selective modulators.',
    typicalDosage: '5 mg - 10 mg daily (divided)',
    frequencyText: 'Taken orally daily, usually divided into two micro-doses to match half-life.',
    halfLife: 'Approx. 12 hours',
    benefits: [
      'Plus (+): High-speed muscle hypertrophy by blocking myostatin structures',
      'Plus (+): Extremely fast and substantial gains in lean, dry muscle tissue size',
      'Plus (+): Downregulates general muscle tissue breakdown pathways',
      'Plus (+): Dramatically improves physical lifting strength and athletic endurance'
    ],
    sideEffects: [
      'Minus (-): Strongly suppresses natural hormone output (demands a rigorous PCT)',
      'Minus (-): Highly androgenic properties (acne, joint dryness, male pattern hair loss)',
      'Minus (-): Mild liver stress (methylated profile)'
    ],
    suggestedCycleWeeks: '4 - 8 weeks of extreme mass loading.',
    deliveryForm: 'pill',
    realisticGains: 'Aggressive dry muscle gains. Expect to compile 6.0 to 10.0 lbs of high-density dry muscle mass inside a 6-week cycle, with extreme physical visual hardness and a high strength surge.',
    dietaryInteraction: 'Requires a dedicated, high-calorie bulk diet with plenty of complete proteins. Supplement with 3g daily of Salmon oil and Glucosamine to lubricate joint boundaries.'
  },
  {
    id: 's-23-extremesarm',
    name: 'S-23',
    chemicalName: 'Selective Androgen Receptor Modulator S-23',
    category: 'muscle',
    description: 'The most powerful, dry, and suppressive SARM in existence. Widely used in professional pre-contest cycles to build extreme muscle thickness, vascular separation, and a deeply dry, aesthetic look.',
    clinicalResearch: 'S-23 displays an extremely high binding affinity for androgen receptors. It has been researched as a male hormonal contraceptive because it suppresses LH and FSH so completely that it halts spermatogenesis.',
    typicalDosage: '10 mg - 30 mg daily (divided)',
    frequencyText: 'Taken orally in tablet form twice daily (morning and evening).',
    halfLife: 'Approx. 12 hours',
    benefits: [
      'Plus (+): Unparalleled muscle dryness, hardness, and visible vascular separation',
      'Plus (+): Absolute preservation of muscle structures during extreme caloric deficits',
      'Plus (+): Accelerates fat loss while packing on solid, high-density muscle mass',
      'Plus (+): Zero risk of water retention or facial bloating'
    ],
    sideEffects: [
      'Minus (-): Complete and severe suppression of natural testosterone (requires a full PCT)',
      'Minus (-): Renowned for causing notable irritability, night sweats, and thermal heat',
      'Minus (-): Detrimental to protective HDL cholesterol levels'
    ],
    suggestedCycleWeeks: '6 - 8 weeks maximum during cutting or pre-contest schedules.',
    deliveryForm: 'pill',
    realisticGains: 'Dramatically alters overall muscle aesthetics, creating a highly polished, dense, "photoshoot-ready" look with high-contractility gains of 3.0 to 6.0 lbs of pure muscle and a 2% drop in body fat.',
    dietaryInteraction: 'Pair with daily organ shield protocols (NAC, Milk Thistle) and Citrus Bergamot. Maintain high fluid intake (4+ liters daily) and eat fat-soluble whole foods.'
  },
  {
    id: 'metabolic-shred-shield-blend',
    name: 'Metabolic Shred & Shield [BLEND]',
    chemicalName: 'Tirzepatide (5mg) + Cardarine (10mg) Fat-Melter',
    category: 'weight_loss',
    description: 'A cutting-edge synergistic blend combining the metabolic GLP-1/GIP agonist Tirzepatide with the PPAR-delta agonist Cardarine. It shuts down food cravings completely while fueling physical stamina, creating a highly efficient environment for rapid fat loss.',
    clinicalResearch: 'Tirzepatide delays gastric emptying and stabilizes insulin, preventing blood sugar fluctuations. Simultaneously, Cardarine switches the body\'s primary fuel source from glucose to storage fats, meaning that even in a deep calorie deficit, physical training energy remains high.',
    typicalDosage: '2.5 mg Tirzepatide weekly / 10 mg Cardarine daily',
    frequencyText: 'Tirzepatide is administered once weekly via sub-Q injection, paired with daily oral doses of Cardarine.',
    halfLife: 'Tirzepatide: ~5 Days | Cardarine: ~20 Hours',
    benefits: [
      'Plus (+): Rapidly burns subcutaneous and deep visceral belly fat',
      'Plus (+): Completely eliminates obsessive sweet and fatty food cravings',
      'Plus (+): Increases physical endurance and cardiovascular stamina',
      'Plus (+): Protects hard-earned muscle tissue during calorie deficits'
    ],
    sideEffects: [
      'Minus (-): Dehydration risk if fluid intake is not actively managed',
      'Minus (-): Mild gastrointestinal slowing or nausea during initial titration weeks'
    ],
    suggestedCycleWeeks: '12 - 16 weeks of body recomposition.',
    deliveryForm: 'peptide',
    realisticGains: 'Rapid, highly comfortable fat loss of 2.0 to 4.0 lbs weekly. Metabolic energy and athletic stamina remain high, allowing deep, effective training sessions despite low daily calorie consumption.',
    dietaryInteraction: 'Ensure daily fiber intake (30g) and supplement with electrolytes. Prioritize high-protein foods to feed muscle tissues while fat stores are mobilized and burned.'
  },
  {
    id: 'mitochondrial-recharge-recovery-blend',
    name: 'Mitochondrial Recharge [BLEND]',
    chemicalName: 'MOTS-c (5mg) + SS-31 (2mg) Cellular Energzer',
    category: 'longevity',
    description: 'An advanced peptide blend that targets cellular energy from two distinct angles: SS-31 repairs cardiolipin membranes to optimize ATP generation, while MOTS-c activates the AMPK pathway to stimulate mitochondrial biogenesis.',
    clinicalResearch: 'Dual metabolic pathways target mitochondrial cardiolipin surfaces and AMPK. SS-31 reduces cellular reactive oxygen species (ROS) and improves energy efficiency, while MOTS-c mimics exercise pathways, promoting nutrient burning and cellular repair.',
    typicalDosage: '5 mg MOTS-c twice weekly / 2 mg SS-31 once daily',
    frequencyText: 'MOTS-c is injected twice weekly, paired with daily subcutaneous doses of SS-31.',
    halfLife: 'MOTS-c: ~4 Hours | SS-31: ~2 Hours',
    benefits: [
      'Plus (+): Extends muscular stamina, aerobic conditioning, and cognitive sharpness',
      'Plus (+): Restores youthful mitochondrial function and cellular health',
      'Plus (+): Upregulates systemic insulin sensitivity and metabolic efficiency',
      'Plus (+): Protects microvascular systems from oxidative deterioration'
    ],
    sideEffects: [
      'Minus (-): Passing facial flushing or warm skin sensation immediately post-injection',
      'Minus (-): Temporary muscle soreness resembling post-exercise recovery'
    ],
    suggestedCycleWeeks: '4 - 6 weeks of mitochondrial biogenesis.',
    deliveryForm: 'peptide',
    realisticGains: 'A significant, sustained surge in daily energy levels, physical training capacity, and mental clarity within 1 week of starting. Reduces daily sleep requirements and accelerates recovery.',
    dietaryInteraction: 'Highly synergistic with Coenzyme Q10 and Alpha-Lipoic Acid. Consuming healthy fats (avocado, olive oil, walnuts) supplies the structural phospholipids needed for cardiolipin membrane restoration.'
  },
  {
    id: 'ultimate-fat-fire-lipid-blend',
    name: 'Ultimate Fat Fire [BLEND]',
    chemicalName: 'AOD-9604 (2.5mg) + Cardarine (10mg) Synergy',
    category: 'weight_loss',
    description: 'A potent, non-hormonal fat-burning blend that pairs the lipolytic, localized fat-releasing actions of AOD-9604 with the fat-oxidizing properties of Cardarine.',
    clinicalResearch: 'AOD-9604 targets and releases stored lipids from fat cells into circulation, while Cardarine activates PPAR-delta receptors to burn those free lipids for fuel. This synergistic mechanism accelerates fat breakdown.',
    typicalDosage: '250 mcg AOD-9604 daily / 15 mg Cardarine daily',
    frequencyText: 'Inject AOD-9604 subcutaneously once daily in the morning, and administer Cardarine orally once daily.',
    halfLife: 'AOD-9604: ~3 Hours | Cardarine: ~20 Hours',
    benefits: [
      'Plus (+): Promotes fat breakdown in stubborn areas (lower belly, waistline)',
      'Plus (+): Shines fat lipid stores as primary fuel, sparing glycogen resources',
      'Plus (+): Improves cardiovascular health and elevates protective HDL markers',
      'Plus (+): Multiplies physical endurance and cardiovascular stamina'
    ],
    sideEffects: [
      'Minus (-): Slight, passing headache if systemic hydration levels are sub-optimal',
      'Minus (-): Minor local skin redness or tingling after subcutaneous injections'
    ],
    suggestedCycleWeeks: '8 - 12 weeks of active fat reduction.',
    deliveryForm: 'peptide',
    realisticGains: 'Steady, accelerated loss of stubborn adipose tissue, averaging 1.5 to 3.0 lbs weekly, combined with a noticeable boost in cardiovascular stamina and physical energy levels.',
    dietaryInteraction: 'Inject AOD-9604 fasting in the morning. Maintain a fasting window of 30 to 45 minutes post-dose to prevent elevations in insulin from disrupting its fat-burning mechanisms.'
  },
  {
    id: 'androgenic-power-base-heavy-blend',
    name: 'Androgenic Power Base [BLEND]',
    chemicalName: 'Test Cypionate (200mg) + Primobolan (200mg) + NPP (100mg) per ml',
    category: 'muscle',
    description: 'An advanced lean-gains injectable cycle. It pairs a stable testosterone base with the estrogen-blocking, high-density tissue properties of Primobolan, and the collagen and nitrogen-retaining actions of NPP.',
    clinicalResearch: 'The combined profile balances anabolic activity while managing side effects. Primobolan downregulates estrogenic side effects from testosterone aromatization, while NPP promotes rapid protein synthesis and joint healing.',
    typicalDosage: '1.0 ml - 2.0 ml injection volume weekly',
    frequencyText: 'Injected intramuscularly twice weekly in slow-acting oil volumes.',
    halfLife: 'Test Cyp: ~8 Days | Primo: ~10 Days | NPP: ~3 Days',
    benefits: [
      'Plus (+): Builds high-quality, dry lean muscle mass without fluid logging',
      'Plus (+): Accelerates joint and tendon recovery via direct NPP collagen synthesis',
      'Plus (+): Free of localized skin or facial bloating due to Primobolan\'s balancing properties',
      'Plus (+): Promotes physical gym power, endurance, and target vascular pop'
    ],
    sideEffects: [
      'Minus (-): Complete and severe suppression of natural testosterone axes (demands a full PCT)',
      'Minus (-): Negative shift in lipids, lowering circulating protective HDL cholesterol',
      'Minus (-): Potential androgenic impacts (acne, male pattern hair loss in genetically prone cells)'
    ],
    suggestedCycleWeeks: '10 - 16 weeks of structured muscular development.',
    deliveryForm: 'oil',
    realisticGains: 'Exceptional physical changes. Expect 8.0 to 14.0 lbs of dry, vascular lean muscle over a 12-week cycle, accompanied by deep relief from tendonitis and joint aches, with minimal fat accumulation.',
    dietaryInteraction: 'A structural caloric surplus (300 to 500 kcal above maintenance) with high-density protein (0.9g to 1.0g per lb) is essential. Supplement with 3g daily of Citrus Bergamot.'
  },
  {
    id: 'nattokinase-extract',
    name: 'Nattokinase',
    chemicalName: 'Nattokinase Fibrinolytic Enzyme Extract',
    category: 'longevity',
    description: 'A powerful systemic fibrinolytic enzyme extracted from Natto. It is widely used during cycles to thin the blood, dissolve micro-clots, and lower systemic blood pressure.',
    clinicalResearch: 'Classified as a potent thrombolytic agent. In clinical trials, it directly breaks down fibrinogen and fibrin structures (the primary building blocks of blood clots), improving blood flow and reducing viscosity.',
    typicalDosage: '2,000 FU - 4,000 FU daily',
    frequencyText: 'Taken orally as a capsule daily, ideally on an empty stomach or before bed.',
    halfLife: 'Approx. 8 hours',
    benefits: [
      'Plus (+): Naturally thins the blood, reducing heart strain on thick-blood cycles',
      'Plus (+): Direct fibrinolytic action, breaking down micro-clots to support circulation',
      'Plus (+): Aids in maintaining healthy, non-elevated blood pressure ranges',
      'Plus (+): Promotes vascular elasticity and cardiovascular longevity'
    ],
    sideEffects: [
      'Minus (-): Increased risk of bruising if combined with prescription blood thinners',
      'Minus (-): Highly sensitive to dose limits (requires careful monitoring)'
    ],
    suggestedCycleWeeks: 'Cycled continuously, especially on hematocrit-increasing cycles.',
    deliveryForm: 'pill',
    realisticGains: 'A significant reduction in blood thickness and a steady lowering of resting blood pressure by 5 to 8 mmHg. Reduces the physical symptoms of cycle-induced head pressure.',
    dietaryInteraction: 'Take on an empty stomach (at least 2 hours post-meal) to allow the enzyme to bypass digestion and enter circulation. Avoid large doses of Vitamin K around administration hours.'
  },
  {
    id: 'pycnogenol-extract',
    name: 'Pycnogenol',
    chemicalName: 'French Maritime Pine Bark Extract',
    category: 'longevity',
    description: 'A powerful natural antioxidant that stimulates nitric oxide production, protecting endothelial cells and managing arterial stiffness under cycle loads.',
    clinicalResearch: 'Upregulates endothelial nitric oxide synthase (eNOS), which synthesizes nitric oxide for vasodilation. This relieves arterial pressure, increases muscular blood flow, and neutralizes free radicals.',
    typicalDosage: '100 mg - 200 mg daily',
    frequencyText: 'Taken orally as a pill daily, preferably with a meal.',
    halfLife: 'Approx. 11 hours',
    benefits: [
      'Plus (+): Drastically improves blood vessel dilation and healthy blood flow',
      'Plus (+): Relieves arterial pressure and supports healthy blood pressure ranges',
      'Plus (+): Acts as an effective antioxidant, protecting cardiovascular cells',
      'Plus (+): Supports skin elasticity and capillary health'
    ],
    sideEffects: [
      'Minus (-): Very rare mild stomach rumble or passing lightheadedness'
    ],
    suggestedCycleWeeks: 'Cycled consistently to maintain cardiovascular defense.',
    deliveryForm: 'pill',
    realisticGains: 'Noticeable improvements in vascularity and aerobic training capacity, with a steady reduction in resting blood pressure of 4 to 6 mmHg. Reduces physical fatigue.',
    dietaryInteraction: 'Pair with Vitamin C and L-Arginine or L-Citrulline to maximize nitric oxide synthesis and support synergistic arterial wall defense.'
  },
  {
    id: 'aged-garlic-extract',
    name: 'Aged Garlic Extract',
    chemicalName: 'Kyolic Aged Garlic Extract (S-Allyl Cysteine)',
    category: 'longevity',
    description: 'A highly bioavailable garlic extract that lowers systemic blood pressure, reverses soft arterial plaque accumulation, and optimizes cholesterol ratios.',
    clinicalResearch: 'S-allyl cysteine (SAC) acts as a powerful antioxidant, modulating nitric oxide and hydrogen sulfide pathways. Clinical trials show it reduces coronary artery calcification and helps reverse plaque buildup.',
    typicalDosage: '600 mg - 1,200 mg daily',
    frequencyText: 'Taken orally as a pill once or twice daily with a meal.',
    halfLife: 'Approx. 12 hours',
    benefits: [
      'Plus (+): Clinically shown to slow or reverse arterial plaque build-up',
      'Plus (+): Relieves arterial strain, supporting healthy blood pressure ranges',
      'Plus (+): Improves cholesterol ratios by reducing circulating LDL fractions',
      'Plus (+): Delivers deep systemic antioxidant and immune support'
    ],
    sideEffects: [
      'Minus (-): Mild, transient garlic aftertaste if taken on an empty stomach'
    ],
    suggestedCycleWeeks: 'Used year-round to support cardiovascular longevity.',
    deliveryForm: 'pill',
    realisticGains: 'A significant, long-term improvement in blood flow, immune function, and cardiovascular health, with a reduction in resting blood pressure of 5 to 7 mmHg within 4 weeks.',
    dietaryInteraction: 'Highly synergistic when paired with CoQ10 and Vitamin K2 to maximize mineral bone uptake and prevent vascular mineral deposits.'
  },
  {
    id: 'hawthorn-berry-extract',
    name: 'Hawthorn Berry',
    chemicalName: 'Crataegus Oxyacantha Extract (Standardized Flavonoids)',
    category: 'longevity',
    description: 'A traditional cardiac herb used during cycles to regulate vascular resistance, optimize cardiac output, and maintain healthy blood pressure ranges.',
    clinicalResearch: 'Hawthorn active compounds (oligomeric proanthocyanidins) inhibit phosphodiesterase, relaxing coronary blood vessels and improving myocardial blood flow, leading to increased heart muscle efficiency.',
    typicalDosage: '500 mg - 1,500 mg daily',
    frequencyText: 'Taken orally as a pill once or twice daily with a meal.',
    halfLife: 'Approx. 6 to 8 hours',
    benefits: [
      'Plus (+): Naturally dilates coronary arteries, improving myocardial blood flow',
      'Plus (+): Relieves vascular resistance, supporting healthy blood pressure ranges',
      'Plus (+): Promotes heart muscle contractions and overall cardiac efficiency',
      'Plus (+): Delivers powerful antioxidant defense against cardiovascular stress'
    ],
    sideEffects: [
      'Minus (-): Passing, mild stomach rumbling in sensitive individuals'
    ],
    suggestedCycleWeeks: 'Cycled daily, particularly critical during high-androgen phases.',
    deliveryForm: 'pill',
    realisticGains: 'A steady, reliable reduction in resting blood pressure of 4 to 8 mmHg within 3 weeks of starting, reducing systemic fatigue.',
    dietaryInteraction: 'Take with a glass of water and a meal. Pair with Magnesium Bisglycinate to maximize arterial relaxation and support healthy muscle contractility.'
  },
  {
    id: 'retatrutide-shred-peptide',
    name: 'Retatrutide (LY3437943)',
    chemicalName: 'MIP-Agonist Triple Hormone Peptide (GLP-1/GIP/GCGR)',
    category: 'weight_loss',
    description: 'The absolute pinnacle of metabolic design. A third-generation triple co-agonist targeting GLP-1, GIP, and Glucagon (GCGR) receptors. Under research, it generates the most aggressive fat mobilization rate of any compound currently known, vastly outperforming Semaglutide and Tirzepatide.',
    clinicalResearch: 'Acts simultaneously on three major digestive and fat-burning hormone pathways. GIP increases insulin secretion and adipose lipid metabolism; GLP-1 delays gastric emptying to block hunger; GCGR directly stimulates energy expenditure, raising core temperature and cellular metabolic rates.',
    typicalDosage: '2 mg - 12 mg weekly (escalated slowly over months)',
    frequencyText: 'Administered via a single subcutaneous injection weekly.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to the 10 mg vial. A 1 mg starting dose corresponds to exactly 20 units (0.2 ml) on a standard U-100 syringe.',
    halfLife: 'Approx. 6 days',
    benefits: [
      'Plus (+): Unrivaled fat-burning efficiency, outperforming earlier weight-loss compounds',
      'Plus (+): Complete and absolute appetite suppression, crushing all carbohydrate cravings',
      'Plus (+): Thermogenic upregulation, actively raising resting calorie expenditure and fat oxidation',
      'Plus (+): Preserves lean cardiovascular and skeletal muscle tissue when combined with high protein'
    ],
    sideEffects: [
      'Minus (-): Transient gastrointestinal nausea or mild indigestion during dose escalation',
      'Minus (-): Increased heart rate (typically 5 to 10 bpm) due to glucagon receptor activity',
      'Minus (-): Potential local skin redness or mild site irritation'
    ],
    suggestedCycleWeeks: '12 - 24 weeks of progressive body composition optimization.',
    deliveryForm: 'peptide',
    realisticGains: 'Aggressive reduction in body fat index. Clinical studies demonstrate average weight reductions of up to 24% over a 48-week protocol, with noticeable abdominal definition starting within 3 weeks of the initial dose.',
    dietaryInteraction: 'Maintain a structural diet rich in lean proteins and amino acids. Drink plentiful fluids containing essential trace minerals to manage standard GLP-1 transit-related dehydration.'
  },
  {
    id: 'tesofensine-metabolic-pill',
    name: 'Tesofensine',
    chemicalName: 'Presynaptic Triple Monoamine Reuptake Inhibitor',
    category: 'weight_loss',
    description: 'An advanced oral triple monoamine reuptake inhibitor (acting on dopamine, serotonin, and noradrenaline). It selectively suppresses appetite while upregulating resting metabolic thermogenesis and brain-derived dopamine motivation markers.',
    clinicalResearch: 'Prevents the reabsorption of dopamine, serotonin, and noradrenaline in brain synaptic junctions. This increases satiety levels, reduces the rewarding feel of high-calorie foods, and stimulates sympathetic energy output.',
    typicalDosage: '250 mcg - 500 mcg daily',
    frequencyText: 'Taken orally as a pill once daily in the early morning, fasting.',
    halfLife: 'Approx. 220 hours (extremely long-acting system clearance)',
    benefits: [
      'Plus (+): Exceptional, long-acting neural appetite suppression',
      'Plus (+): Noticeable thermogenic action, increasing daily caloric burn',
      'Plus (+): Elevates psychological drive, training focus, and daily physical motivation',
      'Plus (+): Blocks impulsive snacking and emotional eating triggers'
    ],
    sideEffects: [
      'Minus (-): Potential insomnia if taken late in the day (strictly consume in AM)',
      'Minus (-): Dry mouth, mild dry eyes, and increased resting heart rate',
      'Minus (-): Temporary mild elevation in blood pressure'
    ],
    suggestedCycleWeeks: '8 - 12 weeks of structured weight loss and focus optimization.',
    deliveryForm: 'pill',
    realisticGains: 'Fast and sustained appetite suppression within 48 hours of your first dose. Expect steady fat reductions of 8.0 to 15.0 lbs of tissue in a standard 10-week cycle, coupled with stellar mental clarity.',
    dietaryInteraction: 'Perfectly paired with morning cardiovascular sessions and a high-protein breakfast. Ensure you drink sufficient water throughout the morning to counter dry mouth.'
  },
  {
    id: 'kisspeptin-10-hormone',
    name: 'Kisspeptin-10',
    chemicalName: 'KISS1 Receptor Agonist (Hypothalamic Decapeptide)',
    category: 'sexual_health',
    description: 'An extremely hypothalamic peptide that triggers the release of Gonadotropin-Releasing Hormone (GnRH). It upregulates endogenous Luteinizing Hormone (LH) and Follicle-Stimulating Hormone (FSH), naturally restoring high-level endogenous testosterone and driving deep libido pathways.',
    clinicalResearch: 'Binds with high affinity to the KISS1 protein-coupled receptor (GPR54) in the brain. This stimulates a natural physiological release of GnRH, which then commands the pituitary to release LH and FSH to drive testicular output.',
    typicalDosage: '100 mcg - 200 mcg per dose',
    frequencyText: 'Injected subcutaneously 1 to 3 times weekly, or as a recovery protocol.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to the 5 mg vial. A 100 mcg dose corresponds to 4 units (0.04 ml) on a standard syringe.',
    halfLife: 'Approx. 4 minutes (immediately initiates a multi-hour hormonal pulse)',
    benefits: [
      'Plus (+): Restores natural, pulsatile endogenous hormone output without shutdown',
      'Plus (+): Rapidly triggers psychological sexual interest, drive, and mental focus',
      'Plus (+): Supports natural sperm count, motility, and overall fertility indexes',
      'Plus (+): Restores vascular pelvic responsiveness and desire pathways'
    ],
    sideEffects: [
      'Minus (-): Temporary mild skin flushes immediately after injection',
      'Minus (-): Passing, lightheadness or mild head pressure for 5 minutes'
    ],
    suggestedCycleWeeks: '4 - 8 weeks during active recovery cycles or PCT protocols.',
    deliveryForm: 'peptide',
    realisticGains: 'Acts as a profound sexual health and psychological libido optimizer. Elevates pelvic vascular sensitivity and restores natural luteinizing hormone pulses during recovery frameworks without causing receptor desensitization.',
    dietaryInteraction: 'Can be taken with or without food. Avoid taking near bedtime if the psychological libido boost interferes with sleep architectures.'
  },
  {
    id: 'thymosin-alpha-1-immune',
    name: 'Thymosin Alpha-1 (TA1)',
    chemicalName: 'T-Cell Mature Phenotype Immunomodulator (28aa)',
    category: 'immune',
    description: 'A highly regarded immunological peptide that stimulates thymic T-cell activity, optimizes cytokine balance, and enhances natural host defenses. Extensively utilized to combat chronic viral pathways, resolve dormant bacterial infections, and modulate auto-immune sensitivities.',
    clinicalResearch: 'Isolated from thymic tissue, TA1 works via toll-like receptors to promote mature T-lymphocytes (helper, cytotoxic, and regulatory T-cells). This balances the immune response, boosting defense while suppressing self-destructive autoimmune pathways.',
    typicalDosage: '1.5 mg twice weekly',
    frequencyText: 'Injected subcutaneously twice weekly on non-consecutive days.',
    reconstitutionText: 'Add 1.0 ml of Bacteriostatic Water to a 10 mg vial. A 1.5 mg dose corresponds to exactly 15 units (0.15 ml) on a standard syringe.',
    halfLife: 'Approx. 2 hours (inducing prolonged immune modulation)',
    benefits: [
      'Plus (+): Drastically enhances immunological defenses against common and viral pathogens',
      'Plus (+): Modulates and calms overactive auto-immune and chronic allergic responses',
      'Plus (+): Reduces low-grade systemic inflammation, joint aches, and chronic fatigue',
      'Plus (+): Supports healthy tissue healing, cellular resilience, and gut barrier health'
    ],
    sideEffects: [
      'Minus (-): Rare, mild redness or minor itch at the injection site',
      'Minus (-): Temporary, slight fatigue as the immune system activates'
    ],
    suggestedCycleWeeks: '4 - 8 weeks during heavy cycle stress or seasonal immune demands.',
    deliveryForm: 'peptide',
    realisticGains: 'Dramatic, rapid elimination of recurrent seasonal allergies, minor bugs, and persistent fatigue. Most research models report a complete return of daily vitality and physical wellness within 3 weeks.',
    dietaryInteraction: 'Works highly synergistically with zinc supplements and clean antioxidant-rich foods to feed active lymphocytes.'
  },
  {
    id: 'hcg-hormone',
    name: 'Human Chorionic Gonadotropin (hCG)',
    chemicalName: 'Endogenous Glycoprotein Luteinizing Hormone Mimetic',
    category: 'hormones',
    description: 'A naturally occurring peptide hormone that behaves as an analog of Luteinizing Hormone (LH). In endocrine networks, it directly stimulates Leydig cells in the testes to synthesize high quantities of testosterone, preventing testicular atrophy during suppressive cycles.',
    clinicalResearch: 'Binds directly to the LH/choriogonadotropin receptor in testicles, bypassing the suppressed pituitary pathway. This keeps Leydig cells active, pumping out natural testosterone, preventing cell atrophy, and maintaining fertility.',
    typicalDosage: '250 IU - 500 IU per dose',
    frequencyText: 'Injected subcutaneously 2 to 3 times weekly during active suppressive cycles.',
    reconstitutionText: 'Add 5.0 ml of Bacteriostatic Water to a 5,000 IU vial. A 250 IU dose corresponds to exactly 25 units (0.25 ml) on standard syringes.',
    halfLife: 'Approx. 36 hours',
    benefits: [
      'Plus (+): Completely prevents or reverses testicular shrinkage on anabolic cycles',
      'Plus (+): Maintains strong natural intratesticular testosterone levels and sperm count',
      'Plus (+): Keeps upstream Leydig cells responsive for a much faster PCT recovery',
      'Plus (+): Promotes systemic well-being and libido during heavy suppressive phases'
    ],
    sideEffects: [
      'Minus (-): Can increase rate of aromatization, raising estrogen (Estradiol) slightly',
      'Minus (-): Excess dosing can desensitize Leydig cells over long periods'
    ],
    suggestedCycleWeeks: 'Used continuously throughout suppressive anabolic cycles (8-16 weeks).',
    deliveryForm: 'peptide',
    realisticGains: 'Maintains baseline testicular size, natural hormone synthesis, and high fertility standards even under severe external steroid suppression. Speeds up overall recovery times.',
    dietaryInteraction: 'Ensure adequate intake of healthy dietary fats to provide the cholesterol building blocks necessary for testicular testosterone production.'
  },
  {
    id: 'dianabol-muscle',
    name: 'Dianabol (Dbol)',
    chemicalName: 'Methandrostenolone (Oral Methylated AAS)',
    category: 'muscle',
    description: 'The absolute undisputed grandfather of oral anabolic steroids. Highly celebrated for producing rapid gains in raw lifting strength, intramuscular glycogen accumulation, and overall muscle fullness.',
    clinicalResearch: 'An alkylated derivative of testosterone designed to survive oral ingestion. It binds aggressively to androgen receptors, inducing massive positive nitrogen balance in skeletal tissue and optimizing cellular glycogen storage.',
    typicalDosage: '20 mg - 50 mg daily',
    frequencyText: 'Taken orally as a pill daily, split into two doses to match its half-life.',
    halfLife: 'Approx. 4.5 to 6 hours',
    benefits: [
      'Plus (+): Radical, near-instantaneous surge in lifting strength and workout endurance',
      'Plus (+): Exceptional cell-fullness, forcing glycogen and cellular fluids into muscle beds',
      'Plus (+): Dramatically accelerates protein synthesis, enabling rapid recovery',
      'Plus (+): Improves joint comfort under heavy loads by increasing joint lubrication'
    ],
    sideEffects: [
      'Minus (-): Highly suppressive of natural testosterone (demands a full PCT)',
      'Minus (-): Fast aromatization to methyl-estrogen, causing water retention or gyno',
      'Minus (-): Strains the liver due to oral C17-alpha alkylation (AST/ALT strain)'
    ],
    suggestedCycleWeeks: '4 - 6 weeks maximum, typically utilized to kickstart standard cycles.',
    deliveryForm: 'pill',
    realisticGains: 'An explosive gain of 8.0 to 15.0 lbs of physical bulk within the first 3 weeks of administration, paired with a massive 20-30% increase in training strength and joint levers due to muscle hydration.',
    dietaryInteraction: 'Consume alongside a strong liver guard (like TUDCA and NAC) and monitor sodium levels. Highly efficient when paired with high-mineral carb meals pre-workout.'
  },
  {
    id: 'winstrol-dry',
    name: 'Winstrol (Stanozolol)',
    chemicalName: 'Stanozolol (Oral/Injectable DHT-Derived AAS)',
    category: 'muscle',
    description: 'A celebrated DHT-derived oral/injectable anabolic steroid. Highly favored for delivering an incredibly dry, hard, shredded physical appearance with zero water retention, while dramatically binding to SHBG.',
    clinicalResearch: 'Modified to survive first-pass digestion. Shows high anabolic-to-androgenic separation. It lowers Sex Hormone-Binding Globulin (SHBG) dramatically, freeing up other cycle hormones to be highly active.',
    typicalDosage: '25 mg - 50 mg daily',
    frequencyText: 'Taken orally as a pill daily in the morning, or before workouts.',
    halfLife: 'Approx. 9 hours',
    benefits: [
      'Plus (+): Forces deep subcutaneous water depletion, drying the skin over the muscles',
      'Plus (+): Binds aggressively to SHBG, multiplying the free potency of other cycle compounds',
      'Plus (+): Promotes dry, dense muscle gains and enhanced vascularity',
      'Plus (+): No risk of estrogen conversion, completely preventing bloating or gynecomastia'
    ],
    sideEffects: [
      'Minus (-): Known to cause joint dryness and achiness (depletes protective joint water)',
      'Minus (-): Negatively alters lipid profiles, lowering protective HDL cholesterol',
      'Minus (-): Mild liver strain from oral methylation'
    ],
    suggestedCycleWeeks: '5 - 6 weeks maximum, usually added to the second half of cutting cycles.',
    deliveryForm: 'pill',
    realisticGains: 'Dramatically alters overall muscle cosmetic appearance. Expect to shed 2.0 to 4.0 lbs of subcutaneous bloating, revealing highly vascular, rock-solid, and deeply defined muscular contours.',
    dietaryInteraction: 'Pair with supportive joint supplements like Fish Oil and Glucosamine to ease cycle-induced dry joints.'
  },
  {
    id: 'masteron-prop',
    name: 'Masteron',
    chemicalName: 'Drostanolone Propionate (DHT-Derived AAS)',
    category: 'muscle',
    description: 'A legendary injectable DHT-derived anabolic steroid. Prized by bodybuilders for its native anti-estrogenic properties and its ability to carve out a dense, hard, and deeply defined aesthetic on low body fat.',
    clinicalResearch: 'Binds strongly to androgen receptors while acting as a weak inhibitor of the aromatase enzyme, actively blocking estrogenic side effects. Known for structural nervous system stimulation.',
    typicalDosage: '300 mg - 500 mg weekly',
    frequencyText: 'Injected intramuscularly every other day (EOD) due to the short prop ester.',
    halfLife: 'Approx. 2.5 days',
    benefits: [
      'Plus (+): Acts as an effective anti-estrogen, preventing water log and gyno',
      'Plus (+): Delivers a deeply hardened, dense cosmetic finish to existing muscle layers',
      'Plus (+): Upregulates neurological strength, power outputs, and training aggression',
      'Plus (+): Stimulates rich skin vascularity and clean muscle fullness'
    ],
    sideEffects: [
      'Minus (-): Highly androgenic (accelerates hair shedding in genetically prone individuals)',
      'Minus (-): Complete suppressive shutdown of natural testosterone axis',
      'Minus (-): Increases oily skin and potential acne'
    ],
    suggestedCycleWeeks: '8 - 12 weeks of sculpting or contest-prep phases.',
    deliveryForm: 'oil',
    realisticGains: 'Generates an unparalleled "3D visual pop" and muscle density. Under low body fat (below 10%), it clears superficial soft layers, revealing detailed muscle fiber patterns, dry striations, and full-bellied muscle groups.',
    dietaryInteraction: 'Highly effective during low-carbohydrate phases to maximize dry cosmetic looks while maintaining training energy.'
  },
  {
    id: 'l-carnitine',
    name: 'L-Carnitine',
    chemicalName: 'L-Carnitine Tartrate / Acetyl-L-Carnitine',
    category: 'supplements',
    description: 'A core metabolic factor responsible for transporting circulating fatty acid chains directly into cellular mitochondria to be metabolized for muscular energy, optimizing physical endurance and cellular energy production.',
    clinicalResearch: 'Oral L-Carnitine is a widely researched dietary compound. It serves as an essential biological shuttle for long-chain fatty acids entering the mitochondrial matrix for beta-oxidation, helping optimize fat transport and supporting cardiovascular performance.',
    typicalDosage: '1,000 mg - 3,000 mg daily',
    frequencyText: 'Taken orally once daily as capsules with a high-nutrition meal.',
    halfLife: 'Stored in skeletal muscle reservoirs; tissue clearance takes several days',
    benefits: [
      'Plus (+): Supports fatty acid transport, aiding lean fat oxidation',
      'Plus (+): Aids muscle recovery and reduces exercise-induced muscle damage',
      'Plus (+): Promotes cognitive function and cellular energy pathways',
      'Plus (+): Supports cardiovascular performance and blood flow parameters'
    ],
    sideEffects: [
      'Minus (-): Extremely high oral doses may cause mild stomach upset or digestive changes'
    ],
    suggestedCycleWeeks: 'Ongoing or 8-12 week intense training blocks.',
    deliveryForm: 'pill',
    realisticGains: 'Support for lipid transport, steady fat oxidation under clean nutrition, and a reduction in training-related muscle soreness over 4-6 weeks of regular ingestion.',
    dietaryInteraction: 'Consume alongside dietary carbohydrates to utilize the insulin response to naturally optimize carnitine uptake into muscle tissues.'
  },
  {
    id: 'tudca-protect',
    name: 'TUDCA',
    chemicalName: 'Tauroursodeoxycholic Acid (systemic Bile Acid)',
    category: 'supplements',
    description: 'A highly potent hydrophilic bile acid supplement. Used during intense cycles to prevent cholestasis, protect liver cells from toxic oral methylation, and actively lower elevated hepatic AST/ALT/GGT enzymes back to baseline.',
    clinicalResearch: 'TUDCA counters the toxic effects of hydrophobic bile acids which accumulate under methylated oral steroid administration, causing cholestatic liver damage. It promotes healthy bile flow and rescues hepatocytes.',
    typicalDosage: '500 mg - 1,000 mg daily',
    frequencyText: 'Taken orally as a capsule daily, split into AM/PM doses.',
    halfLife: 'Approx. 3 hours',
    benefits: [
      'Plus (+): Restores normal bile flow, correcting liver blockage and cholestasis',
      'Plus (+): Rescues hepatocyte membrane structures and lowers hepatic inflammation',
      'Plus (+): Helps clear AST, ALT, and GGT enzymes back to normal clinical bounds',
      'Plus (+): Delivers supportive benefits to lipid levels and overall insulin sensitivity'
    ],
    sideEffects: [
      'Minus (-): Highly sensitive to dose limits (excess can cause temporary loose stools)'
    ],
    suggestedCycleWeeks: 'Used continuously during any oral steroid or methylated drug cycles.',
    deliveryForm: 'pill',
    realisticGains: 'Complete liver cell protection from oral anabolic toxicity. AST/ALT enzyme markers can be effectively kept within healthy physiological bounds or restored to normal within 3 weeks of administration.',
    dietaryInteraction: 'Best consumed with water. Do NOT consume TUDCA concurrently with alcohol, as the combination can amplify toxic pathways.'
  },
  {
    id: 'anastrozole-estrogen-control',
    name: 'Arimidex',
    chemicalName: 'Anastrozole (Selective Aromatase Inhibitor)',
    category: 'hormones',
    description: 'A highly selective Type II (non-steroidal) aromatase inhibitor. It binds reversibly to the aromatase enzyme, blocking the conversion of anabolic androgens into estrogen, preventing gynecomastia and excess water retention on cycle.',
    clinicalResearch: 'Binds competitively to the heme group of the cytochrome P450 aromatase enzyme, reducing systemic estrogen synthesis by up to 85% without altering other crucial adrenal hormones.',
    typicalDosage: '0.25 mg - 1.0 mg every other day (EOD)',
    frequencyText: 'Taken orally as a pill as needed (EOD) based on active estrogen levels.',
    halfLife: 'Approx. 46 hours (very stable, slow clearing)',
    benefits: [
      'Plus (+): Rapidly reverses and blocks early signs of gynecomastia (breast growth)',
      'Plus (+): Prevents subcutaneous water logging, maintaining a tight, hard physical appearance',
      'Plus (+): Helps keep systemic blood pressure lower by reducing estrogen-related fluid load',
      'Plus (+): Highly precise control of estradiol levels'
    ],
    sideEffects: [
      'Minus (-): Risk of crushing estrogen too low (causing painful dry joints and brain fog)',
      'Minus (-): Slightly negative impact on systemic protective HDL cholesterol levels'
    ],
    suggestedCycleWeeks: 'Used as-needed during estrogenic cycles (8-16 weeks).',
    deliveryForm: 'pill',
    realisticGains: 'Rapid, highly precise control over circulating estrogen (Estradiol). Successfully reverses active nipple itching, fluid retention, or emotional swings within 12-24 hours of dosing.',
    dietaryInteraction: 'Can be taken with or without food. Ensure regular lipid profile monitoring to balance cardiovascular health.'
  },
  {
    id: 'exemestane-suicide-aromasin',
    name: 'Aromasin',
    chemicalName: 'Exemestane (Irreversible Suicide Aromatase Inhibitor)',
    category: 'hormones',
    description: 'A premium Type I (steroidal) irreversible "suicide" aromatase inhibitor. It permanently binds to green-lit aromatase enzymes, completely deactivating them and preventing rebound estrogen flares when discontinuing therapy.',
    clinicalResearch: 'Binds permanently to the active site of the aromatase enzyme, deactivating it forever (requires the body to synthesize brand new aromatase enzymes). Provides a very stable, smooth estrogenic management profile.',
    typicalDosage: '12.5 mg - 25.0 mg per dose',
    frequencyText: 'Taken orally as a pill 2 to 3 times weekly, or every other day.',
    halfLife: 'Approx. 24 hours',
    benefits: [
      'Plus (+): Prevents estrogen rebound flares because it is an irreversible blocker',
      'Plus (+): Far more friendly and supportive to cholesterol (HDL/LDL) profiles than Arimidex',
      'Plus (+): Promotes a dry, hard muscle look by keeping estrogen conversion consistently low',
      'Plus (+): Naturally increases free testosterone by upregulating luteinizing hormone'
    ],
    sideEffects: [
      'Minus (-): If overdosed, can cause extreme fatigue, joint pain, and flat muscles',
      'Minus (-): Rare, mild transient headaches in sensitive individuals'
    ],
    suggestedCycleWeeks: 'Used continuously or as-needed on aromatizing steroid cycles.',
    deliveryForm: 'pill',
    realisticGains: 'Extremely stable estrogen management without therapeutic rebounds. Yields a dry, dense cosmetic appearance while proving significantly information-friendly on lipid profiles (HDL/LDL ratios) compared to alternative inhibitors.',
    dietaryInteraction: 'MUST be taken with a fat-containing meal. Absorption is increased by over 40% when co-ingested with dietary lipids.'
  },
  {
    id: 'clomid-pct-stimulator',
    name: 'Clomid',
    chemicalName: 'Clomiphene Citrate (Selective Estrogen Receptor Modulator)',
    category: 'hormones',
    description: 'A potent Selective Estrogen Receptor Modulator (SERM). It operates by blocking estrogen receptors in the hypothalamus, tricking the pituitary gland into releasing massive pulses of LH and FSH to jumpstart endogenous testosterone production post-cycle.',
    clinicalResearch: 'Antagonizes estrogen receptors in the hypothalamus, disrupting the negative feedback loop. The brain believes there is zero estrogen, demanding high GnRH, which drives the pituitary to release LH and FSH to restimulate Leydig cells.',
    typicalDosage: '25 mg - 50 mg daily',
    frequencyText: 'Taken orally as a pill daily during active Post-Cycle Therapy (PCT).',
    halfLife: 'Approx. 5 to 7 days',
    benefits: [
      'Plus (+): Extremely fast restart of the hypothalamus-pituitary-gonadal (HPG) axis',
      'Plus (+): Promotes endogenous LH and FSH secretion, driving recovery from steroid shutdown',
      'Plus (+): Maintains sperm count, density, and overall fertility registers',
      'Plus (+): Easy oral administration with robust long-term clinical data'
    ],
    sideEffects: [
      'Minus (-): Can cause emotional volatility, moodiness, or anxiety due to estrogen block',
      'Minus (-): Rare, transient visual disturbances (floaters or light sensitivity at high doses)'
    ],
    suggestedCycleWeeks: '4 weeks of structured Post-Cycle Therapy (PCT) immediately following cycles.',
    deliveryForm: 'pill',
    realisticGains: 'Extremely fast restart of the hypothalamus-pituitary-gonadal (HPG) axis during Post-Cycle Therapy (PCT). Restores baseline luteinizing hormone and sperm counts back to natural clinical limits within 4 weeks.',
    dietaryInteraction: 'Take daily at any time, ideally with a glass of water. Keep consistent dosing times to maintain steady serum concentrations.'
  },
  {
    id: 'nolvadex-gyno-protection',
    name: 'Nolvadex',
    chemicalName: 'Tamoxifen Citrate (Selective Estrogen Receptor Modulator)',
    category: 'hormones',
    description: 'An exceptionally popular SERM with high binding affinity for estrogen receptors in breast tissue. Primarily used during cycles or PCT to immediately block breast tissue from developing gynecomastia while supporting pituitary recovery.',
    clinicalResearch: 'Competes with estradiol for breast estrogen receptors, blocking cellular estrogenic effects. Also acts as an agonist in bone tissue and cholesterol pathways, supporting healthy density and lipids.',
    typicalDosage: '10 mg - 20 mg daily',
    frequencyText: 'Taken orally as a pill daily during active cycles or PCT recovery phases.',
    halfLife: 'Approx. 5 to 7 days',
    benefits: [
      'Plus (+): Immediate protection against estrogen-induced gynecomastia (breast sore/lumps)',
      'Plus (+): Drives pituitary LH and FSH release to restimulate natural testosterone',
      'Plus (+): Positively influences lipid scores, helping protect cardiovascular profiles on cycle',
      'Plus (+): Highly effective at very low doses for target tissue defense'
    ],
    sideEffects: [
      'Minus (-): Slightly lowers systemic IGF-1 levels (minor anabolic opposition)',
      'Minus (-): Potential passing hot flushes or mild fatigue in recovery phases'
    ],
    suggestedCycleWeeks: '2 - 4 weeks during active gynecomastia flareups or 4 weeks during PCT.',
    deliveryForm: 'pill',
    realisticGains: 'Instant arrest of early-stage gynecomastia (breast tissue lumps / nipple puffiness) within 48 hours of starting, while driving endogenous LH and FSH secretion during recovery phases.',
    dietaryInteraction: 'Can be taken with or without food. Avoid combining with high-risk hepatic medications during recovery protocols.'
  },
  {
    id: 'dsip-delta-sleep',
    name: 'DSIP',
    chemicalName: 'Delta Sleep-Inducing Peptide (9aa Somnotropic Peptide)',
    category: 'longevity',
    description: 'An ultra-specialized somnotropic nonapeptide. It naturally reorganizes circadian rhythms, stabilizes nocturnal body temperature, and increases the depth of slow-wave delta sleep while optimizing daytime endocrine pulses.',
    clinicalResearch: 'Crosses the blood-brain barrier and binds to neuromodulator receptors. It upregulates slow-wave delta brain waves, stabilizing sleep-wake cycles without acting as a direct GABA-sedative, preserving natural sleep stages.',
    typicalDosage: '100 mcg - 250 mcg per dose',
    frequencyText: 'Injected subcutaneously once daily, strictly 1 to 2 hours before desired sleep.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to standard 5 mg vial. A 100 mcg dose is 4 units (0.04 ml) on standard syringes.',
    halfLife: 'Approx. 15 minutes (inducing deep, long-duration sleep architectures)',
    benefits: [
      'Plus (+): Profound increase in deep restorative delta sleep and sleep-cycle density',
      'Plus (+): Helps normalize resting daytime blood pressure and cardiovascular strain',
      'Plus (+): Optimizes luteinizing hormone and cortisol rhythms during heavy cycle stress',
      'Plus (+): Non-addictive somatic restulator with zero daytime groggy side effects'
    ],
    sideEffects: [
      'Minus (-): Intense sleepiness within 1 hour (do not use before operating machinery)',
      'Minus (-): Heavy dreams or mild disorientation on first waking up'
    ],
    suggestedCycleWeeks: '3 - 6 weeks to reset disrupted circadian rhythms or during recovery phases.',
    deliveryForm: 'peptide',
    realisticGains: 'Dramatically restores natural, deep, non-fragmented delta sleep architectures. Users report a 40% reduction in nocturnal wakes, and wake up feeling incredibly refreshed and rested.',
    dietaryInteraction: 'Administer on an empty stomach shortly before bed. Best combined with a cool, dark sleeping environment to support thermoregulation.'
  },
  {
    id: 'thymulin-immune-node',
    name: 'Thymulin',
    chemicalName: 'Zinc-Dependent Thymic Nonapeptide Bioregulator',
    category: 'immune',
    description: 'A natural zinc-dependent thymus-derived nonapeptide. It stimulates general lymphocyte cells, modulates allergic asthma pathways, and plays a vital role in T-cell differentiation and systemic wellness.',
    clinicalResearch: 'Requires zinc to form its biologically active 3D chelated structure. It commands lymphocyte differentiation, restoring immunocompetence, normalizing hyperactive IgE pathways, and controlling cellular inflammation.',
    typicalDosage: '100 mcg - 200 mcg daily',
    frequencyText: 'Injected subcutaneously once daily or on alternating days.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to the 5 mg vial. A 100 mcg dose corresponds to 4 units (0.04 ml) on standard syringes.',
    halfLife: 'Approx. 30 minutes (initiating ongoing thymic signaling cascades)',
    benefits: [
      'Plus (+): Stimulates T-cell cellular maturation and immunological defenses',
      'Plus (+): Potent down-regulation of chronic systemic allergies and inflammatory asthma',
      'Plus (+): Synergizes directly with Zinc ions to maximize systemic energy levels',
      'Plus (+): Enhances mucosal defense layers, checking seasonal environmental bugs'
    ],
    sideEffects: [
      'Minus (-): Passing, mild site warmth immediately following injection',
      'Minus (-): Light, transient headache if zinc levels are severely depleted'
    ],
    suggestedCycleWeeks: '4 - 6 weeks to restore immunity or optimize systemic healing properties.',
    deliveryForm: 'peptide',
    realisticGains: 'Profound correction of underlying allergic cascades, localized joint aches, and autoimmune inflammation. Strengthens mucosal antibody defenses, preventing chronic viral infections.',
    dietaryInteraction: 'MUST be combined with daily oral Zinc supplementation (such as Zinc L-Carnosine or Picolinate 15-30mg) to ensure maximum peptide chelation and activity.'
  },
  {
    id: 'sermorelin-growth-peptide',
    name: 'Sermorelin',
    chemicalName: 'Growth Hormone Releasing Hormone Fragment (GRF 1-29)',
    category: 'longevity',
    description: 'A 29-amino acid synthetic peptide representing the active core of endogenous Growth Hormone-Releasing Hormone (GHRH). It binds directly to the pituitary gland to raise growth hormone and IGF-1 secretions, promoting fat metabolism, cell repair, and skin quality.',
    clinicalResearch: 'The shortest fully active GHRH peptide. It stimulates somatotropes in the pituitary gland to secrete pulses of growth hormone in a highly natural, self-regulating feedback loop, preventing pituitary exhaustion.',
    typicalDosage: '200 mcg - 500 mcg daily',
    frequencyText: 'Injected subcutaneously once daily in the evening, fasting, before bed.',
    reconstitutionText: 'Add 2.0 ml of Bacteriostatic Water to the 5 mg vial. A 250 mcg dose corresponds to exactly 10 units (0.1 ml) on standard syringes.',
    halfLife: 'Approx. 10 to 20 minutes',
    benefits: [
      'Plus (+): Naturally increases physical growth hormone levels without shutting down the endocrine system',
      'Plus (+): Accelerates systemic skin cell repair, wrinkles healing, and hair quality',
      'Plus (+): Deepens slow-wave physical sleep, supporting faster gym muscle recovery',
      'Plus (+): Gently mobilizes stubborn fat layers while supporting lean tissue preservation'
    ],
    sideEffects: [
      'Minus (-): Mild transient facial flushing or warm head sensation for 5 minutes post-dose',
      'Minus (-): Slight increase in nocturnal appetite if taken too early before bed'
    ],
    suggestedCycleWeeks: '12 - 24 weeks of continuous rejuvenation.',
    deliveryForm: 'peptide',
    realisticGains: 'Consistently deepens sleep, increases dermal elasticity, and accelerates recovery from physical exercise. Encourages gradual body fat reduction (uniquely in subcutaneous and visceral pockets) over a standard 12-week cycle.',
    dietaryInteraction: 'Strictly administer on an empty stomach (at least 2 hours post-meal, zero carbohydrates or fats in blood) to prevent insulin or blood sugar from suppressing growth hormone release.'
  },
  {
    id: 'theanine-ashwagandha-synergy',
    name: 'Theanine & Ashwagandha Blend',
    chemicalName: 'L-Theanine & Ashwagandha Synergy',
    category: 'supplements',
    description: 'A synergistic oral blend pairing the calming amino acid L-Theanine with standardized Ashwagandha root extract. Designed to reduce high central nervous system (CNS) arousal, lower cortisol, and balance cycle-induced tension or jitters.',
    clinicalResearch: 'L-Theanine crosses the blood-brain barrier to increase alpha brain waves, inducing alert relaxation. Ashwagandha is a highly standardized adaptogen clinically shown to optimize the hypothalamic-pituitary-adrenal (HPA) axis, reducing serum cortisol and calming vascular tension.',
    typicalDosage: '200 mg L-Theanine / 300 mg Ashwagandha twice daily',
    frequencyText: 'Taken orally as a capsule twice daily, morning and evening.',
    halfLife: 'L-Theanine: ~3 hours | Ashwagandha: ~6 hours',
    benefits: [
      'Plus (+): Drastically calms CNS over-excitation, cycles jitters, and stimulant anxiety',
      'Plus (+): Promotes parasympathetic resting recovery, muscle relaxation, and deep sleep',
      'Plus (+): Substantially controls serum cortisol levels under physical cycle fatigue',
      'Plus (+): Promotes focus, balanced mood states, and cardiovascular resting pulse'
    ],
    sideEffects: [
      'Minus (-): Mild relaxation or passing afternoon lethargy if taken with high carbohydrates'
    ],
    suggestedCycleWeeks: 'Used year-round or specifically during heavy thermogenic/stimulant cycles.',
    deliveryForm: 'pill',
    realisticGains: 'A profound reduction in subjective mental anxiety and physiological cortisol tension. Normalizes resting heart rate variations (HRV) and stabilizes nervous system jitters during high-stimulant or aggressive androgen phases.',
    dietaryInteraction: 'Can be taken with or without food. Highly effective when paired with morning coffee to smooth out caffeine jitters or with a carb-free protein meal at bedtime.'
  },
  {
    id: 'nac-ultimate-glutathione',
    name: 'NAC',
    chemicalName: 'N-Acetyl L-Cysteine (Precursor to Glutathione)',
    category: 'supplements',
    description: 'A powerful precursor to glutathione—the body\'s ultimate antioxidant. It shields cells from oxidative stress, optimizes respiratory function, and protects the liver during toxic cycle exposures.',
    clinicalResearch: 'Directly converted by the liver into L-cysteine, which acts as the rate-limiting step in glutathione synthesis. This actively detoxifies lipid-soluble pollutants, drugs, heavy metals, and methylated steroidal structures.',
    typicalDosage: '600 mg - 1,200 mg daily',
    frequencyText: 'Taken orally as a pill once or twice daily, best taken on an empty stomach.',
    halfLife: 'Approx. 5.6 hours',
    benefits: [
      'Plus (+): Maximizes glutathione levels, protecting key liver and kidney tissues',
      'Plus (+): Dramatically protects pulmonary pathways and supports respiratory oxygen intake',
      'Plus (+): Aids in controlling cycle-induced skin breakouts and systemic oxidation',
      'Plus (+): Supports arterial integrity and clears heavy cellular debris'
    ],
    sideEffects: [
      'Minus (-): Slightly sour smell of capsules; mild digestive rumbling in rare cases'
    ],
    suggestedCycleWeeks: 'Used year-round or continuously alongside any heavy workouts or oral cycles.',
    deliveryForm: 'pill',
    realisticGains: 'Complete liver cell insurance and powerful blood purification. Enhances recovery times from heavy workouts and protects pulmonary structures.',
    dietaryInteraction: 'Consume on an empty stomach with a large glass of water to optimize absorption. Pair with Vitamin C to support peak cellular glutathione synthesis.'
  },
  {
    id: 'citrus-bergamot-lipids-supp',
    name: 'Citrus Bergamot',
    chemicalName: 'High-Flavonoid Citrus Bergamot Extract',
    category: 'supplements',
    description: 'An organic supplement standardized to high concentrations of cardiotropic flavonoids. Universally deployed on cycles to rescue compromised HDL/LDL cholesterol profiles and support cardiovascular health under strain.',
    clinicalResearch: 'Bergamot polyphenols inhibit HMG-CoA reductase (the same target as statin drugs) to decrease cholesterol production, while increasing AMPK to improve cellular lipid and glucose oxidation without statin-related muscle aches.',
    typicalDosage: '500 mg - 1,000 mg daily',
    frequencyText: 'Taken orally as a pill once or twice daily, shortly before main meals.',
    halfLife: 'Approx. 4 hours',
    benefits: [
      'Plus (+): Clinically shown to rescue HDL cholesterol and dramatically lower LDL fractions',
      'Plus (+): Improves endothelial vascular function, reducing arterial walls stress',
      'Plus (+): Supports healthy blood glucose ranges and general metabolic function',
      'Plus (+): Delivers deep systemic antioxidant support to heart tissues'
    ],
    sideEffects: [
      'Minus (-): Rare, mild stomach acidity if taken completely fasting'
    ],
    suggestedCycleWeeks: 'Used continuously during all high-androgen or lipid-altering cycles.',
    deliveryForm: 'pill',
    realisticGains: 'Remarkable recovery of systemic lipid markers. Expect protective HDL levels to rise by 15-20% and inflammatory LDL fractions to decline by 20-25% within 4 weeks of consistent administration.',
    dietaryInteraction: 'Take twice daily before your two largest meals. The polyphenolic compounds are highly active under moderate lipid concentrations.'
  },
  {
    id: 'taurine-supplement',
    name: 'Taurine',
    chemicalName: '2-Aminoethanesulfonic Acid',
    category: 'supplements',
    description: 'A vital amino sulfonic acid occurring naturally in the human body, with heavy concentrations in the brain, heart, eyes, and active skeletal muscle fibers. Highly critical for managing severe muscle cramping and agonizing "back pumps" frequently associated with specific anabolic agents.',
    clinicalResearch: 'Taurine serves as an essential cellular osmolyte and neuromodulator. It regulates intracellular calcium levels, potassium, and sodium balance, stabilizing cell membranes under physical and physiological stressors to prevent hyper-excitability of muscle tissues.',
    typicalDosage: '1,000 mg - 3,000 mg daily',
    frequencyText: 'Taken orally once daily, ideally pre-workout or before sleep.',
    halfLife: 'Approx. 1.5 hours in plasma (retained systemically in tissue cells for longer durations)',
    benefits: [
      'Plus (+): Eradicates extreme muscular cramping and painful "back pumps" during heavy cycles',
      'Plus (+): Regulates key cellular mineral balances (calcium, magnesium, potassium)',
      'Plus (+): Optimizes muscle cell hydration and supports overall cell volume',
      'Plus (+): Delivers a calming effect to the nervous system by modulating GABA receptors'
    ],
    sideEffects: [
      'Minus (-): Mild temporary stomach acidity if consumed in high doses on a completely empty stomach'
    ],
    suggestedCycleWeeks: 'Ongoing / Year-round baseline support.',
    deliveryForm: 'pill',
    realisticGains: 'Complete mitigation of debilitating muscular cramps and lower-back tightness within 3-5 days. It improves cellular hydration, enabling fuller muscular performance and stamina during high-stress training sessions.',
    dietaryInteraction: 'Best consumed with a large glass of water. Can be taken alongside pre-workout nutrition or right before bed.'
  },
  {
    id: 'glycine-supplement',
    name: 'Glycine',
    chemicalName: 'Aminoacetic Acid',
    category: 'supplements',
    description: 'The simplest stable amino acid in existence, performing crucial duty as a primary building block for structural proteins, endogenous collagen synthesis, and functioning as an inhibitory neurotransmitter in the central nervous system.',
    clinicalResearch: 'Glycine binds to and activates inhibitory glycine receptors in the brain stem and spinal cord, which calms neuronal excitability and lowers core body temperature to facilitate deep sleep. It is also the rate-limiting amino acid for endogenous collagen fabrication and cellular glutathione synthesis.',
    typicalDosage: '3,000 mg - 5,000 mg daily',
    frequencyText: 'Taken orally once daily as capsules or powder 30-60 minutes before bed.',
    halfLife: 'Approx. 3 - 4 hours',
    benefits: [
      'Plus (+): Substantially improves deep slow-wave sleep duration and accelerates sleep onset',
      'Plus (+): Serves as the ultimate rate-limiting building block for joint cartilage and collagen repair',
      'Plus (+): Functions as a critical co-factor in compiling Glutathione, the master antioxidant',
      'Plus (+): Helps improve systemic insulin sensitivity and regulates blood sugar levels'
    ],
    sideEffects: [
      'Minus (-): Very mild morning grogginess if first establishing a dosing protocol over 5g'
    ],
    suggestedCycleWeeks: 'Ongoing / Year-round baseline support.',
    deliveryForm: 'pill',
    realisticGains: 'Significant improvement in sleep quality metrics and cartilage joint resilience. Expect highly optimized morning wakefulness, decreased muscle-joint soreness, and rapid recovery of nervous system energy within a week of use.',
    dietaryInteraction: 'Extremely effective when consumed with a non-caffeinated evening herbal tea, or alongside a post-workout protein shake to supply complete recovery amino blocks.'
  },
  {
    id: 'omega-3-fish-oil',
    name: 'Omega-3 Fish Oil',
    chemicalName: 'Concentrated EPA & DHA Essential Fatty Acids',
    category: 'supplements',
    description: 'An ultra-purified, clinical-tier softgel oil complex delivering highly concentrated Omega-3 essential fatty acids (EPA and DHA) to support cardiovascular integrity and counter cycle-induced lipid strains.',
    clinicalResearch: 'Eicosapentaenoic Acid (EPA) and Docosahexaenoic Acid (DHA) integrate directly into the phospholipid bilayer of cardiac and vascular cells. This processes down-regulation of inflammatory cytokines, reduces circulating blood triglycerides, and improves endothelial elasticity.',
    typicalDosage: '2,000 mg daily with a fat-containing meal',
    frequencyText: 'Taken orally once daily alongside a whole food meal.',
    halfLife: 'Highly stored in cell membranes; clearance occurs over several weeks',
    benefits: [
      'Plus (+): Supports cardiovascular left ventricular contractile strength and rhythm',
      'Plus (+): Elevates heart-protective HDL and lowers elevated blood triglycerides',
      'Plus (+): Relieves joint dryness by lubricating articular cartilage and reducing crepitus',
      'Plus (+): Strengthens cognitive function, myelin sheath health, and overall neurological performance'
    ],
    sideEffects: [
      'Minus (-): Minor "fishy burps" if consumed on a completely empty stomach'
    ],
    suggestedCycleWeeks: 'Ongoing / Year-round daily foundation.',
    deliveryForm: 'pill',
    realisticGains: 'Noticeable reduction in joint inflammation and dry creaking shoulders/knees in 2-3 weeks. Over a 12-week span, it helps optimize healthy cholesterol, maintaining a resilient lipid panel during demanding athletic cycles.',
    dietaryInteraction: 'Must be taken with a meal containing dietary fats to ensure maximum pancreatic lipase release and optimal absorption of the omega oils.'
  },
  {
    id: 'benfotiamine-supplement',
    name: 'Benfotiamine',
    chemicalName: 'S-benzoylthiamine O-monophosphate',
    category: 'supplements',
    description: 'A highly bioavailable, fat-soluble synthetic derivative of Thiamine (Vitamin B1). Achieves up to 5 times greater intracellular concentration than water-soluble thiamine salts, defending endothelial cells and micro-vasculature from carbohydrate-induced glycation and nerve damage.',
    clinicalResearch: 'Benfotiamine crosses cellular lipid barriers with ease and converts into active thiamine pyrophosphate. It strongly activates the enzyme transketolase, which redirects toxic glucose metabolites away from damaging capillary/nerve pathways, entirely blocking advanced glycation end-product (AGE) formulation.',
    typicalDosage: '300 mg - 600 mg daily',
    frequencyText: 'Taken orally once or twice daily with a meal.',
    halfLife: 'Approx. 3 - 5 hours in blood plasma',
    benefits: [
      'Plus (+): Strongly prevents the accumulation of toxic advanced glycation end-products (AGEs)',
      'Plus (+): Clears diabetic and idiopathic neuro-tingling, numbness, and nerve pain',
      'Plus (+): Preserves delicate kidney filtering capillaries and general vascular endothelium',
      'Plus (+): Elevates metabolic thiamine levels needed for efficient ATP cellular energy production'
    ],
    sideEffects: [
      'Minus (-): Rare, mild gastrointestinal flatulence or temporary body scent shifts'
    ],
    suggestedCycleWeeks: '8 - 12 weeks during high-calorie/carbohydrate bulk cycles, or year-round.',
    deliveryForm: 'pill',
    realisticGains: 'Rapid resolution of peripheral nerve tingling, optimized carbohydrate metabolism, and elevated muscular energy states. Ideal defense for high-carb regimens or off-season caloric surpluses.',
    dietaryInteraction: 'Highly synergistic when taken with standard B-vitamin complexes and meals high in clean, complex carbohydrates.'
  },
  {
    id: 'trace-minerals-enhanced',
    name: 'Trace Minerals Enhanced',
    chemicalName: 'Ionic Trace Elements & Sea Kelp Blend',
    category: 'supplements',
    description: 'A complete spectrum of pristine ionic trace elements, packed with critical Zinc, Copper, Manganese, Selenium, Boron, and sea-kelp natural Iodine. Designed to activate over 300 enzymatic reactions vital for thyroid conversion and natural hormone balance.',
    clinicalResearch: 'Trace elements function as key catalytic cofactors in enzymes handling cellular division, growth, and detoxification. Iodine and Selenium are indispensable for thyroid T4-to-T3 hormone conversions, while Zinc is required for luteinizing hormone (LH) and testosterone synthesis.',
    typicalDosage: '1 capsule daily',
    frequencyText: 'Taken orally once daily, preferably with a main meal or dinner.',
    halfLife: 'N/A (Essential minerals remain stored in skeletal bone and organ reservoirs)',
    benefits: [
      'Plus (+): Supplies essential catalytic cofactors for testosterone and endocrine health',
      'Plus (+): Stabilizes thyroid conversions (T4 to active T3) to sustain metabolic rate',
      'Plus (+): Restores critical ionic mineral concentrations depleted through intense sweating',
      'Plus (+): Accelerates skin tissue cellular healing and supports quality hair growth'
    ],
    sideEffects: [
      'Minus (-): Slight metal taste or mild transient stomach cramping if taken without food'
    ],
    suggestedCycleWeeks: 'Ongoing / Year-round daily baseline support.',
    deliveryForm: 'pill',
    realisticGains: 'Elimination of mineral deficiency fatigues, stabilized thyroid performance, improved dermal/nail health, and structural support for hormonal parameters within 2-4 weeks of daily supplementation.',
    dietaryInteraction: 'Must be taken with a whole food meal (ideally dinner) to maximize mineral transport and gastric safety.'
  },
  {
    id: 'extended-release-niacin',
    name: 'Extended-Release Niacin',
    chemicalName: 'Wax-Matrix Nicotinic Acid',
    category: 'supplements',
    description: 'A clinical-strength extended-release formulation of Niacin (Vitamin B3) utilizing a vegetable-wax matrix release system. Engineered to avoid the intense cutaneous "niacin flush" while forcefully optimizing lipid balances.',
    clinicalResearch: 'Nicotinic acid acts inside the liver to down-regulate the key enzyme diacylglycerol acyltransferase 2, restricting triglycerides synthesis. Simultaneously, it stabilizes and slows the clearance of cardio-protective ApoA-I proteins, forcing real elevations in heart-healthy HDL fractions.',
    typicalDosage: '500 mg - 1,000 mg once daily',
    frequencyText: 'Taken orally once daily with dinner or an evening snack.',
    halfLife: 'Slow release over 6 to 8 hours by its wax-matrix carrier',
    benefits: [
      'Plus (+): Uniquely raises heart-protective HDL cholesterol and lowers stubborn LDL/Lp(a)',
      'Plus (+): Wax-matrix design prevents annoying vascular itching and skin heat flushes',
      'Plus (+): Serves as an immediate direct precursor to building mitochondrial NAD+ energy complexes',
      'Plus (+): Promotes rich vascular dilation to improve micro-circulation'
    ],
    sideEffects: [
      'Minus (-): Mild localized skin warming if consumed alongside hot beverages or alcohol'
    ],
    suggestedCycleWeeks: 'Used in 12-week cycles to optimize cholesterol levels, or continuous daily.',
    deliveryForm: 'pill',
    realisticGains: 'Extremely powerful cholesterol modulation. Expect low HDL markers to climb by up to 20-30% and arterial triglycerides to stabilize within 4 to 6 weeks of continuous, disciplined usage.',
    dietaryInteraction: 'Always consume with a cool glass of water alongside a solid meal (fat content is helpful) to guarantee the wax-matrix releases at the intended biological speed. Avoid hot beverages right after dosing.'
  },
  {
    id: 'vitamin-d3-k2-synergy',
    name: 'Vitamin D3 & K2',
    chemicalName: 'Cholecalciferol & Menaquinone-7 (MK-7) Synergy',
    category: 'supplements',
    description: 'A critical metabolic vitamin synergy. Vitamin D3 drives intestinal calcium absorption, while Bioactive Vitamin K2 activates osteocalcin and matrix Gla proteins to deposit calcium strictly into bones and teeth, shielding blood vessels from calcification.',
    clinicalResearch: 'Vitamin D receptor (VDR) is present in almost all human tissues and directly regulates hundreds of genes, including endocrine and immune parameters. Vitamin K2 as Menaquinone-7 has a 72-hour system half-life, ensuring continuous systemic carboxylating enzyme support.',
    typicalDosage: '5,000 IU D3 / 100 mcg K2 daily',
    frequencyText: 'Taken orally once daily as a softgel capsule with a meal containing wholesome dietary fats.',
    halfLife: 'Extremely long systemic clearance (stored in lipid layers)',
    benefits: [
      'Plus (+): Optimizes free testosterone production, skeletal protein synthesis, and muscular force',
      'Plus (+): Activates Matrix Gla Protein (MGP) to prevent calcium blockages in vascular arteries',
      'Plus (+): Upregulates systemic innate immunity, preventing respiratory and general systemic fatigue',
      'Plus (+): Supports skeletal mineral content, building high joint and bone density'
    ],
    sideEffects: [
      'Minus (-): Non-toxic at specified ranges, but excess without calcium can cause hypercalcemia'
    ],
    suggestedCycleWeeks: 'Ongoing / Year-round baseline health support.',
    deliveryForm: 'pill',
    realisticGains: 'Substantial boost in immune defense, energy, bone joint protection, and optimized endocrine parameters. Assists in stabilizing blood pressure and preserves lean skeletal functions within 4 weeks.',
    dietaryInteraction: 'Must be consumed with healthy dietary fats (eggs, nuts, fish oil, meat) to facilitate maximum absorption in the lymphatic system.'
  },
  {
    id: 'magnesium-bisglycinate',
    name: 'Magnesium Bisglycinate',
    chemicalName: 'Fully Chelated Magnesium Diglycinate',
    category: 'supplements',
    description: 'The highest bioavailable chelated magnesium format. Coupled to the calming transmitter glycine, it bypasses the digestive laxative side-effects of cheap oxides, acting directly as an intracellular muscle relaxing agent.',
    clinicalResearch: 'Acts as a critical cofactor in over 300 enzymatic reactions, including ATP energy synthesis, protein translation, and muscular contraction. Glycinated magnesium crosses biological barriers to bind to inhibitory GABA-A receptors, calming neuronal arousal.',
    typicalDosage: '200 mg - 450 mg daily before sleep',
    frequencyText: 'Taken orally once daily as capsules, 30 to 60 minutes before bedtime.',
    halfLife: 'Tissue pools remain highly saturated once daily saturation levels are established',
    benefits: [
      'Plus (+): Eliminates annoying muscle twitching, night spasms, and persistent skeletal tightness',
      'Plus (+): Induces physical muscle relaxation and calms central nervous systemic stress',
      'Plus (+): Dramatically improves deep slow-wave sleep duration and next-day energy parameters',
      'Plus (+): Helps control vascular constriction, supporting lower resting blood pressure'
    ],
    sideEffects: [
      'Minus (-): Rare, mild morning relaxation/grogginess if first establishing dose limits'
    ],
    suggestedCycleWeeks: 'Ongoing / Year-round structural wellness.',
    deliveryForm: 'pill',
    realisticGains: 'Total eradication of physical muscle spasms, optimized sleep efficiency, and a calm, recovered nervous system. Assists in regulating muscle protein pathways and supports resting heart rate.',
    dietaryInteraction: 'Avoid co-ingesting with high-dose calcium supplements or iron, as they compete for identical cellular transporter pathways.'
  },
  {
    id: 'coenzyme-q10-ubiquinol',
    name: 'Coenzyme Q10 (Ubiquinol)',
    chemicalName: 'Ubiquinol (Active Mitochondrial CoQ10 Electron Carrier)',
    category: 'supplements',
    description: 'The highly bioavailable, pre-reduced antioxidant format of Coenzyme Q10. Critical for the mitochondrial electron transport chain to generate cellular ATP power, while specifically shielding cardiac and arterial cells from oxidation under cycle stress.',
    clinicalResearch: 'Ubiquinol serves as a powerful lipid-soluble antioxidant inside cellular membranes. It prevents the initiation and propagation of lipid peroxidation, which is main driver of arterial cardiovascular damage, while naturally supporting endothelial cell dilation.',
    typicalDosage: '100 mg - 200 mg once daily',
    frequencyText: 'Taken orally once daily as a softgel capsule with morning nutrition.',
    halfLife: 'Approx. 33 hours (long systemic stability)',
    benefits: [
      'Plus (+): Powers mitochondrial ATP synthesis, optimizing workout recovery and aerobic capacity',
      'Plus (+): Forcefully defends vascular arterial walls from cardiotoxic compound strains',
      'Plus (+): Reverses toxic muscle fatigue and metabolic muscle soreness caused by statutory drugs',
      'Plus (+): Supports left ventricular ejection fraction and cardiac pulse health'
    ],
    sideEffects: [
      'Minus (-): Non-toxic with zero noted side effects at standard ranges'
    ],
    suggestedCycleWeeks: 'Continuously used during any intense physical cycle blocks or year-round.',
    deliveryForm: 'pill',
    realisticGains: 'Exceptional enhancement in cellular energy capacity, reduction in systemic muscle soreness, and a stable, high-performance cardiovascular profile. Protects healthy arterial elasticity.',
    dietaryInteraction: 'Requires association with a whole-food meal containing fats to initiate normal physiological absorption.'
  },
  {
    id: 'clinical-multivitamin',
    name: 'Clinical Multivitamin Core',
    chemicalName: 'Activated Micronutrient & Mineral Chelates',
    category: 'supplements',
    description: 'A clinical-strength multi-nutrient spectrum featuring activated coenzyme B-vitamins, fully chelated mineral complexes, and organic antioxidants. Acts as metabolic cellular insurance during demanding athletic cycles.',
    clinicalResearch: 'Fills persistent cellular micronutrient gaps that occur under heavy anabolic synthesis or physical load. Loaded with methylcobalamin (B12) and pyridoxal-5-phosphate (B6) to support neuro-chemical pathways and prevent toxic homocysteine build-up.',
    typicalDosage: '1 - 2 tablets daily',
    frequencyText: 'Taken orally once daily with breakfast or your first solid feeding block.',
    halfLife: 'Water-soluble elements clear in 8 to 12 hours, needing regular daily supply',
    benefits: [
      'Plus (+): Bridges all trace nutritional gaps, ensuring flawless enzymatic pathway function',
      'Plus (+): Activated B-Complex supports cellular glycogen metabolism and healthy blood counts',
      'Plus (+): Supports cellular mitochondrial energy synthesis, reducing constant fatigue',
      'Plus (+): Broad-spectrum antioxidants neutralize training-induced free radical loads'
    ],
    sideEffects: [
      'Minus (-): May turn urine a bright yellow color (due to harmless B2/riboflavin clearance)'
    ],
    suggestedCycleWeeks: 'Ongoing / Year-round systemic baseline support.',
    deliveryForm: 'pill',
    realisticGains: 'Sustained daily vitality, elimination of micronutrient deficiency fatigues, optimized metabolic conversion, and robust support for cellular organ parameters under intensive physical stress.',
    dietaryInteraction: 'Always consume alongside solid food to guarantee correct absorption of fat-soluble vitamins (A, D, E, K) and prevent mild gastric mineral nausea.'
  }
];

