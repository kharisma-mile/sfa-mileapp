import { num, type Component, type Flow, type Page, type Values } from "./types";

/** Visibility after applying every select's onSelect rules (KB: rules can affect components on any page). */
export function visibility(flow: Flow, values: Values): Record<string, boolean> {
  const vis: Record<string, boolean> = {};
  const all = flow.pages.flatMap((p) => p.components);
  for (const c of all) vis[c.id] = c.visible;
  for (const c of all) {
    if (c.component !== "select" || !c.onSelect?.length) continue;
    const picked = (values[c.id] as string[] | undefined) ?? [];
    for (const r of c.onSelect) if (r.options.some((o) => picked.includes(o))) for (const id of r.componentAffected) vis[id] = r.action === "show";
  }
  return vis;
}

/** Pages after the initial page that still have at least one visible component. */
export function workPages(flow: Flow, values: Values): Page[] {
  const vis = visibility(flow, values);
  return flow.pages.slice(1).filter((p) => p.components.some((c) => vis[c.id]));
}

/** Resolve a view `value` ("$componentId" or static text) to display text. */
export function resolveText(c: Extract<Component, { component: "view" }>, values: Values): string {
  const raw = c.value.startsWith("$") ? values[c.value.slice(1)] : c.value;
  if (raw === null || raw === undefined || raw === "") return "";
  if (Array.isArray(raw)) return (raw as unknown[]).join(", ");
  if (typeof raw === "number") return num(raw);
  if (c.type === "Numeric" && /^\d+$/.test(String(raw))) return num(Number(raw));
  return String(raw);
}

/** Task-list card text from showAs title / content / label. */
export function cardText(flow: Flow, values: Values) {
  const comps = flow.pages.flatMap((p) => p.components);
  const pick = (k: string) => {
    const c = comps.find((x) => (x.component === "input" || x.component === "select") && x.showAs === k);
    const v = c ? values[c.id] : undefined;
    return Array.isArray(v) ? (v as string[]).join(", ") : v === undefined || v === null ? "" : String(v);
  };
  return { title: pick("title"), content: pick("content"), label: pick("label") };
}
