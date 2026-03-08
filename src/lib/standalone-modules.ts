import { FieldDef, ModuleDef } from "@/lib/module-registry";

// Standalone CRUD page configs for sidebar modules (not in MIS registry)
// Reuses the same CrudDataTable via ModuleDef shape

const STATUS_OPTIONS = ["Pending", "In Progress", "Completed", "Approved", "Rejected"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High", "Critical"];
const SHIFT_OPTIONS = ["Morning", "Afternoon", "Night"];
const RESULT_OPTIONS = ["Pass", "Fail", "Conditional"];
const DEPT_OPTIONS = ["Cutting", "Sewing", "Finishing", "Quality", "Stores", "Admin"];

const dateField = (key = "date", label = "Date"): FieldDef => ({ key, label, type: "date", required: true });
const statusField: FieldDef = { key: "status", label: "Status", type: "select", options: STATUS_OPTIONS, required: true };
const remarksField: FieldDef = { key: "remarks", label: "Remarks", type: "textarea" };
const styleField: FieldDef = { key: "styleNo", label: "Style No", type: "text", required: true };
const orderField: FieldDef = { key: "orderNo", label: "Order No", type: "text" };
const buyerField: FieldDef = { key: "buyer", label: "Buyer", type: "text" };
const lineField: FieldDef = { key: "lineNo", label: "Line No", type: "text" };

export const standaloneCrudModules: Record<string, ModuleDef> = {
  // ── Cut to Pack ──────────────────────────
  "cut-to-pack": {
    id: 1001, slug: "crud_cut-to-pack", title: "Cut to Pack Flow",
    section: "Production", sectionSlug: "production",
    fields: [
      dateField(), styleField, orderField, buyerField,
      { key: "color", label: "Color", type: "text" },
      { key: "cutQty", label: "Cut Qty", type: "number", required: true, validation: { min: 1 } },
      { key: "inputToSewing", label: "Input to Sewing", type: "number", validation: { min: 0 } },
      { key: "sewingOutput", label: "Sewing Output", type: "number", validation: { min: 0 } },
      { key: "finishingInput", label: "Finishing Input", type: "number", validation: { min: 0 } },
      { key: "finishingOutput", label: "Finishing Output", type: "number", validation: { min: 0 } },
      { key: "packedQty", label: "Packed Qty", type: "number", validation: { min: 0 } },
      { key: "shipDate", label: "Ship Date", type: "date" },
      { key: "stage", label: "Current Stage", type: "select", options: ["Cutting", "Sewing", "Finishing", "Packing", "Shipped"] },
      statusField, remarksField,
    ],
  },

  // ── Inspections ──────────────────────────
  "inspections": {
    id: 1002, slug: "crud_inspections", title: "Inspections",
    section: "Quality", sectionSlug: "quality",
    fields: [
      dateField(), styleField, orderField, buyerField, lineField,
      { key: "inspectionType", label: "Inspection Type", type: "select", options: ["Inline", "End Line", "Final", "Pre-Final", "AQL", "Fabric", "Trim", "Cutting"], required: true },
      { key: "inspectedQty", label: "Inspected Qty", type: "number" },
      { key: "passQty", label: "Pass Qty", type: "number" },
      { key: "failQty", label: "Fail Qty", type: "number" },
      { key: "defectRate", label: "Defect Rate %", type: "number" },
      { key: "inspector", label: "Inspector", type: "text" },
      { key: "result", label: "Result", type: "select", options: RESULT_OPTIONS },
      { key: "defectsFound", label: "Defects Found", type: "textarea" },
      { key: "correctiveAction", label: "Corrective Action", type: "textarea" },
      statusField, remarksField,
    ],
  },

  // ── Defect Analysis ──────────────────────
  "defects": {
    id: 1003, slug: "crud_defects", title: "Defect Analysis",
    section: "Quality", sectionSlug: "quality",
    fields: [
      dateField(), styleField, orderField, lineField,
      { key: "defectType", label: "Defect Type", type: "select", options: ["Broken Stitch", "Skip Stitch", "Open Seam", "Puckering", "Shading", "Stain", "Hole", "Wrong Measurement", "Misalignment", "Other"], required: true },
      { key: "defectLocation", label: "Defect Location", type: "text" },
      { key: "defectCount", label: "Defect Count", type: "number", required: true },
      { key: "severity", label: "Severity", type: "select", options: ["Minor", "Major", "Critical"] },
      { key: "rootCause", label: "Root Cause", type: "textarea" },
      { key: "correctiveAction", label: "Corrective Action", type: "textarea" },
      { key: "operator", label: "Operator", type: "text" },
      { key: "machine", label: "Machine", type: "text" },
      statusField, remarksField,
    ],
  },

  // ── Skill Matrix ─────────────────────────
  "skills": {
    id: 1004, slug: "crud_skills", title: "Skill Matrix",
    section: "Resources", sectionSlug: "resources",
    fields: [
      dateField("assessmentDate", "Assessment Date"),
      { key: "operatorId", label: "Operator ID", type: "text", required: true },
      { key: "operatorName", label: "Operator Name", type: "text", required: true },
      lineField,
      { key: "operation", label: "Operation", type: "text", required: true },
      { key: "machineType", label: "Machine Type", type: "select", options: ["SNLS", "DNLS", "Overlock", "Flatlock", "Bartack", "Button", "Buttonhole", "Iron", "Manual"] },
      { key: "skillLevel", label: "Skill Level", type: "select", options: ["Beginner", "Intermediate", "Advanced", "Expert"], required: true },
      { key: "efficiency", label: "Efficiency %", type: "number" },
      { key: "smv", label: "Operation SMV", type: "number" },
      { key: "trainingRequired", label: "Training Required", type: "select", options: ["Yes", "No"] },
      { key: "certifiedBy", label: "Certified By", type: "text" },
      remarksField,
    ],
  },

  // ── Attendance ───────────────────────────
  "attendance": {
    id: 1005, slug: "crud_attendance", title: "Attendance",
    section: "Resources", sectionSlug: "resources",
    fields: [
      dateField(),
      { key: "department", label: "Department", type: "select", options: DEPT_OPTIONS, required: true },
      lineField,
      { key: "shift", label: "Shift", type: "select", options: SHIFT_OPTIONS },
      { key: "totalStaff", label: "Total Staff", type: "number", required: true },
      { key: "present", label: "Present", type: "number", required: true },
      { key: "absent", label: "Absent", type: "number" },
      { key: "late", label: "Late", type: "number" },
      { key: "leave", label: "On Leave", type: "number" },
      { key: "overtime", label: "Overtime (hrs)", type: "number" },
      { key: "absenteeRate", label: "Absentee Rate %", type: "number" },
      remarksField,
    ],
  },

  // ── AI Defect Detection ──────────────────
  "ai-defects": {
    id: 1006, slug: "crud_ai-defects", title: "AI Defect Detection",
    section: "AI & Automation", sectionSlug: "ai",
    fields: [
      dateField(),
      { key: "cameraId", label: "Camera ID", type: "text", required: true },
      lineField, styleField,
      { key: "totalScanned", label: "Total Scanned", type: "number" },
      { key: "defectsDetected", label: "Defects Detected", type: "number" },
      { key: "falsePositives", label: "False Positives", type: "number" },
      { key: "defectTypes", label: "Defect Types", type: "textarea" },
      { key: "accuracy", label: "Detection Accuracy %", type: "number" },
      { key: "actionTaken", label: "Action Taken", type: "textarea" },
      statusField, remarksField,
    ],
  },

  // ── Buyer Analytics ──────────────────────
  "buyer-analytics": {
    id: 1007, slug: "crud_buyer-analytics", title: "Buyer Analytics",
    section: "Analytics", sectionSlug: "analytics",
    fields: [
      dateField("reportDate", "Report Date"),
      buyerField,
      { key: "totalOrders", label: "Total Orders", type: "number" },
      { key: "totalQty", label: "Total Qty", type: "number" },
      { key: "onTimeDelivery", label: "On-Time Delivery %", type: "number" },
      { key: "qualityScore", label: "Quality Score %", type: "number" },
      { key: "rejectRate", label: "Reject Rate %", type: "number" },
      { key: "avgEfficiency", label: "Avg Efficiency %", type: "number" },
      { key: "revenue", label: "Revenue", type: "number" },
      { key: "costPerPiece", label: "Cost/Piece", type: "number" },
      { key: "satisfaction", label: "Satisfaction", type: "select", options: ["Excellent", "Good", "Average", "Poor"] },
      remarksField,
    ],
  },

  // ── Digital Twin ─────────────────────────
  "digital-twin": {
    id: 1008, slug: "crud_digital-twin", title: "Digital Twin",
    section: "Advanced", sectionSlug: "advanced",
    fields: [
      dateField("simulationDate", "Simulation Date"),
      { key: "scenarioName", label: "Scenario Name", type: "text", required: true },
      { key: "factoryLayout", label: "Factory/Layout", type: "text" },
      { key: "parameter", label: "Parameter Changed", type: "text" },
      { key: "baselineValue", label: "Baseline Value", type: "number" },
      { key: "simulatedValue", label: "Simulated Value", type: "number" },
      { key: "expectedImpact", label: "Expected Impact", type: "textarea" },
      { key: "outcome", label: "Outcome", type: "textarea" },
      statusField, remarksField,
    ],
  },

  // ── Benchmarking ─────────────────────────
  "benchmarking": {
    id: 1009, slug: "crud_benchmarking", title: "Benchmarking",
    section: "Advanced", sectionSlug: "advanced",
    fields: [
      dateField("reportDate", "Report Date"),
      { key: "factory", label: "Factory", type: "text", required: true },
      { key: "metric", label: "Metric", type: "select", options: ["Efficiency", "Quality", "OTD", "Cost/Min", "Absenteeism", "Turnover", "RFT"], required: true },
      { key: "currentValue", label: "Current Value", type: "number" },
      { key: "benchmarkValue", label: "Benchmark Value", type: "number" },
      { key: "industryAvg", label: "Industry Average", type: "number" },
      { key: "gap", label: "Gap %", type: "number" },
      { key: "actionPlan", label: "Action Plan", type: "textarea" },
      { key: "targetDate", label: "Target Date", type: "date" },
      statusField, remarksField,
    ],
  },

  // ── Master Data ──────────────────────────
  "master-data": {
    id: 1010, slug: "crud_master-data", title: "Master Data",
    section: "Administration", sectionSlug: "admin",
    fields: [
      { key: "category", label: "Category", type: "select", options: ["Factory", "Line", "Machine", "Style", "Buyer", "Supplier", "Operation", "Trim", "Fabric"], required: true },
      { key: "code", label: "Code", type: "text", required: true },
      { key: "name", label: "Name", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "department", label: "Department", type: "select", options: DEPT_OPTIONS },
      { key: "capacity", label: "Capacity", type: "number" },
      { key: "location", label: "Location", type: "text" },
      { key: "contactPerson", label: "Contact Person", type: "text" },
      { key: "isActive", label: "Active", type: "select", options: ["Yes", "No"] },
      remarksField,
    ],
  },

  // ── Settings ─────────────────────────────
  "settings": {
    id: 1011, slug: "crud_settings", title: "Settings",
    section: "Administration", sectionSlug: "admin",
    fields: [
      { key: "category", label: "Category", type: "select", options: ["General", "Production", "Quality", "Notification", "Report", "User"], required: true },
      { key: "settingKey", label: "Setting Key", type: "text", required: true },
      { key: "settingValue", label: "Setting Value", type: "text", required: true },
      { key: "description", label: "Description", type: "textarea" },
      { key: "dataType", label: "Data Type", type: "select", options: ["String", "Number", "Boolean", "JSON"] },
      { key: "updatedBy", label: "Updated By", type: "text" },
      { key: "isActive", label: "Active", type: "select", options: ["Yes", "No"] },
      remarksField,
    ],
  },
};
