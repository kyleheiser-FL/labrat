#!/usr/bin/env node
const fs = require("fs");
const path = "src/components/CyclePlanner.tsx";

if (!fs.existsSync(path)) {
  console.error("Could not find " + path);
  process.exit(1);
}

let s = fs.readFileSync(path, "utf8");

if (!s.includes("ProtocolIcon")) {
  s = s.replace(/(import\s+.*?from\s+['"]react['"];?\n)/, `$1import ProtocolIcon from "./ProtocolIcon";\n`);
}

const iconMap = `
const labratProtocolIconFor = (label = "") => {
  const v = String(label).toLowerCase();
  if (v.includes("joint") || v.includes("glucosamine")) return "joint";
  if (v.includes("estro") || v.includes("arimidex") || v.includes("ai")) return "estrogen";
  if (v.includes("endo") || v.includes("hcg")) return "endocrine";
  return "vitamins";
};
`;
if (!s.includes("labratProtocolIconFor")) {
  s = s.replace(/(\n(?:const|function)\s+)/, "\n" + iconMap + "\n$1");
}

s = s.replace(
  /<img([^>]*?)alt=\{?([^}\n>]*?(?:category|label|title|name|suite)[^}\n>]*?)\}?([^>]*?)>/gi,
  (m, a, alt, b) => `<ProtocolIcon kind={labratProtocolIconFor(${alt})} label={String(${alt})} theme={theme} />`
);

fs.writeFileSync(path, s);
console.log("Patched " + path + " with ProtocolIcon imports/rendering where safe.");
