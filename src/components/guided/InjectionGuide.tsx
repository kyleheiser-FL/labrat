import React from 'react';
import { Syringe as SyringeIcon } from 'lucide-react';
import GuideShell, { GuideStep } from './GuideShell';
import { LabTheme } from './guideArt';

interface InjectionGuideProps {
  compoundName: string;
  doseUnits?: number;
  theme: LabTheme;
  onClose: () => void;
}

export default function InjectionGuide({ compoundName, doseUnits, theme, onClose }: InjectionGuideProps) {
  const u = doseUnits && doseUnits > 0 ? Math.round(doseUnits) : null;
  const drawLabel = u ? `${u} units` : 'your prescribed dose';

  const steps: GuideStep[] = [
    { art: 'attach', title: 'Attach the luer-lock needle', body: 'Twist the needle firmly onto the luer-lock tip of the syringe until it locks — the thread stops it popping off under pressure. Then wipe the vial stopper with a fresh alcohol swab and let it dry.' },
    { art: 'air', title: 'Draw air equal to your dose', body: `Before touching the liquid, pull the plunger back to ${drawLabel} of air. Injecting this air into the vial first equalizes the pressure so your dose draws smoothly instead of fighting a vacuum.` },
    { art: 'pushair', title: 'Inject the air into the vial', body: 'With the vial upright, push the needle straight down through the centre of the rubber stopper and press the plunger, releasing the air into the space above the liquid. Keep the tip above the liquid line.' },
    { art: 'invert', title: 'Invert and draw your dose', body: `Flip the vial upside-down so the needle tip now sits in the pooled liquid. Slowly pull the plunger back to exactly ${drawLabel}.` },
    { art: 'bubbles', title: 'Clear the air bubbles', body: 'Hold the syringe needle-up, tap the barrel so bubbles rise to the top, then gently push the plunger until a tiny bead appears at the needle tip. Re-check your dose is still on the line.' },
    { art: 'swap', title: 'Swap to a fresh needle', body: "Twist off the needle you drew with and lock on a brand-new one for the injection — that's the whole point of the luer-lock. The draw needle is now dulled from the stopper; a fresh needle is sharper, cleaner, and far more comfortable." },
    { art: 'sites', title: 'Pick a subcutaneous site', body: 'Rotate between fatty areas: lower belly (a couple inches either side of the navel), love handles, or the front of the thigh. Rotate every dose so tissue stays healthy. Swab the spot and let it dry.' },
    { art: 'inject', title: 'Pinch, insert, inject slow', body: 'Pinch a fold of skin, insert the short needle at 45–90°, release the pinch, then press the plunger slowly and steadily. Withdraw and apply light pressure with a clean swab — do not rub.' },
    { art: 'dispose', title: 'Dispose safely', body: 'Drop the used needle straight into a sharps container — never re-cap by hand and never reuse a needle. Return your vial to the fridge.' },
  ];

  return (
    <GuideShell
      title="How to draw & inject"
      subtitle={`${compoundName} · luer-lock`}
      icon={<SyringeIcon className="w-4 h-4" />}
      accent="#6366f1"
      theme={theme}
      steps={steps}
      sceneOpts={{ units: u }}
      finishLabel="Done"
      onClose={onClose}
    />
  );
}
