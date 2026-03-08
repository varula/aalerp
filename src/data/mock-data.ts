// ============================================================
// Armana Group – Complete Factory Mock Data
// ============================================================

// ---------- Types ----------
export interface FactoryUser {
  name: string;
  initials: string;
  color: string;
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
  joinDate: string;
  certifications: string[];
  phone: string;
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
  color: string;
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
  unitPrice: number;
  totalValue: number;
  priority: "High" | "Medium" | "Low";
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
  overallLaborProductivity: number;
  costPerStandardMinute: number;
  manToMachineRatio: number;
  cutToShipRatio: number;
  orderToShipRatio: number;
  onTimeDeliveryRate: number;
  rftQuality: number;
  dhuPercent: number;
  qualityPerformance: number;
  lostTimePercent: number;
  workerAbsenteeismRate: number;
  employeeTurnoverRate: number;
}

export interface DenimDefect {
  defect: string;
  count: number;
  percentage: number;
}

// ---------- New Module Types ----------
export interface Machine {
  id: string;
  name: string;
  type: string;
  brand: string;
  model: string;
  lineId: string;
  factoryId: string;
  status: "Running" | "Idle" | "Maintenance" | "Breakdown";
  lastMaintenance: string;
  nextMaintenance: string;
  hoursRun: number;
  needleCount: number;
  rpm: number;
  temperature: number;
  vibration: number;
  oilLevel: number;
}

export interface QualityInspection {
  id: string;
  lineId: string;
  factoryId: string;
  inspector: string;
  date: string;
  inspectedQty: number;
  defectQty: number;
  defects: { type: string; count: number }[];
  dhu: number;
  aqlResult: "Pass" | "Fail" | "Conditional";
  aqlLevel: string;
  status: "Completed" | "In Progress";
}

export interface DowntimeLog {
  id: string;
  lineId: string;
  factoryId: string;
  reason: string;
  category: "Machine" | "Material" | "Method" | "Manpower" | "Management";
  startTime: string;
  endTime: string;
  duration: number;
  machineId?: string;
  resolved: boolean;
  actionTaken: string;
}

export interface CVCamera {
  id: string;
  name: string;
  lineId: string;
  factoryId: string;
  status: "Online" | "Offline" | "Calibrating";
  piecesCount: number;
  defectsDetected: number;
  accuracy: number;
  lastCalibrated: string;
  fps: number;
}

export interface AIPrediction {
  id: string;
  factoryId: string;
  type: "Efficiency" | "Quality" | "Delivery" | "Downtime" | "Defect";
  prediction: string;
  confidence: number;
  impact: "High" | "Medium" | "Low";
  timestamp: string;
  details: string;
  recommendation: string;
}

export interface MaterialInventory {
  id: string;
  name: string;
  type: "Fabric" | "Thread" | "Zipper" | "Button" | "Rivet" | "Label" | "Packaging";
  factoryId: string;
  currentStock: number;
  minStock: number;
  unit: string;
  supplier: string;
  lastReceived: string;
  status: "Sufficient" | "Low" | "Critical" | "Out of Stock";
}

// ---------- Helpers ----------
const rng = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const pickN = <T>(arr: T[], n: number): T[] => {
  const shuffled = [...arr].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, n);
};

// ---------- Denim-Specific Constants ----------
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

const DENIM_COLORS = [
  "Indigo Blue", "Dark Wash", "Medium Wash", "Light Wash", "Black", "Raw Denim",
  "Stone Wash", "Acid Wash", "Grey", "Navy", "Vintage Blue", "Faded Black",
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
const MACHINE_BRANDS = ["Juki", "Brother", "Jack", "Pegasus", "Kansai", "Siruba", "Typical", "Durkopp Adler"];

const FIRST_NAMES = [
  "Rahim", "Karim", "Fatima", "Ayesha", "Jamal", "Nasreen", "Tariq", "Salma",
  "Hassan", "Ruma", "Shakil", "Mina", "Faruk", "Bilkis", "Hanif", "Reshma",
  "Kabir", "Nusrat", "Imran", "Parveen", "Rafiq", "Shirin", "Masud", "Amina",
  "Zahir", "Taslima", "Habib", "Rokeya", "Shahid", "Kulsum", "Sumon", "Laboni",
  "Raju", "Shapla", "Monir", "Nazma", "Alamgir", "Razia", "Belal", "Sultana",
  "Milon", "Nargis", "Tanvir", "Rehana", "Babu", "Champa", "Jewel", "Parvin",
  "Dulal", "Jasmine", "Liton", "Aklima", "Robin", "Lovely", "Sohel", "Halima",
];

const LAST_NAMES = [
  "Ahmed", "Hossain", "Islam", "Rahman", "Khan", "Begum", "Akter", "Chowdhury",
  "Ali", "Uddin", "Miah", "Das", "Khatun", "Sarkar", "Mondal", "Sheikh",
  "Siddiqui", "Bhuiyan", "Talukder", "Biswas",
];

const CERTIFICATIONS = [
  "SNLS Certified", "DNLS Certified", "Overlock Expert", "Quality Inspector Level 1",
  "Quality Inspector Level 2", "Line Supervisor Trained", "Safety Officer",
  "First Aid Certified", "Fire Safety Trained", "5S Certified",
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

const DEFECT_TYPES = ["Open Seam", "Skip Stitch", "Shade Variation", "Inseam Deviation", "Waistband Issue", "Broken Stitch", "Puckering", "Oil Stain", "Fabric Damage", "Wrong Stitch"];

const INSPECTORS = ["Abdul Karim", "Fatima Khatun", "Rahim Uddin", "Nasreen Akter", "Shakil Ahmed", "Ruma Islam"];

const MATERIAL_SUPPLIERS = ["Hamid Denim Mills", "Partex Denim Ltd.", "Pacific Jeans Fabrics", "Azim Denim", "Bangladesh Zipper", "Coats Bangladesh"];

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
      name, floorId, factoryId,
      style: pick(DENIM_STYLES),
      operatorCount: rng(22, 35),
      workstations: rng(20, 30),
      target: rng(400, 800),
      actual: 0,
      efficiency: eff,
      status: (eff >= 70 ? "normal" : eff >= 55 ? "warning" : "critical") as SewingLine["status"],
      smv: +(Math.random() * 8 + 4).toFixed(2),
    };
  }).map(l => ({ ...l, actual: Math.round(l.target * l.efficiency / 100) }));
}

function generateFactories(): Factory[] {
  const factoryDefs = [
    { name: "Armana Apparels", location: "Tejgaon Industrial Area, Dhaka", address: "Tejgaon Industrial Area, Dhaka", user: FACTORY_USERS["F1"], lines: [{ prefix: "L", count: 12, floor: "Production Floor" }, { prefix: "F", count: 4, floor: "Finishing Floor" }] },
    { name: "Zyta Apparels", location: "Mirpur, Dhaka", address: "House 12, Road 3, Mirpur DOHS, Dhaka", user: FACTORY_USERS["F2"], lines: [{ prefix: "L", count: 12, floor: "Production Floor" }, { prefix: "F", count: 4, floor: "Finishing Floor" }] },
    { name: "Denimach Ltd.", location: "Gazipur, Bangladesh", address: "Konabari, Gazipur, Dhaka Division", user: FACTORY_USERS["F3"], lines: [{ prefix: "L", count: 12, floor: "Production Floor" }, { prefix: "F", count: 4, floor: "Finishing Floor" }] },
    { name: "Denitex Ltd.", location: "Savar, Dhaka", address: "Hemayetpur, Savar, Dhaka-1340", user: FACTORY_USERS["F4"], lines: [{ prefix: "L", count: 12, floor: "Production Floor" }, { prefix: "F", count: 4, floor: "Finishing Floor" }] },
  ];
  return factoryDefs.map((fd, fi) => {
    const factoryId = `F${fi + 1}`;
    const floors: Floor[] = fd.lines.map((floorDef, fli) => {
      const floorId = `${factoryId}-FL${fli + 1}`;
      return { id: floorId, name: floorDef.floor, factoryId, lines: generateLines(floorId, factoryId, floorDef.prefix, floorDef.count) };
    });
    return { id: factoryId, name: fd.name, location: fd.location, address: fd.address, user: fd.user, floors };
  });
}

// ---------- Generate Operators (enriched) ----------
function generateOperators(factories: Factory[]): Operator[] {
  const operators: Operator[] = [];
  let opCounter = 1;
  for (const factory of factories) {
    for (const floor of factory.floors) {
      for (const line of floor.lines) {
        const count = Math.min(line.operatorCount, 4); // limit per line for performance
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
          const yearOffset = rng(0, 5);
          operators.push({
            id: `OP${String(opCounter++).padStart(4, "0")}`,
            name: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
            lineId: line.id, factoryId: factory.id, skillLevel,
            operations: ops,
            attendance: rng(85, 100),
            avgEfficiency: avgEff,
            piecesProduced: rng(200, 600),
            idleTime: rng(5, 60),
            joinDate: `${2026 - yearOffset}-${String(rng(1, 12)).padStart(2, "0")}-${String(rng(1, 28)).padStart(2, "0")}`,
            certifications: pickN(CERTIFICATIONS, rng(1, 3)),
            phone: `+880 1${rng(3, 9)}${String(rng(10000000, 99999999))}`,
          });
        }
      }
    }
  }
  return operators;
}

// ---------- Generate Production Orders (enriched) ----------
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
        const status: ProductionOrder["status"] = completedPct > 0.95 ? "Completed" : predictedFinish > plannedFinish ? "Delayed" : completedPct > 0 ? "In Progress" : "Pending";
        const numOps = rng(6, 12);
        const bulletinOps: OperationBulletin[] = [];
        const usedOps = new Set<string>();
        for (let i = 0; i < numOps; i++) {
          let op: string;
          do { op = pick(DENIM_OPERATIONS); } while (usedOps.has(op));
          usedOps.add(op);
          bulletinOps.push({ operation: op, smv: +(Math.random() * 1.5 + 0.2).toFixed(2), machineType: pick(MACHINE_TYPES) });
        }
        const unitPrice = +(Math.random() * 8 + 4).toFixed(2);
        orders.push({
          id: `PO${String(orderNum++).padStart(4, "0")}`,
          poNumber: `PO-2026-${String(orderNum).padStart(4, "0")}`,
          buyer: pick(BUYERS), style: line.style, fabric: pick(DENIM_FABRICS), color: pick(DENIM_COLORS),
          orderQty: qty, completedQty: Math.round(qty * completedPct), smv,
          plannedStart: start.toISOString().split("T")[0],
          plannedFinish: plannedFinish.toISOString().split("T")[0],
          status, lineId: line.id, factoryId: factory.id,
          dailyTarget, hourlyTarget,
          predictedCompletion: predictedFinish.toISOString().split("T")[0],
          operations: bulletinOps,
          unitPrice, totalValue: Math.round(qty * unitPrice),
          priority: pick(["High", "Medium", "Low"]),
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
    Production: ["Line {line} efficiency dropped below 60%", "Line {line} will miss today's target by {n} pcs", "Line {line} output stalled for 20 minutes"],
    Quality: ["DHU exceeded 8% on Line {line}", "Open seam defect spike on Line {line}", "Shade variation detected on Line {line}", "Skip stitch rate high on Line {line}"],
    Machine: ["Machine breakdown on Line {line} – Workstation {ws}", "Preventive maintenance overdue on Line {line}", "Needle breakage spike on Line {line}"],
    Material: ["Denim fabric shortage alert for Line {line}", "Bundle supply delay on Line {line}", "Thread stock running low for Line {line}"],
  };
  let alertId = 1;
  for (const factory of factories) {
    for (const floor of factory.floors) {
      for (const line of floor.lines) {
        if (Math.random() < 0.4) {
          const type = pick(types);
          const severity: Alert["severity"] = line.status === "critical" ? "critical" : line.status === "warning" ? "warning" : "normal";
          const msg = pick(messages[type]).replace("{line}", line.name).replace("{n}", String(rng(100, 500))).replace("{ws}", String(rng(1, 25)));
          alerts.push({ id: `ALT${String(alertId++).padStart(4, "0")}`, type, severity, message: msg, lineId: line.id, factoryId: factory.id, timestamp: new Date(2026, 2, 8, rng(8, 18), rng(0, 59)).toISOString(), acknowledged: Math.random() < 0.3 });
        }
      }
    }
  }
  return alerts;
}

// ---------- Generate Hourly Production (8AM–7PM) ----------
function generateHourlyProduction(): HourlyProduction[] {
  const hours = ["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
  let cumActual = 0, cumPredicted = 0, cumTarget = 0;
  const hourlyTarget = rng(50, 80);
  return hours.map(hour => {
    cumTarget += hourlyTarget;
    cumPredicted += Math.round(hourlyTarget * (rng(85, 105) / 100));
    cumActual += Math.round(hourlyTarget * (rng(70, 110) / 100));
    return { hour, actual: cumActual, predicted: cumPredicted, target: cumTarget };
  });
}

// ---------- Generate WIP ----------
function generateWip(): WipEntry[] {
  return DENIM_OPERATIONS.slice(0, 10).map(op => {
    const wip = rng(2, 25);
    return { operation: op, wipBundles: wip, avgCycleTime: +(Math.random() * 2 + 0.3).toFixed(2), taktTime: +(Math.random() * 1.5 + 0.5).toFixed(2), isBottleneck: wip > 16 };
  });
}

// ---------- Generate Machines ----------
function generateMachines(factories: Factory[]): Machine[] {
  const machines: Machine[] = [];
  let machId = 1;
  for (const factory of factories) {
    for (const floor of factory.floors) {
      for (const line of floor.lines) {
        const count = rng(6, 10);
        for (let i = 0; i < count; i++) {
          const type = pick(MACHINE_TYPES);
          const status: Machine["status"] = pick(["Running", "Running", "Running", "Running", "Idle", "Maintenance", "Breakdown"]);
          machines.push({
            id: `MCH${String(machId++).padStart(4, "0")}`,
            name: `${type}-${String(machId).padStart(3, "0")}`,
            type, brand: pick(MACHINE_BRANDS), model: `${pick(["DDL", "MO", "LK", "MH", "BH"])}-${rng(1000, 9999)}`,
            lineId: line.id, factoryId: factory.id, status,
            lastMaintenance: `2026-0${rng(1, 3)}-${String(rng(1, 28)).padStart(2, "0")}`,
            nextMaintenance: `2026-0${rng(3, 6)}-${String(rng(1, 28)).padStart(2, "0")}`,
            hoursRun: rng(500, 8000),
            needleCount: type === "DNLS" ? 2 : type === "Overlock" ? rng(3, 5) : 1,
            rpm: rng(2000, 6000),
            temperature: +(Math.random() * 15 + 35).toFixed(1),
            vibration: +(Math.random() * 5 + 1).toFixed(2),
            oilLevel: rng(40, 100),
          });
        }
      }
    }
  }
  return machines;
}

// ---------- Generate Quality Inspections ----------
function generateInspections(factories: Factory[]): QualityInspection[] {
  const inspections: QualityInspection[] = [];
  let inspId = 1;
  for (const factory of factories) {
    for (const floor of factory.floors) {
      for (const line of floor.lines) {
        for (let day = 1; day <= 7; day++) {
          if (Math.random() < 0.6) {
            const inspected = rng(200, 500);
            const defectCount = rng(2, 20);
            const defects = pickN(DEFECT_TYPES, rng(2, 5)).map(type => ({ type, count: rng(1, 5) }));
            const dhu = +(defectCount / inspected * 100).toFixed(1);
            inspections.push({
              id: `INS${String(inspId++).padStart(4, "0")}`,
              lineId: line.id, factoryId: factory.id,
              inspector: pick(INSPECTORS),
              date: `2026-03-${String(day + 1).padStart(2, "0")}`,
              inspectedQty: inspected, defectQty: defectCount, defects,
              dhu, aqlResult: dhu < 3 ? "Pass" : dhu < 5 ? "Conditional" : "Fail",
              aqlLevel: pick(["1.5", "2.5", "4.0"]),
              status: day < 7 ? "Completed" : "In Progress",
            });
          }
        }
      }
    }
  }
  return inspections;
}

// ---------- Generate Downtime Logs ----------
function generateDowntimeLogs(factories: Factory[]): DowntimeLog[] {
  const logs: DowntimeLog[] = [];
  let logId = 1;
  const reasons = ["Machine Breakdown", "Thread Breakage", "Needle Change", "Fabric Shortage", "Power Outage", "Operator Absent", "Quality Rework", "Bundle Waiting", "Bobbin Change", "Style Changeover"];
  const categories: DowntimeLog["category"][] = ["Machine", "Material", "Machine", "Material", "Management", "Manpower", "Method", "Material", "Machine", "Method"];
  const actions = ["Replaced motor belt", "Re-threaded machine", "Changed needle type", "Emergency fabric order placed", "Generator activated", "Cross-trained operator assigned", "Rework station setup", "Bundle flow optimized", "Bobbin replenished", "Setup team deployed"];

  for (const factory of factories) {
    for (const floor of factory.floors) {
      for (const line of floor.lines) {
        const count = rng(1, 4);
        for (let i = 0; i < count; i++) {
          const reasonIdx = rng(0, reasons.length - 1);
          const duration = rng(10, 120);
          const hour = rng(8, 17);
          logs.push({
            id: `DT${String(logId++).padStart(4, "0")}`,
            lineId: line.id, factoryId: factory.id,
            reason: reasons[reasonIdx], category: categories[reasonIdx],
            startTime: `2026-03-08T${String(hour).padStart(2, "0")}:${String(rng(0, 59)).padStart(2, "0")}:00`,
            endTime: `2026-03-08T${String(hour + Math.floor(duration / 60)).padStart(2, "0")}:${String((rng(0, 59) + duration) % 60).padStart(2, "0")}:00`,
            duration, resolved: Math.random() < 0.8,
            actionTaken: actions[reasonIdx],
          });
        }
      }
    }
  }
  return logs;
}

// ---------- Generate CV Cameras ----------
function generateCVCameras(factories: Factory[]): CVCamera[] {
  const cameras: CVCamera[] = [];
  let camId = 1;
  for (const factory of factories) {
    const lines = factory.floors.flatMap(f => f.lines).slice(0, 4); // 4 cameras per factory
    for (const line of lines) {
      cameras.push({
        id: `CAM${String(camId++).padStart(3, "0")}`,
        name: `CV-${factory.id}-${line.name}`,
        lineId: line.id, factoryId: factory.id,
        status: pick(["Online", "Online", "Online", "Online", "Offline", "Calibrating"]),
        piecesCount: rng(200, 800),
        defectsDetected: rng(5, 40),
        accuracy: +(Math.random() * 5 + 94).toFixed(1),
        lastCalibrated: `2026-03-${String(rng(1, 8)).padStart(2, "0")}`,
        fps: rng(25, 60),
      });
    }
  }
  return cameras;
}

// ---------- Generate AI Predictions ----------
function generateAIPredictions(factories: Factory[]): AIPrediction[] {
  const predictions: AIPrediction[] = [];
  let predId = 1;
  const templates: { type: AIPrediction["type"]; prediction: string; details: string; recommendation: string }[] = [
    { type: "Efficiency", prediction: "Line efficiency expected to drop 8% in next 2 hours", details: "Pattern analysis shows declining output rate matching historical fatigue curves", recommendation: "Schedule 10-min break and rotate operators at bottleneck stations" },
    { type: "Quality", prediction: "DHU spike predicted on finishing operations", details: "Thread tension variance detected across 3 machines with correlated defect patterns", recommendation: "Calibrate thread tension on SNLS machines #12, #15, #18" },
    { type: "Delivery", prediction: "Order PO-2026-0015 at risk of 3-day delay", details: "Current production rate 12% below plan with fabric supply constraint", recommendation: "Add overtime shift or redistribute 5 operators from Line L8" },
    { type: "Downtime", prediction: "Machine MCH-0042 likely to fail within 24 hours", details: "Vibration levels 40% above baseline, oil temperature elevated", recommendation: "Schedule preventive maintenance during lunch break" },
    { type: "Defect", prediction: "Open seam defects increasing on dark wash fabrics", details: "Needle heat accumulation causing thread damage on heavier fabrics", recommendation: "Switch to titanium-coated needles for 12oz+ fabrics" },
    { type: "Efficiency", prediction: "Overall factory efficiency can improve 5% with layout change", details: "WIP bottleneck at waistband join can be relieved by adding parallel station", recommendation: "Add 1 additional waistband station and rebalance line" },
    { type: "Quality", prediction: "Shade variation risk high on current fabric lot", details: "Incoming fabric test shows 0.3 delta-E variance between rolls", recommendation: "Sort rolls by shade group before cutting" },
    { type: "Delivery", prediction: "3 orders can be consolidated for shipping efficiency", details: "Orders PO-0008, PO-0012, PO-0019 share same buyer and destination", recommendation: "Coordinate finishing schedule for consolidated shipment" },
  ];

  for (const factory of factories) {
    const count = rng(3, 6);
    for (let i = 0; i < count; i++) {
      const template = pick(templates);
      predictions.push({
        id: `PRED${String(predId++).padStart(4, "0")}`,
        factoryId: factory.id,
        type: template.type,
        prediction: template.prediction,
        confidence: rng(72, 97),
        impact: pick(["High", "Medium", "Low"]),
        timestamp: new Date(2026, 2, 8, rng(8, 18), rng(0, 59)).toISOString(),
        details: template.details,
        recommendation: template.recommendation,
      });
    }
  }
  return predictions;
}

// ---------- Generate Material Inventory ----------
function generateMaterials(factories: Factory[]): MaterialInventory[] {
  const materials: MaterialInventory[] = [];
  let matId = 1;
  const items: { name: string; type: MaterialInventory["type"]; unit: string; minStock: number }[] = [
    { name: "11.5oz Rigid Denim", type: "Fabric", unit: "yards", minStock: 500 },
    { name: "10oz Stretch Denim", type: "Fabric", unit: "yards", minStock: 500 },
    { name: "Core Spun Thread (Tex 40)", type: "Thread", unit: "cones", minStock: 200 },
    { name: "Polyester Thread (Tex 27)", type: "Thread", unit: "cones", minStock: 200 },
    { name: "YKK Metal Zipper 7\"", type: "Zipper", unit: "pcs", minStock: 1000 },
    { name: "Brass Shank Button 17mm", type: "Button", unit: "pcs", minStock: 2000 },
    { name: "Copper Rivet 8mm", type: "Rivet", unit: "pcs", minStock: 5000 },
    { name: "Woven Main Label", type: "Label", unit: "pcs", minStock: 3000 },
    { name: "Size Label (S/M/L/XL)", type: "Label", unit: "pcs", minStock: 5000 },
    { name: "Poly Bag 12x18", type: "Packaging", unit: "pcs", minStock: 2000 },
    { name: "Carton Box 60x40x30", type: "Packaging", unit: "pcs", minStock: 500 },
  ];

  for (const factory of factories) {
    for (const item of items) {
      const currentStock = rng(Math.round(item.minStock * 0.2), Math.round(item.minStock * 3));
      const ratio = currentStock / item.minStock;
      const status: MaterialInventory["status"] = ratio > 1.5 ? "Sufficient" : ratio > 0.8 ? "Low" : ratio > 0.3 ? "Critical" : "Out of Stock";
      materials.push({
        id: `MAT${String(matId++).padStart(4, "0")}`,
        name: item.name, type: item.type, factoryId: factory.id,
        currentStock, minStock: item.minStock, unit: item.unit,
        supplier: pick(MATERIAL_SUPPLIERS),
        lastReceived: `2026-03-${String(rng(1, 8)).padStart(2, "0")}`,
        status,
      });
    }
  }
  return materials;
}

// ---------- Generate Factory-Level KPIs ----------
function generateFactoryLevelKPIs(factories: Factory[]): FactoryLevelKPI[] {
  return factories.map(f => {
    const lines = f.floors.flatMap(fl => fl.lines);
    const avgEff = lines.length ? Math.round(lines.reduce((s, l) => s + l.efficiency, 0) / lines.length) : 0;
    const dhu = +(Math.random() * 3 + 1.2).toFixed(1);
    return {
      factoryId: f.id, factoryName: f.name, factoryEfficiency: avgEff,
      overallLaborProductivity: +(Math.random() * 8 + 12).toFixed(1),
      costPerStandardMinute: +(Math.random() * 0.03 + 0.04).toFixed(3),
      manToMachineRatio: +(Math.random() * 0.3 + 1.1).toFixed(2),
      cutToShipRatio: +(Math.random() * 5 + 92).toFixed(1),
      orderToShipRatio: +(Math.random() * 4 + 94).toFixed(1),
      onTimeDeliveryRate: +(Math.random() * 8 + 88).toFixed(1),
      rftQuality: +(100 - dhu).toFixed(1), dhuPercent: dhu,
      qualityPerformance: +(Math.random() * 5 + 93).toFixed(1),
      lostTimePercent: +(Math.random() * 6 + 3).toFixed(1),
      workerAbsenteeismRate: +(Math.random() * 8 + 4).toFixed(1),
      employeeTurnoverRate: +(Math.random() * 5 + 2).toFixed(1),
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
export const machines = generateMachines(factories);
export const qualityInspections = generateInspections(factories);
export const downtimeLogs = generateDowntimeLogs(factories);
export const cvCameras = generateCVCameras(factories);
export const aiPredictions = generateAIPredictions(factories);
export const materialInventory = generateMaterials(factories);

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
  const totalDefects = DENIM_DEFECTS.reduce((s, d) => s + d.count, 0);
  const totalInspected = Math.round(totalDefects / 0.022);
  const dhu = +(totalDefects / totalInspected * 100).toFixed(1);
  const rft = +(100 - dhu).toFixed(1);
  return { totalOutput, totalTarget, avgEfficiency, activeLines, totalDowntime, pendingAlerts, dhu, rft };
}

export function getFactoryInfo(factoryId: string) {
  if (factoryId === "all") return { name: "Armana Group", location: "All Locations", address: "Headquarters", user: FACTORY_USERS["all"] };
  const factory = factories.find(f => f.id === factoryId);
  if (!factory) return { name: "Armana Group", location: "", address: "", user: FACTORY_USERS["all"] };
  return { name: factory.name, location: factory.location, address: factory.address, user: factory.user };
}
