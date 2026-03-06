// ============================================================
// GarmentIQ – Comprehensive Mock Data
// ============================================================

// ---------- Types ----------
export interface Factory {
  id: string;
  name: string;
  location: string;
  floors: Floor[];
}

export interface Floor {
  id: string;
  name: string;
  factoryId: string;
  lines: SewingLine[];
}

export interface SewingLine {
  id: string;
  name: string;
  floorId: string;
  factoryId: string;
  style: string;
  operatorCount: number;
  workstations: number;
  target: number;
  actual: number;
  efficiency: number;
  status: "normal" | "warning" | "critical";
  smv: number;
}

export interface Operator {
  id: string;
  name: string;
  lineId: string;
  factoryId: string;
  skillLevel: "Expert" | "Intermediate" | "Beginner";
  operations: OperatorSkill[];
  attendance: number;
  avgEfficiency: number;
  piecesProduced: number;
  idleTime: number; // minutes
}

export interface OperatorSkill {
  operation: string;
  efficiency: number;
  skillLevel: "Expert" | "Intermediate" | "Beginner";
}

export interface ProductionOrder {
  id: string;
  poNumber: string;
  buyer: string;
  style: string;
  orderQty: number;
  completedQty: number;
  smv: number;
  plannedStart: string;
  plannedFinish: string;
  status: "In Progress" | "Pending" | "Completed" | "Delayed";
  lineId: string;
  factoryId: string;
  dailyTarget: number;
  hourlyTarget: number;
  predictedCompletion: string;
  operations: OperationBulletin[];
}

export interface OperationBulletin {
  operation: string;
  smv: number;
  machineType: string;
}

export interface Alert {
  id: string;
  type: "Production" | "Quality" | "Machine" | "Material";
  severity: "normal" | "warning" | "critical";
  message: string;
  lineId: string;
  factoryId: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface HourlyProduction {
  hour: string;
  actual: number;
  predicted: number;
  target: number;
}

export interface DowntimeReason {
  reason: string;
  minutes: number;
  occurrences: number;
}

export interface WipEntry {
  operation: string;
  wipBundles: number;
  avgCycleTime: number;
  taktTime: number;
  isBottleneck: boolean;
}

// ---------- Helpers ----------
const rng = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

const STYLES = [
  "Slim Fit Denim Jeans", "Polo Shirt Classic", "Bomber Jacket", "Cargo Pants",
  "Oxford Button Down", "Chino Shorts", "Hoodie Pullover", "Track Pants",
  "Denim Jacket", "Henley T-Shirt", "Work Shirt", "Jogger Pants",
  "Flannel Shirt", "Windbreaker", "Board Shorts"
];

const BUYERS = ["H&M", "Zara", "Primark", "Gap", "Uniqlo", "Next", "C&A", "Target", "Walmart", "Mango"];

const OPERATIONS = [
  "Attach Pocket", "Waistband Join", "Hem Bottom", "Side Seam", "Inseam",
  "Attach Zipper", "Collar Attach", "Sleeve Attach", "Cuff Hem", "Button Hole",
  "Back Yoke", "Front Placket", "Belt Loop", "Label Attach", "Bar Tack",
  "Top Stitch", "Overlock Edge", "Fusing", "Pressing", "Final Trim"
];

const MACHINE_TYPES = ["SNLS", "DNLS", "Overlock", "Flatlock", "Bartack", "Buttonhole", "Iron", "Fusing"];

const FIRST_NAMES = [
  "Rahim", "Karim", "Fatima", "Ayesha", "Jamal", "Nasreen", "Tariq", "Salma",
  "Hassan", "Ruma", "Shakil", "Mina", "Faruk", "Bilkis", "Hanif", "Reshma",
  "Kabir", "Nusrat", "Imran", "Parveen", "Rafiq", "Shirin", "Masud", "Amina",
  "Zahir", "Taslima", "Habib", "Rokeya", "Shahid", "Kulsum"
];

const LAST_NAMES = [
  "Ahmed", "Hossain", "Islam", "Rahman", "Khan", "Begum", "Akter", "Chowdhury",
  "Ali", "Uddin", "Miah", "Das", "Khatun", "Sarkar", "Mondal", "Sheikh"
];

const DOWNTIME_REASONS: DowntimeReason[] = [
  { reason: "Machine Breakdown", minutes: 245, occurrences: 18 },
  { reason: "Thread Breakage", minutes: 180, occurrences: 42 },
  { reason: "Needle Change", minutes: 120, occurrences: 35 },
  { reason: "Fabric Shortage", minutes: 195, occurrences: 8 },
  { reason: "Power Outage", minutes: 90, occurrences: 3 },
  { reason: "Operator Absent", minutes: 160, occurrences: 12 },
  { reason: "Quality Rework", minutes: 140, occurrences: 22 },
  { reason: "Bundle Waiting", minutes: 110, occurrences: 28 },
  { reason: "Bobbin Change", minutes: 85, occurrences: 38 },
  { reason: "Style Changeover", minutes: 200, occurrences: 5 },
];

// ---------- Generate Factories ----------
function generateLines(floorId: string, factoryId: string, floorIndex: number, lineCount: number): SewingLine[] {
  return Array.from({ length: lineCount }, (_, i) => {
    const eff = rng(45, 98);
    return {
      id: `${factoryId}-${floorId}-L${String(i + 1).padStart(2, "0")}`,
      name: `L${floorIndex * 100 + i + 1}`,
      floorId,
      factoryId,
      style: pick(STYLES),
      operatorCount: rng(22, 35),
      workstations: rng(20, 30),
      target: rng(400, 800),
      actual: 0,
      efficiency: eff,
      status: (eff >= 70 ? "normal" : eff >= 55 ? "warning" : "critical") as "normal" | "warning" | "critical",
      smv: +(Math.random() * 8 + 4).toFixed(2),
    };
  }).map(l => ({ ...l, actual: Math.round(l.target * l.efficiency / 100) }));
}

function generateFactories(): Factory[] {
  const factoryDefs = [
    { name: "Dhaka Denim Plant", location: "Gazipur, Dhaka", floors: 2, linesPerFloor: 16 },
    { name: "Chittagong Knit Works", location: "Chittagong EPZ", floors: 2, linesPerFloor: 14 },
    { name: "Narayanganj Apparel Hub", location: "Narayanganj", floors: 2, linesPerFloor: 12 },
  ];

  return factoryDefs.map((fd, fi) => {
    const factoryId = `F${fi + 1}`;
    const floors: Floor[] = Array.from({ length: fd.floors }, (_, fli) => {
      const floorId = `${factoryId}-FL${fli + 1}`;
      return {
        id: floorId,
        name: `Floor ${fli + 1}`,
        factoryId,
        lines: generateLines(floorId, factoryId, fli + 1, fd.linesPerFloor),
      };
    });
    return { id: factoryId, name: fd.name, location: fd.location, floors };
  });
}

// ---------- Generate Operators ----------
function generateOperators(factories: Factory[]): Operator[] {
  const operators: Operator[] = [];
  let opCounter = 1;

  for (const factory of factories) {
    for (const floor of factory.floors) {
      for (const line of floor.lines) {
        const count = line.operatorCount;
        for (let i = 0; i < count; i++) {
          const skillLevel = pick(["Expert", "Intermediate", "Beginner"] as const);
          const numOps = skillLevel === "Expert" ? rng(4, 7) : skillLevel === "Intermediate" ? rng(2, 4) : rng(1, 2);
          const ops: OperatorSkill[] = [];
          const usedOps = new Set<string>();
          for (let j = 0; j < numOps; j++) {
            let op: string;
            do { op = pick(OPERATIONS); } while (usedOps.has(op));
            usedOps.add(op);
            const eff = skillLevel === "Expert" ? rng(85, 100) : skillLevel === "Intermediate" ? rng(60, 85) : rng(40, 65);
            ops.push({ operation: op, efficiency: eff, skillLevel });
          }
          const avgEff = Math.round(ops.reduce((s, o) => s + o.efficiency, 0) / ops.length);
          operators.push({
            id: `OP${String(opCounter++).padStart(4, "0")}`,
            name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
            lineId: line.id,
            factoryId: factory.id,
            skillLevel,
            operations: ops,
            attendance: rng(85, 100),
            avgEfficiency: avgEff,
            piecesProduced: rng(200, 600),
            idleTime: rng(5, 60),
          });
        }
      }
    }
  }
  return operators;
}

// ---------- Generate Production Orders ----------
function generateOrders(factories: Factory[]): ProductionOrder[] {
  const orders: ProductionOrder[] = [];
  let orderNum = 1;

  for (const factory of factories) {
    for (const floor of factory.floors) {
      for (const line of floor.lines) {
        const qty = rng(5000, 50000);
        const smv = line.smv;
        const dailyTarget = Math.round((8 * 60 * line.operatorCount * (line.efficiency / 100)) / smv);
        const hourlyTarget = Math.round(dailyTarget / 8);
        const daysNeeded = Math.ceil(qty / dailyTarget);
        const start = new Date(2026, 2, rng(1, 10));
        const plannedFinish = new Date(start);
        plannedFinish.setDate(plannedFinish.getDate() + daysNeeded);
        const predictedFinish = new Date(plannedFinish);
        predictedFinish.setDate(predictedFinish.getDate() + rng(-3, 7));

        const completedPct = Math.random() * 0.8;
        const status = completedPct > 0.95 ? "Completed" : predictedFinish > plannedFinish ? "Delayed" : completedPct > 0 ? "In Progress" : "Pending";

        const numOps = rng(6, 12);
        const bulletinOps: OperationBulletin[] = [];
        const usedOps = new Set<string>();
        for (let i = 0; i < numOps; i++) {
          let op: string;
          do { op = pick(OPERATIONS); } while (usedOps.has(op));
          usedOps.add(op);
          bulletinOps.push({ operation: op, smv: +(Math.random() * 1.5 + 0.2).toFixed(2), machineType: pick(MACHINE_TYPES) });
        }

        orders.push({
          id: `PO${String(orderNum++).padStart(4, "0")}`,
          poNumber: `PO-2026-${String(orderNum).padStart(4, "0")}`,
          buyer: pick(BUYERS),
          style: line.style,
          orderQty: qty,
          completedQty: Math.round(qty * completedPct),
          smv,
          plannedStart: start.toISOString().split("T")[0],
          plannedFinish: plannedFinish.toISOString().split("T")[0],
          status,
          lineId: line.id,
          factoryId: factory.id,
          dailyTarget,
          hourlyTarget,
          predictedCompletion: predictedFinish.toISOString().split("T")[0],
          operations: bulletinOps,
        });
      }
    }
  }
  return orders;
}

// ---------- Generate Alerts ----------
function generateAlerts(factories: Factory[]): Alert[] {
  const alerts: Alert[] = [];
  const types: Alert["type"][] = ["Production", "Quality", "Machine", "Material"];
  const messages: Record<Alert["type"], string[]> = {
    Production: [
      "Line {line} efficiency dropped below 60%",
      "Line {line} will miss today's target by {n} pcs",
      "Line {line} output stalled for 20 minutes",
    ],
    Quality: [
      "DHU exceeded 8% on Line {line}",
      "Consecutive defects detected on Line {line}",
      "Quality audit failure on Line {line}",
    ],
    Machine: [
      "Machine breakdown on Line {line} – Workstation {ws}",
      "Preventive maintenance overdue on Line {line}",
      "Needle breakage spike on Line {line}",
    ],
    Material: [
      "Fabric shortage alert for Line {line}",
      "Bundle supply delay on Line {line}",
      "Thread stock running low for Line {line}",
    ],
  };

  let alertId = 1;
  for (const factory of factories) {
    for (const floor of factory.floors) {
      for (const line of floor.lines) {
        if (Math.random() < 0.4) {
          const type = pick(types);
          const severity = line.status === "critical" ? "critical" : line.status === "warning" ? "warning" : "normal";
          const msgTemplate = pick(messages[type]);
          const msg = msgTemplate
            .replace("{line}", line.name)
            .replace("{n}", String(rng(100, 500)))
            .replace("{ws}", String(rng(1, 25)));

          alerts.push({
            id: `ALT${String(alertId++).padStart(4, "0")}`,
            type,
            severity,
            message: msg,
            lineId: line.id,
            factoryId: factory.id,
            timestamp: new Date(2026, 2, 6, rng(6, 17), rng(0, 59)).toISOString(),
            acknowledged: Math.random() < 0.3,
          });
        }
      }
    }
  }
  return alerts;
}

// ---------- Generate Hourly Production ----------
function generateHourlyProduction(): HourlyProduction[] {
  const hours = ["07:00", "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];
  let cumActual = 0;
  let cumPredicted = 0;
  let cumTarget = 0;
  const hourlyTarget = rng(50, 80);

  return hours.map(hour => {
    const target = hourlyTarget;
    const predicted = Math.round(target * (rng(85, 105) / 100));
    const actual = Math.round(target * (rng(70, 110) / 100));
    cumActual += actual;
    cumPredicted += predicted;
    cumTarget += target;
    return { hour, actual: cumActual, predicted: cumPredicted, target: cumTarget };
  });
}

// ---------- Generate WIP ----------
function generateWip(): WipEntry[] {
  return OPERATIONS.slice(0, 10).map(op => {
    const wip = rng(2, 25);
    const avg = 8;
    return {
      operation: op,
      wipBundles: wip,
      avgCycleTime: +(Math.random() * 2 + 0.3).toFixed(2),
      taktTime: +(Math.random() * 1.5 + 0.5).toFixed(2),
      isBottleneck: wip > avg * 2,
    };
  });
}

// ---------- Export All ----------
export const factories = generateFactories();
export const allLines = factories.flatMap(f => f.floors.flatMap(fl => fl.lines));
export const operators = generateOperators(factories);
export const productionOrders = generateOrders(factories);
export const alerts = generateAlerts(factories);
export const hourlyProduction = generateHourlyProduction();
export const downtimeReasons = DOWNTIME_REASONS;
export const wipData = generateWip();

// ---------- Aggregate KPIs ----------
export function getFactoryKPIs(factoryId?: string) {
  const lines = factoryId ? allLines.filter(l => l.factoryId === factoryId) : allLines;
  const factoryAlerts = factoryId ? alerts.filter(a => a.factoryId === factoryId) : alerts;

  const totalOutput = lines.reduce((s, l) => s + l.actual, 0);
  const totalTarget = lines.reduce((s, l) => s + l.target, 0);
  const avgEfficiency = lines.length ? Math.round(lines.reduce((s, l) => s + l.efficiency, 0) / lines.length) : 0;
  const activeLines = lines.length;
  const totalDowntime = downtimeReasons.reduce((s, d) => s + d.minutes, 0);
  const pendingAlerts = factoryAlerts.filter(a => !a.acknowledged).length;

  return { totalOutput, totalTarget, avgEfficiency, activeLines, totalDowntime, pendingAlerts };
}
