/*
  Mile Field flow schema (subset), as documented in the MileApp knowledge base
  `Knowledge-base/flow/flow-base-structure.md`. Only component kinds whose on-device UI was observed on
  field.mile.app (see .planning/research/mile-field/UI-SPEC-OBSERVED.md) are used by the POC.
*/

export type InputType = "String" | "Address" | "PhoneNumber" | "Numeric" | "Date" | "Geolocation";
export type ViewType = "String" | "Address" | "PhoneNumber" | "Numeric" | "Geolocation" | "Bill";

interface Base { id: string; title: string; visible: boolean; required?: boolean }

export interface InputC extends Base { component: "input"; type: InputType; showAs?: "title" | "content" | "label" | null; routeAs?: string | null; min?: number; max?: number; useGeoLock?: boolean; radius?: number | null; geoLockTrigger?: "onTaskStart" | "onTaskDone" | null }
export interface OnSelectRule { options: string[]; action: "show" | "hide"; componentAffected: string[] }
export interface SelectC extends Base { component: "select"; type: "dropdown"; options: string[]; min: number; max: number; showAs?: "title" | "content" | "label" | null; routeAs?: string | null; onSelect?: OnSelectRule[] }
export interface PhotoC extends Base { component: "photo"; min: number; max: number; watermark?: boolean; selectGallery?: boolean }
export interface SignatureC extends Base { component: "signature" }
export interface ViewC extends Base { component: "view"; type: ViewType; value: string }
export interface BillItemMaster { name: string; unit_price: number }
export interface BillCostMaster { type: "cost" | "discount"; name: string; amount: number }
export interface BillC extends Base { component: "bill"; addNew: boolean; value: string | null; masterItems: BillItemMaster[]; masterCosts: BillCostMaster[]; costs?: string[]; editable?: string[] }

export type Component = InputC | SelectC | PhotoC | SignatureC | ViewC | BillC;
export interface Page { id: string; title: string; enabled?: boolean; components: Component[] }
export interface Flow { name: string; pages: Page[]; /** demo note shown nowhere in the app; documents which PRD the flow covers */ prd: string }

/* ---------- task values ---------- */
export interface BillLine { name: string; unitPrice: number; qty: number }
export interface BillCost { type: "cost" | "discount"; name: string; amount: number }
export interface BillValue { items: BillLine[]; costs: BillCost[] }
export interface PhotoValue { id: string; at: string; hue: number }
export type Value = string | string[] | number | PhotoValue[] | BillValue | BillItemMaster[] | boolean | null | undefined;
export type Values = Record<string, Value>;

export const billTotals = (b?: BillValue) => {
  const items = b?.items ?? [];
  const costs = b?.costs ?? [];
  const sub = items.reduce((a, i) => a + i.qty * i.unitPrice, 0);
  const subCost = costs.reduce((a, c) => a + (c.type === "cost" ? c.amount : -c.amount), 0);
  return { count: items.length, qty: items.reduce((a, i) => a + i.qty, 0), sub, subCost, total: sub + subCost };
};

/** Mile Field shows amounts with comma thousands separators ("10,000"). */
export const num = (n: number) => Math.round(n).toLocaleString("en-US");
