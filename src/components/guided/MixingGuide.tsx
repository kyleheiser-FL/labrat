import React from 'react';
import { Droplets } from 'lucide-react';
import GuideShell, { GuideStep } from './GuideShell';
import { LabTheme } from './guideArt';

interface MixingGuideProps {
  compoundName: string;
  vialSizeMg?: number;
  bacWaterMl?: number;
  theme: LabTheme;
  onClose: () => void;
}

export default function MixingGuide({ compoundName, vialSizeMg, bacWaterMl, theme, onClose }: MixingGuideProps) {
  const ml = bacWaterMl ?? 2;
  const mg = vialSizeMg ?? 10;
  const units = Math.round(ml * 100);

  const steps: GuideStep[] = [
    { art: 'swab', title: 'Sanitize everything', body: `Wipe the rubber stopper of both your ${compoundName} vial and your bacteriostatic (BAC) water vial with a fresh alcohol swab, and let them air-dry. Work on a clean surface with clean hands.` },
    { art: 'draw', title: `Draw ${ml} ml of BAC water`, body: `Pull ${ml} ml (${units} units on a U-100 insulin syringe) of bacteriostatic water into the syringe. This is your solvent — it dissolves the powder and keeps it sterile for weeks.` },
    { art: 'pour', title: 'Add water slowly, down the glass', body: `Push the needle through the ${compoundName} stopper and angle it so the water runs slowly down the inside glass wall — never blast it straight onto the powder, which can damage the compound.` },
    { art: 'swirl', title: 'Swirl gently — never shake', body: `Let it sit 30–60 seconds, then swirl gently until the powder fully dissolves and the solution turns clear. Shaking foams and can degrade the peptide.` },
    { art: 'store', title: 'Store it cold', body: `Your ${mg} mg vial is now ${ml} ml of solution (${(mg / ml).toFixed(1)} mg/ml). Refrigerate at 2–8 °C, use within ~28 days, and label it with today's date.` },
  ];

  return (
    <GuideShell
      title="How to mix"
      subtitle={compoundName}
      icon={<Droplets className="w-4 h-4" />}
      accent="#06b6d4"
      theme={theme}
      steps={steps}
      onClose={onClose}
    />
  );
}
