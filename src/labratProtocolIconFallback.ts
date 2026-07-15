// LABRAT protocol graphics fallback
// Safe patch: does not alter cycle/protectant data, filtering, or add-preset logic.
// It only replaces failed/missing protocol preset images with local LABRAT SVGs.

const ICONS: Record<string, string> = {
  vitamins: "/protocol-icons/vitamins-clinical.svg",
  joint: "/protocol-icons/joint-clinical.svg",
  estrogen: "/protocol-icons/estrogen-clinical.svg",
  endocrine: "/protocol-icons/endocrine-clinical.svg",
};

function protocolKind(text: string): keyof typeof ICONS | null {
  const t = text.toLowerCase();
  if (t.includes("joint") || t.includes("glucosamine")) return "joint";
  if (t.includes("estro") || t.includes("arimidex") || t.includes(" ai shield")) return "estrogen";
  if (t.includes("endo") || t.includes("hcg")) return "endocrine";
  if (t.includes("vitamin") || t.includes("coq") || t.includes("omega")) return "vitamins";
  return null;
}

function replaceIfProtocolImage(img: HTMLImageElement): void {
  if (!img || img.dataset.labratProtocolFixed === "1") return;
  const card = img.closest("article,section,div,li") as HTMLElement | null;
  const haystack = `${img.alt || ""} ${img.title || ""} ${img.src || ""} ${card?.innerText || ""}`;
  const kind = protocolKind(haystack);
  if (!kind) return;

  img.dataset.labratProtocolFixed = "1";
  img.src = ICONS[kind];
  img.alt = img.alt || kind;
  img.loading = "lazy";
  img.decoding = "async";
  img.classList.add("labrat-protocol-graphic");
}

function scanProtocolImages(): void {
  const imgs = Array.from(document.querySelectorAll<HTMLImageElement>("img"));
  for (const img of imgs) {
    const broken = img.complete && img.naturalWidth === 0;
    const suspicious = /protocol|vitamin|coq|omega|joint|glucosamine|estro|arimidex|endo|hcg/i.test(`${img.alt} ${img.src}`);
    if (broken || suspicious) replaceIfProtocolImage(img);
  }
}

function installStyles(): void {
  if (document.getElementById("labrat-protocol-graphic-styles")) return;
  const style = document.createElement("style");
  style.id = "labrat-protocol-graphic-styles";
  style.textContent = `
    .labrat-protocol-graphic {
      width: 54px !important;
      height: 54px !important;
      object-fit: contain !important;
      border-radius: 14px !important;
      flex: 0 0 auto !important;
      display: block !important;
    }
  `;
  document.head.appendChild(style);
}

function boot(): void {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  installStyles();
  scanProtocolImages();
  window.addEventListener("error", (event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement) replaceIfProtocolImage(target);
  }, true);
  new MutationObserver(scanProtocolImages).observe(document.body, { childList: true, subtree: true });
  window.setTimeout(scanProtocolImages, 350);
  window.setTimeout(scanProtocolImages, 1500);
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot, { once: true });
  else boot();
}

export {};
