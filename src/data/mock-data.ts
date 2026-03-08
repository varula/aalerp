// ============================================================
// Armana Group – Denim Pant Production Mock Data
// ============================================================

// ---------- Types ----------
export interface FactoryUser {
  name: string;
  initials: string;
  color: string; // tailwind bg class
}

export interface Factory {
  id: string;
  name: string;
  location: string;
  address: string;
  user: FactoryUser;
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
  idleTime: number;
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
  fabric: string;
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

export interface FactoryLevelKPI {
  factoryId: string;
  factoryName: string;
  factoryEfficiency: number;
  overallLaborProductivity: number; // pieces per operator per hour
  costPerStandardMinute: number; // USD
  manToMachineRatio: number;
  cutToShipRatio: number; // percentage
  orderToShipRatio: number; // percentage
  onTimeDeliveryRate: number; // percentage
  rftQuality: number; // percentage
  dhuPercent: number;
  qualityPerformance: number; // percentage
  lostTimePercent: number;
  workerAbsenteeismRate: number; // percentage
  employeeTurnoverRate: number; // percentage
}

export interface DenimDefect {
  defect: string;
  count: number;
  percentage: number;
}

// ---------- Helpers ----------
const rng = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

// ---------- Denim-Specific Data ----------
const DENIM_STYLES = [
  "Slim Fit Jeans", "Skinny Stretch Jeans", "Cargo Denim Pant", "Jogger Denim",
  "Straight Leg Jeans", "Cargo Short", "Bootcut Jeans", "Relaxed Fit Jeans",
  "Tapered Fit Jeans", "Wide Leg Jeans", "Regular Fit Jeans", "Super Skinny Jeans",
  "Loose Fit Jeans", "Denim Bermuda", "Slim Cargo Jeans",
];

const DENIM_FABRICS = [
  "11.5oz Rigid Denim", "10oz Stretch Denim", "9oz Stretch Twill", "Bull Denim 12oz",
  "8oz Lightweight Denim", "13.5oz Heavy Denim", "10.5oz Crosshatch Denim",
  "9.5oz Power Stretch Denim", "11oz Selvedge Denim", "7.5oz Chambray Denim",
];

const BUYERS = ["Levi's", "Wrangler", "H&M", "Zara", "Gap", "Uniqlo", "Primark", "Target", "G-Star RAW", "Diesel"];

const DENIM_OPERATIONS = [
  "Back Pocket Attach", "Waistband Join", "Inseam Stitch", "Side Seam",
  "Zipper Fly Attach", "Belt Loop Attach", "Hem Bottom", "Bar Tack",
  "Coin Pocket Stitch", "Yoke Join", "Rivet Attach", "Label Stitch",
  "Top Stitch Seam", "Overlock Edge", "Pressing", "Final Trim",
  "Waistband Top Stitch", "Front Rise Seam", "Back Rise Seam", "Patch Attach",
];

const MACHINE_TYPES = ["SNLS", "DNLS", "Overlock", "Flatlock", "Bartack", "Buttonhole", "Iron", "Fusing", "Rivet Machine"];

const FIRST_NAMES = [
  "Rahim", "Karim", "Fatima", "Ayesha", "Jamal", "Nasreen", "Tariq", "Salma",
  "Hassan", "Ruma", "Shakil", "Mina", "Faruk", "Bilkis", "Hanif", "Reshma",
  "Kabir", "Nusrat", "Imran", "Parveen", "Rafiq", "Shirin", "Masud", "Amina",
  "Zahir", "Taslima", "Habib", "Rokeya", "Shahid", "Kulsum",
];

const LAST_NAMES = [
  "Ahmed", "Hossain", "Islam", "Rahman", "Khan", "Begum", "Akter", "Chowdhury",
  "Ali", "Uddin", "Miah", "Das", "Khatun", "Sarkar", "Mondal", "Sheikh",
];

const DOWNTIME_REASONS: DowntimeReason[] = [
  { reason: "Machine Breakdown", minutes: 245, occurrences: 18 },
  { reason: "Thread Breakage", minutes: 180, occurrences: 42 },
  { reason: "Needle Change", minutes: 120, occurrences: 35 },
  { reason: "Denim Fabric Shortage", minutes: 195, occurrences: 8 },
  { reason: "Power Outage", minutes: 90, occurrences: 3 },
  { reason: "Operator Absent", minutes: 160, occurrences: 12 },
  { reason: "Quality Rework", minutes: 140, occurrences: 22 },
  { reason: "Bundle Waiting", minutes: 110, occurrences: 28 },
  { reason: "Bobbin Change", minutes: 85, occurrences: 38 },
  { reason: "Style Changeover", minutes: 200, occurrences: 5 },
];

export const DENIM_DEFECTS: DenimDefect[] = [
  { defect: "Open Seam", count: 42, percentage: 28 },
  { defect: "Skip Stitch", count: 31, percentage: 21 },
  { defect: "Shade Variation", count: 24, percentage: 16 },
  { defect: "Inseam Deviation", count: 18, percentage: 12 },
  { defect: "Waistband Issue", count: 14, percentage: 9 },
  { defect: "Broken Stitch", count: 11, percentage: 7 },
  { defect: "Puckering", count: 10, percentage: 7 },
];

// ---------- Factory-User Mapping ----------
export const FACTORY_USERS: Record<string, FactoryUser> = {
  all: { name: "Armana Group", initials: "AG", color: "bg-primary" },
  F1: { name: "Dhanaperumal", initials: "DP", color: "bg-emerald-600" },
  F2: { name: "Abhiram", initials: "AB", color: "bg-blue-600" },
  F3: { name: "Mallikarjun", initials: "MK", color: "bg-purple-600" },
  F4: { name: "Vishwa", initials: "VS", color: "bg-amber-600" },
};

// ---------- Generate Factories ----------
function generateLines(floorId: string, factoryId: string, linePrefix: string, lineCount: number): SewingLine[] {
  return Array.from({ length: lineCount }, (_, i) => {
    const eff = rng(45, 98);
    const name = `${linePrefix}${i + 1}`;
    return {
      id: `${factoryId}-${floorId}-${name}`,
      name,
      floorId,
      factoryId,
      style: pick(DENIM_STYLES),
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
    {
      name: "Armana Apparels",
      location: "Tejgaon Industrial Area, Dhaka",
      address: "Tejgaon Industrial Area, Dhaka",
      user: FACTORY_USERS["F1"],
      lines: [
        { prefix: "L", count: 12, floor: "Production Floor" },
        { prefix: "F", count: 4, floor: "Finishing Floor" },
      ],
    },
    {
      name: "Zyta Apparels",
      location: "Mirpur, Dhaka",
      address: "House 12, Road 3, Mirpur DOHS, Dhaka",
      user: FACTORY_USERS["F2"],
      lines: [
        { prefix: "L", count: 12, floor: "Production Floor" },
        { prefix: "F", count: 4, floor: "Finishing Floor" },
      ],
    },
    {
      name: "Denimach Ltd.",
      location: "Gazipur, Bangladesh",
      address: "Konabari, Gazipur, Dhaka Division",
      user: FACTORY_USERS["F3"],
      lines: [
        { prefix: "L", count: 12, floor: "Production Floor" },
        { prefix: "F", count: 4, floor: "Finishing Floor" },
      ],
    },
    {
      name: "Denitex Ltd.",
      location: "Savar, Dhaka",
      address: "Hemayetpur, Savar, Dhaka-1340",
      user: FACTORY_USERS["F4"],
      lines: [
        { prefix: "L", count: 12, floor: "Production Floor" },
        { prefix: "F", count: 4, floor: "Finishing Floor" },
      ],
    },
  ];

  return factoryDefs.map((fd, fi) => {
    const factoryId = `F${fi + 1}`;
    const floors: Floor[] = fd.lines.map((floorDef, fli) => {
      const floorId = `${factoryId}-FL${fli + 1}`;
      return {
        id: floorId,
        name: floorDef.floor,
        factoryId,
        lines: generateLines(floorId, factoryId, floorDef.prefix, floorDef.count),
      };
    });
    return { id: factoryId, name: fd.name, location: fd.location, address: fd.address, user: fd.user, floors };
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
            do { op = pick(DENIM_OPERATIONS); } while (usedOps.has(op));
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
        const dailyTarget = Math.round((10 * 60 * line.operatorCount * (line.efficiency / 100)) / smv);
        const hourlyTarget = Math.round(dailyTarget / 10);
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
          do { op = pick(DENIM_OPERATIONS); } while (usedOps.has(op));
          usedOps.add(op);
          bulletinOps.push({ operation: op, smv: +(Math.random() * 1.5 + 0.2).toFixed(2), machineType: pick(MACHINE_TYPES) });
        }

        orders.push({
          id: `PO${String(orderNum++).padStart(4, "0")}`,
          poNumber: `PO-2026-${String(orderNum).padStart(4, "0")}`,
          buyer: pick(BUYERS),
          style: line.style,
          fabric: pick(DENIM_FABRICS),
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
      "Open seam defect spike on Line {line}",
      "Shade variation detected on Line {line}",
      "Skip stitch rate high on Line {line}",
    ],
    Machine: [
      "Machine breakdown on Line {line} – Workstation {ws}",
      "Preventive maintenance overdue on Line {line}",
      "Needle breakage spike on Line {line}",
    ],
    Material: [
      "Denim fabric shortage alert for Line {line}",
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
            timestamp: new Date(2026, 2, 8, rng(8, 18), rng(0, 59)).toISOString(),
            acknowledged: Math.random() < 0.3,
          });
        }
      }
    }
  }
  return alerts;
}

// ---------- Generate Hourly Production (8AM–7PM, 10 hrs) ----------
function generateHourlyProduction(): HourlyProduction[] {
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
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
  return DENIM_OPERATIONS.slice(0, 10).map(op => {
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

// ---------- Generate Factory-Level KPIs ----------
function generateFactoryLevelKPIs(factories: Factory[]): FactoryLevelKPI[] {
  return factories.map(f => {
    const lines = f.floors.flatMap(fl => fl.lines);
    const avgEff = lines.length ? Math.round(lines.reduce((s, l) => s + l.efficiency, 0) / lines.length) : 0;
    const dhu = +(Math.random() * 3 + 1.2).toFixed(1);
    return {
      factoryId: f.id,
      factoryName: f.name,
      factoryEfficiency: avgEff,
      overallLaborProductivity: +(Math.random() * 8 + 12).toFixed(1), // 12-20 pcs/op/hr
      costPerStandardMinute: +(Math.random() * 0.03 + 0.04).toFixed(3), // $0.04-0.07
      manToMachineRatio: +(Math.random() * 0.3 + 1.1).toFixed(2), // 1.1-1.4
      cutToShipRatio: +(Math.random() * 5 + 92).toFixed(1), // 92-97%
      orderToShipRatio: +(Math.random() * 4 + 94).toFixed(1), // 94-98%
      onTimeDeliveryRate: +(Math.random() * 8 + 88).toFixed(1), // 88-96%
      rftQuality: +(100 - dhu).toFixed(1),
      dhuPercent: dhu,
      qualityPerformance: +(Math.random() * 5 + 93).toFixed(1), // 93-98%
      lostTimePercent: +(Math.random() * 6 + 3).toFixed(1), // 3-9%
      workerAbsenteeismRate: +(Math.random() * 8 + 4).toFixed(1), // 4-12%
      employeeTurnoverRate: +(Math.random() * 5 + 2).toFixed(1), // 2-7%
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
export const factoryLevelKPIs = generateFactoryLevelKPIs(factories);

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

  // DHU calculation
  const totalDefects = DENIM_DEFECTS.reduce((s, d) => s + d.count, 0);
  const totalInspected = Math.round(totalDefects / 0.022); // ~2.2 DHU
  const dhu = +(totalDefects / totalInspected * 100).toFixed(1);
  const rft = +(100 - dhu).toFixed(1);

  return { totalOutput, totalTarget, avgEfficiency, activeLines, totalDowntime, pendingAlerts, dhu, rft };
}

// Helper to get factory info
export function getFactoryInfo(factoryId: string) {
  if (factoryId === "all") {
    return { name: "Armana Group", location: "All Locations", address: "Headquarters", user: FACTORY_USERS["all"] };
  }
  const factory = factories.find(f => f.id === factoryId);
  if (!factory) return { name: "Armana Group", location: "", address: "", user: FACTORY_USERS["all"] };
  return { name: factory.name, location: factory.location, address: factory.address, user: factory.user };
}
