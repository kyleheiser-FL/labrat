import { useState, useEffect } from 'react';
import { HelpCircle, RefreshCw, Syringe, Info, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface ReconstitutionCalculatorProps {
  onApplyConfig?: (config: { vialSizeMg: number; bacWaterMl: number; doseUnit: string; doseAmount: number }) => void;
  initialVialMg?: number;
  initialWaterMl?: number;
  initialDoseMcg?: number;
}

export default function ReconstitutionCalculator({
  onApplyConfig,
  initialVialMg = 5,
  initialWaterMl = 2,
  initialDoseMcg = 250
}: ReconstitutionCalculatorProps) {
  // Calculator inputs
  const [vialSizeMg, setVialSizeMg] = useState<number>(initialVialMg);
  const [bacWaterMl, setBacWaterMl] = useState<number>(Math.min(initialWaterMl, 3));
  const [targetDoseMcg, setTargetDoseMcg] = useState<number>(initialDoseMcg);
  const [syringeSize, setSyringeSize] = useState<number>(100); // 100 units = 1.0cc, support up to 3.0cc (300 units)
  const [doseUnit, setDoseUnit] = useState<'mcg' | 'mg'>('mg');
  const [typedDose, setTypedDose] = useState<string>((initialDoseMcg / 1000).toString());

  // Presets
  const vialPresets = [2, 5, 10, 15, 20];
  // Vials are 3ml — never suggest more BAC water than the vial can hold
  const waterPresets = [1, 1.5, 2, 2.5, 3];

  // Calculated values
  const [totalMcg, setTotalMcg] = useState<number>(5000);
  const [mcgPerUnit, setMcgPerUnit] = useState<number>(25);
  const [requiredUnits, setRequiredUnits] = useState<number>(10);
  const [totalDoses, setTotalDoses] = useState<number>(20);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const total = vialSizeMg * 1000;
    // 1 unit = 0.01 ml on U100 standard syringe scale
    // Dose per unit = total mcg / (bac water ml * 100 units/ml)
    const perUnit = total / (bacWaterMl * 100);
    const unitsNeeded = Math.round((targetDoseMcg / perUnit) * 10) / 10;
    const dosesAvailable = Math.floor(total / targetDoseMcg);

    setTotalMcg(total);
    setMcgPerUnit(parseFloat(perUnit.toFixed(2)));
    setRequiredUnits(unitsNeeded);
    setTotalDoses(dosesAvailable);
  }, [vialSizeMg, bacWaterMl, targetDoseMcg]);

  // Sync typedDose representation with numeric state
  useEffect(() => {
    const val = doseUnit === 'mcg' ? targetDoseMcg : targetDoseMcg / 1000;
    // Limit to 3 decimal places to prevent float precision artifacts
    setTypedDose(parseFloat(val.toFixed(3)).toString());
  }, [targetDoseMcg, doseUnit]);

  const handleSliderChange = (val: number) => {
    if (doseUnit === 'mcg') {
      setTargetDoseMcg(val);
    } else {
      setTargetDoseMcg(Math.round(val * 1000));
    }
  };

  const handleTypedDoseChange = (text: string) => {
    const numeric = parseFloat(text);
    if (!isNaN(numeric) && numeric >= 0) {
      if (doseUnit === 'mcg') {
        setTargetDoseMcg(Math.round(numeric));
      } else {
        setTargetDoseMcg(Math.round(numeric * 1000));
      }
    }
  };

  const handleCopySummary = () => {
    const text = `Peptide Reconstitution Summary:\n• Vial Size: ${vialSizeMg} mg\n• Bacteriostatic Water: ${bacWaterMl} ml / cc\n• Concentration: ${doseUnit === 'mcg' ? `${mcgPerUnit} mcg` : `${(mcgPerUnit / 1000).toFixed(4).replace(/\.?0+$/, '')} mg`} per syringe unit (0.01ml)\n• Target Dose: ${doseUnit === 'mcg' ? `${targetDoseMcg} mcg` : `${targetDoseMcg / 1000} mg`}\n• Syringe Draw: Draw to ${requiredUnits} units (${(requiredUnits * 0.01).toFixed(2)} ml / cc)\n• Yield: ${totalDoses} doses per vial\nCalculated using LabRat.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const pct = Math.min(1.0, requiredUnits / (syringeSize || 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="reconstitution-calculator-container">
      {/* Left Input panel */}
      <div className="lg:col-span-7 bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md" id="calc-inputs-panel">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Syringe className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-medium text-slate-100">Peptide Mix Helper</h3>
          </div>
          <button
            onClick={() => {
              setVialSizeMg(5);
              setBacWaterMl(2);
              setTargetDoseMcg(1000); // 1 mg
              setSyringeSize(100);
              setDoseUnit('mg');
              setTypedDose('1');
            }}
            className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1 transition"
            title="Reset to defaults"
            id="reset-calc"
          >
            <RefreshCw className="w-3 h-3" /> Reset
          </button>
        </div>

        <div className="space-y-6">
          {/* Vial Size */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                Vial Size (Peptide Quantity)
                <span className="text-[10px] text-slate-500 font-mono">(mg)</span>
              </label>
              <span className="text-sm font-semibold text-cyan-400 font-mono">{vialSizeMg} mg</span>
            </div>
            <input
              type="range"
              min="1"
              max="30"
              step="1"
              value={vialSizeMg}
              onChange={(e) => setVialSizeMg(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer bg-slate-800 rounded-lg appearance-none h-2"
              id="vial-size-input"
            />
            <div className="flex gap-1.5 mt-2">
              {vialPresets.map((preset) => (
                <button
                  key={`vial-${preset}`}
                  onClick={() => setVialSizeMg(preset)}
                  className={`px-2.5 py-1 text-xs font-mono rounded border transition ${
                    vialSizeMg === preset
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40'
                      : 'bg-[#1e293b]/40 text-slate-400 border-transparent hover:border-slate-700 hover:text-slate-200'
                  }`}
                  id={`preset-vial-${preset}`}
                >
                  {preset}mg
                </button>
              ))}
            </div>
          </div>

          {/* Bac Water Volume */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                Bacteriostatic Water Added (Vial Fluid Volume)
                <span className="text-[10px] text-slate-500 font-mono">(ml / cc)</span>
              </label>
              <span className="text-sm font-semibold text-cyan-400 font-mono">{bacWaterMl} ml / cc</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3"
              step="0.1"
              value={bacWaterMl}
              onChange={(e) => setBacWaterMl(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer bg-slate-800 rounded-lg appearance-none h-2"
              id="bac-water-input"
            />
            <div className="flex gap-1.5 mt-2">
              {waterPresets.map((preset) => (
                <button
                  key={`water-${preset}`}
                  onClick={() => setBacWaterMl(preset)}
                  className={`px-2.5 py-1 text-xs font-mono rounded border transition ${
                    bacWaterMl === preset
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40'
                      : 'bg-[#1e293b]/40 text-slate-400 border-transparent hover:border-slate-700 hover:text-slate-200'
                  }`}
                  id={`preset-water-${preset}`}
                >
                  {preset} ml/cc
                </button>
              ))}
            </div>
          </div>

          {/* Desired Dose */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-1.5">
                Target Dose per Injection
              </label>
              
              <div className="flex items-center gap-2">
                {/* Visual Direct Input Box */}
                <div className="relative flex items-center bg-[#1e293b]/40 rounded-lg border border-slate-700/60 focus-within:border-cyan-500/80 transition px-2.5 py-1 max-w-[100px]">
                  <input
                    type="text"
                    value={typedDose}
                    onChange={(e) => {
                      setTypedDose(e.target.value);
                      handleTypedDoseChange(e.target.value);
                    }}
                    className="text-right font-mono font-bold text-cyan-400 bg-transparent w-full text-sm focus:outline-none focus:ring-0 p-0"
                    id="typed-dose-input"
                    placeholder="0.0"
                  />
                </div>

                {/* Snug Inline Unit Switcher */}
                <div className="flex bg-[#1e293b]/60 rounded-lg p-0.5 border border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => {
                      setDoseUnit('mcg');
                    }}
                    className={`px-2 py-0.5 text-[10px] sm:text-xs font-mono font-bold rounded transition ${
                      doseUnit === 'mcg'
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                    id="unit-mcg"
                  >
                    mcg
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDoseUnit('mg');
                    }}
                    className={`px-2 py-0.5 text-[10px] sm:text-xs font-mono font-bold rounded transition ${
                      doseUnit === 'mg'
                        ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/25'
                        : 'text-slate-400 hover:text-slate-200 border border-transparent'
                    }`}
                    id="unit-mg"
                  >
                    mg
                  </button>
                </div>
              </div>
            </div>

            <input
              type="range"
              min={doseUnit === 'mcg' ? 10 : 0.01}
              max={doseUnit === 'mcg' ? 10000 : 10.0}
              step={doseUnit === 'mcg' ? 10 : 0.01}
              value={doseUnit === 'mcg' ? targetDoseMcg : targetDoseMcg / 1000}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer bg-slate-800 rounded-lg appearance-none h-2"
              id="target-dose-input"
            />
            
            <div className="flex gap-1.5 mt-2 overflow-x-auto pb-1">
              {(doseUnit === 'mcg' ? [100, 250, 300, 500, 1000] : [0.1, 0.25, 0.3, 0.5, 1.0]).map((preset) => {
                const isSelected = doseUnit === 'mcg'
                  ? targetDoseMcg === preset
                  : Math.abs((targetDoseMcg / 1000) - preset) < 0.001;
                return (
                  <button
                    key={`dose-preset-${preset}`}
                    onClick={() => {
                      if (doseUnit === 'mcg') {
                        setTargetDoseMcg(preset);
                      } else {
                        setTargetDoseMcg(preset * 1000);
                      }
                    }}
                    className={`px-2 py-1 text-xs font-mono rounded border transition shrink-0 ${
                      isSelected
                        ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40'
                        : 'bg-[#1e293b]/40 text-slate-400 border-transparent hover:border-slate-700 hover:text-slate-200'
                    }`}
                    id={`preset-dose-${preset}`}
                  >
                    {doseUnit === 'mcg' ? `${preset} mcg` : `${preset} mg`}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Syringe Configuration */}
          <div className="pt-2 border-t border-[#1e293b]/60">
            <label className="text-sm font-medium text-slate-300 block mb-2">
              Syringe Size Specification (Typically 0.3cc to 3cc)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[300, 200, 100, 50, 30].map((size) => (
                <button
                  key={`syringe-${size}`}
                  onClick={() => setSyringeSize(size)}
                  className={`py-2 px-1 text-center rounded-xl border transition flex flex-col items-center justify-center ${
                    syringeSize === size
                      ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/40 font-semibold'
                      : 'bg-[#1e293b]/40 text-slate-400 border-slate-800/80 hover:border-slate-700'
                  }`}
                  id={`syringe-size-${size}`}
                >
                  <div className="text-sm font-mono font-bold">{(size * 0.01).toFixed(1)} cc</div>
                  <div className="text-[9px] text-slate-500 font-mono">{size} U / {(size * 0.01).toFixed(1)} ml</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right Output & Syringe Blueprint Panel */}
      <div className="lg:col-span-5 flex flex-col gap-5">
        {/* Results Card */}
        <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-6 shadow-xl backdrop-blur-md flex-1" id="calc-results-panel">
          <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Calculation Output</h4>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-[#1e293b]/30 border border-[#1e293b]/55 p-3.5 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Total Vial Strength</span>
              <span className="text-lg font-mono font-bold text-slate-200">
                {doseUnit === 'mcg' ? (
                  <>{vialSizeMg * 1000} <span className="text-xs text-slate-400 font-sans">mcg</span></>
                ) : (
                  <>{vialSizeMg} <span className="text-xs text-slate-400 font-sans">mg</span></>
                )}
              </span>
            </div>
            <div className="bg-[#1e293b]/30 border border-[#1e293b]/55 p-3.5 rounded-xl">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block mb-1">Potency Per Unit</span>
              <span className="text-lg font-mono font-bold text-slate-200">
                {doseUnit === 'mcg' ? (
                  <>{mcgPerUnit} <span className="text-xs text-slate-400 font-sans">mcg</span></>
                ) : (
                  <>{(mcgPerUnit / 1000).toFixed(4).replace(/\.?0+$/, '')} <span className="text-xs text-slate-400 font-sans">mg</span></>
                )}
              </span>
            </div>
          </div>

          <div className="bg-cyan-500/5 border border-cyan-500/20 p-5 rounded-xl mb-6">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs text-cyan-400 uppercase tracking-wider block mb-1 font-semibold">Syringe Draw Amount</span>
                <div className="text-3xl font-mono font-bold text-cyan-300">
                  {requiredUnits} <span className="text-lg text-cyan-400 font-sans">Units</span>
                </div>
                <span className="text-xs text-slate-400 mt-1 block">
                  Equivalent to <span className="font-mono text-slate-300">{(requiredUnits * 0.01).toFixed(2)} ml / cc</span> of volume
                </span>
              </div>
              <div className="p-2 bg-cyan-400/10 rounded-full">
                <Syringe className="w-6 h-6 text-cyan-300 animate-pulse" />
              </div>
            </div>

            {requiredUnits > syringeSize && (
              <div className="mt-3.5 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg flex items-start gap-1.5 font-mono">
                <Info className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  <strong>Warning:</strong> Target dose ({doseUnit === 'mcg' ? `${targetDoseMcg} mcg` : `${targetDoseMcg / 1000} mg`}) exceeds your syringe capacity of {syringeSize} units ({(syringeSize * 0.01).toFixed(1)} cc). Increase water ratio or decrease dose.
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2.5 text-sm text-slate-300">
            <div className="flex justify-between pb-2 border-b border-[#1e293b]/50">
              <span className="text-slate-400">Doses Yield Per Vial</span>
              <span className="font-mono font-bold text-slate-200">{totalDoses} doses</span>
            </div>
            <div className="flex justify-between pb-2 border-b border-[#1e293b]/50">
              <span className="text-slate-400">Reconstitution Fluid</span>
              <span className="text-slate-200">Bacteriostatic Water (0.9%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Total Liquid Formulated</span>
              <span className="font-mono text-slate-200">{bacWaterMl} ml / cc</span>
            </div>
          </div>

          <div className="mt-6 flex gap-2.5">
            <button
              onClick={handleCopySummary}
              className="flex-1 py-2.5 px-4 bg-[#1e293b] hover:bg-[#334155]/80 active:bg-slate-800 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-slate-700/60"
              id="copy-summary-btn"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Copied!
                </>
              ) : (
                'Copy summary'
              )}
            </button>
            {onApplyConfig && (
              <button
                onClick={() => onApplyConfig({
                  vialSizeMg,
                  bacWaterMl,
                  doseUnit,
                  doseAmount: doseUnit === 'mg' ? (targetDoseMcg / 1000) : targetDoseMcg
                })}
                className="flex-1 py-2.5 px-4 bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
                id="apply-calc-btn"
              >
                Apply to compound
              </button>
            )}
          </div>
        </div>

        {/* Syringe Visualizer */}
        <div className="bg-[#0f172a]/70 border border-[#1e293b]/80 rounded-2xl p-5 shadow-xl backdrop-blur-md flex flex-col justify-center items-center overflow-hidden" id="syringe-visualizer-card">
          <span className="text-xs text-slate-400 uppercase tracking-widest block mb-4 self-start font-medium">{syringeSize <= 100 ? 'Insulin' : 'Standard'} Syringe Blueprint</span>
          
          <div className="w-full flex justify-center py-6 px-1.5 select-none relative bg-slate-950/20 rounded-xl border border-slate-800/40">
            {/* Horizontal Syringe Graphic */}
            <div className="relative w-[380px] h-20 flex items-center mx-auto">
              {/* Syringe Needle */}
              <div className="absolute left-[0px] w-6 h-[1.5px] bg-slate-500/80 shadow-[0_0_8px_rgba(255,255,255,0.4)]"></div>
              {/* Syringe Needle Connector Hub */}
              <div className="absolute left-[24px] w-3 h-8 bg-gradient-to-r from-slate-400 to-slate-200 border border-slate-500 rounded-s-md z-20"></div>
              
              {/* Syringe Main Glass Cylinder */}
              <div className="absolute left-[36px] w-[180px] h-12 bg-slate-900/60 border border-slate-700/60 rounded-e-md shadow-inner flex items-center overflow-hidden z-10">
                {/* Visual Fluid Shading */}
                <div 
                  className="absolute left-0 h-full bg-cyan-500/25 border-r border-cyan-400/60 shadow-[inset_-4px_0_12px_rgba(34,211,238,0.3)] transition-all duration-300"
                  style={{ width: `${15 + pct * 140}px` }}
                ></div>

                {/* Measurable Active Range Container */}
                <div className="absolute top-0 bottom-0 pointer-events-none" style={{ left: '15px', width: '140px' }}>
                  
                  {/* ml scale labels — top of barrel (for ml-graduated syringes) */}
                  <div className="absolute inset-x-0 top-1 h-3 flex justify-between text-[7px] font-mono text-slate-500 items-start leading-none">
                    {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((ratio) => {
                      const mlVal = (syringeSize * 0.01 * ratio).toFixed(ratio === 0 ? 0 : 1);
                      const displayVal = ratio === 1.0 ? `${mlVal}ml` : ratio === 0 ? '' : mlVal;
                      return (
                        <span
                          key={`ml-${ratio}`}
                          className="absolute top-0 -translate-x-1/2"
                          style={{ left: `${ratio * 100}%` }}
                        >
                          {displayVal}
                        </span>
                      );
                    })}
                  </div>

                  {/* Unit scale labels — bottom of barrel */}
                  <div className="absolute inset-x-0 bottom-1 h-3 flex justify-between text-[8px] font-mono text-slate-400 font-bold items-end leading-none">
                    {[0, 0.2, 0.4, 0.6, 0.8, 1.0].map((ratio) => {
                      const val = Math.round(syringeSize * ratio);
                      const displayVal = ratio === 1.0 ? `${val}U` : val;
                      return (
                        <span
                          key={ratio}
                          className="absolute bottom-0 -translate-x-1/2"
                          style={{ left: `${ratio * 100}%` }}
                        >
                          {displayVal}
                        </span>
                      );
                    })}
                  </div>

                  {/* Ruler ticks */}
                  <div className="absolute inset-x-0 top-0 h-full flex justify-between items-start pt-[1px]">
                    {Array.from({ length: 41 }).map((_, i) => {
                      const isMajor = i % 10 === 0;
                      const isMedium = i % 5 === 0 && !isMajor;
                      const h = isMajor ? 'h-3' : isMedium ? 'h-2' : 'h-1.2';
                      const col = isMajor ? 'bg-slate-400' : isMedium ? 'bg-slate-500' : 'bg-slate-600/70';
                      return (
                        <div key={`tick-${i}`} className={`${h} ${col}`} style={{ width: '1px' }}></div>
                      );
                    })}
                  </div>

                </div>

                {/* Plunger Rubber Head */}
                <div 
                  className="absolute h-10 w-3 bg-gradient-to-r from-slate-700 via-slate-600 to-slate-800 border-r border-[#1e293b]/80 shadow-md transition-all duration-300 z-30"
                  style={{ left: `${15 + pct * 140}px` }}
                >
                  <div className="w-[1px] h-full bg-slate-500/50 mx-auto"></div>
                </div>
              </div>

              {/* Syringe Plunger Shaft (extending out of barrel) */}
              <div 
                className="absolute h-4 bg-gradient-to-b from-slate-600 to-slate-400 shadow-sm border border-slate-500 rounded-r-sm transition-all duration-300 z-0"
                style={{ 
                  left: `${63 + pct * 140}px`, 
                  width: '157px' 
                }}
              ></div>

              {/* Plunger Push Base Finger Tab */}
              <div 
                className="absolute h-10 w-2.5 bg-gradient-to-r from-slate-500 via-slate-700 to-slate-800 border border-slate-600 rounded-sm shadow-md transition-all duration-300 z-10"
                style={{ 
                  left: `${220 + pct * 140}px`
                }}
              ></div>
            </div>
          </div>
          
          <div className="mt-3.5 flex items-start gap-1.5 text-xs text-slate-400 text-center w-full justify-center flex-col">
            <div className="flex items-center gap-1.5 w-full justify-center">
              <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Draw the plunger of a <strong>{syringeSize} Units ({(syringeSize * 0.01).toFixed(1)} cc / ml)</strong> syringe to exactly the <strong>{requiredUnits}</strong> unit mark <span className="text-cyan-400 font-mono font-bold">(= {(requiredUnits * 0.01).toFixed(2)} ml)</span>.</span>
            </div>
            <p className="text-[10px] text-slate-500 text-center w-full font-mono">
              Some syringes use ml marks instead of units — the grey scale above the barrel shows your ml equivalent. <strong className="text-slate-400">{requiredUnits} units = {(requiredUnits * 0.01).toFixed(2)} ml</strong> on any 100U / 1.0 ml syringe.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
