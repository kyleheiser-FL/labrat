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
    deliveryForm: 'peptide'
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
    deliveryForm: 'peptide'
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
    deliveryForm: 'peptide'
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
    deliveryForm: 'peptide'
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
    deliveryForm: 'peptide'
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
    deliveryForm: 'peptide'
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
    deliveryForm: 'peptide'
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
    deliveryForm: 'peptide'
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
    deliveryForm: 'peptide'
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
    deliveryForm: 'peptide'
  },
  {
    id: 'pt-141',
    name: 'PT-141 (Bremelanotide)',
    chemicalName: 'Melanocortin Receptor Agonist Bremelanotide',
    category: 'lifestyle',
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
    deliveryForm: 'peptide'
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
    deliveryForm: 'peptide'
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
    deliveryForm: 'peptide'
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
    deliveryForm: 'peptide'
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
    deliveryForm: 'oil'
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
    deliveryForm: 'oil'
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
    deliveryForm: 'oil'
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
    deliveryForm: 'oil'
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
    deliveryForm: 'oil'
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
    deliveryForm: 'oil'
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
    deliveryForm: 'oil'
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
    deliveryForm: 'pill'
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
    deliveryForm: 'pill'
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
    deliveryForm: 'pill'
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
    deliveryForm: 'pill'
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
      'Safeguards breast breast areas from estrogenic tissue growth',
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
    deliveryForm: 'pill'
  }
];
