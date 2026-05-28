import React from "react";

type ProtocolIconKind = "vitamins" | "joint" | "estrogen" | "endocrine";

const ICONS: Record<ProtocolIconKind, { label: string; neon: string; clinical: string }> = {
  vitamins: { label: "Vitamins", neon: "/protocol-icons/vitamins-neon.svg", clinical: "/protocol-icons/vitamins-clinical.svg" },
  joint: { label: "Joint health", neon: "/protocol-icons/joint-neon.svg", clinical: "/protocol-icons/joint-clinical.svg" },
  estrogen: { label: "Estrogen control", neon: "/protocol-icons/estrogen-neon.svg", clinical: "/protocol-icons/estrogen-clinical.svg" },
  endocrine: { label: "Endocrine support", neon: "/protocol-icons/endocrine-neon.svg", clinical: "/protocol-icons/endocrine-clinical.svg" },
};

function normalizeKind(value?: string): ProtocolIconKind {
  const v = String(value || "").toLowerCase();
  if (v.includes("joint") || v.includes("glucosamine")) return "joint";
  if (v.includes("estro") || v.includes("arimidex") || v.includes("ai")) return "estrogen";
  if (v.includes("endo") || v.includes("hcg")) return "endocrine";
  return "vitamins";
}

function isClinicalTheme(theme?: string) {
  const t = String(theme || "").toLowerCase();
  return t.includes("clinical") || t.includes("light") || t.includes("professional");
}

export default function ProtocolIcon({
  kind,
  label,
  theme,
  className = "",
}: {
  kind?: string;
  label?: string;
  theme?: string;
  className?: string;
}) {
  const key = normalizeKind(kind || label);
  const icon = ICONS[key];
  const src = isClinicalTheme(theme) ? icon.clinical : icon.neon;

  return (
    <img
      src={src}
      alt={label || icon.label}
      className={`labrat-protocol-icon ${className}`.trim()}
      loading="lazy"
      decoding="async"
      draggable={false}
    />
  );
}

export { ICONS as LABRAT_PROTOCOL_ICONS };
