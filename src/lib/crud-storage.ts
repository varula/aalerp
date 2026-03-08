// Generic localStorage CRUD helpers

export interface CrudRecord {
  id: string;
  createdAt: string;
  updatedAt: string;
  [key: string]: any;
}

function getStorageKey(moduleSlug: string): string {
  return `crud_${moduleSlug}`;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function getAll(moduleSlug: string): CrudRecord[] {
  try {
    const data = localStorage.getItem(getStorageKey(moduleSlug));
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function getById(moduleSlug: string, id: string): CrudRecord | undefined {
  return getAll(moduleSlug).find(r => r.id === id);
}

export function create(moduleSlug: string, data: Record<string, any>): CrudRecord {
  const records = getAll(moduleSlug);
  const now = new Date().toISOString();
  const record: CrudRecord = { ...data, id: generateId(), createdAt: now, updatedAt: now };
  records.unshift(record);
  localStorage.setItem(getStorageKey(moduleSlug), JSON.stringify(records));
  return record;
}

export function update(moduleSlug: string, id: string, data: Record<string, any>): CrudRecord | null {
  const records = getAll(moduleSlug);
  const idx = records.findIndex(r => r.id === id);
  if (idx === -1) return null;
  records[idx] = { ...records[idx], ...data, updatedAt: new Date().toISOString() };
  localStorage.setItem(getStorageKey(moduleSlug), JSON.stringify(records));
  return records[idx];
}

export function remove(moduleSlug: string, id: string): boolean {
  const records = getAll(moduleSlug);
  const filtered = records.filter(r => r.id !== id);
  if (filtered.length === records.length) return false;
  localStorage.setItem(getStorageKey(moduleSlug), JSON.stringify(filtered));
  return true;
}

export function exportToCsv(moduleSlug: string, fields: { key: string; label: string }[]): void {
  const records = getAll(moduleSlug);
  const header = fields.map(f => f.label).join(",");
  const rows = records.map(r => fields.map(f => `"${String(r[f.key] ?? '').replace(/"/g, '""')}"`).join(","));
  const csv = [header, ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${moduleSlug}-export.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
