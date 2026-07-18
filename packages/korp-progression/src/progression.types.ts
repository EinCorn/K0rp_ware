export type ResourceKind =
  | "currency"
  | "meter"
  | "derived"
  | "prestige"
  | "module-local"
  | "lifetime-stat"
  | "hidden";

export type ResourceScope =
  | "global"
  | "click-audit"
  | "fidget"
  | "bloom"
  | "corner-watch"
  | "bubble-wrap"
  | "button-compliance"
  | "surface-compliance"
  | "shape-compliance"
  | "attention-runner"
  | "zen-garden"
  | "newton-cradle";

export type ResetScope =
  | "moduleSession"
  | "shift"
  | "auditCycle"
  | "reorganization"
  | "never";

export type ResourceVisibility =
  | "visible-from-start"
  | "visible-after-audit"
  | "visible-after-fidget"
  | "visible-after-bloom"
  | "visible-after-button"
  | "visible-after-first-prestige"
  | "visible-in-module"
  | "hidden-until-memo"
  | "hidden";

export type PersistenceLevel = "transient" | "gameplay" | "milestone";

export type Requirement = {
  readonly kind: string;
  readonly [key: string]: unknown;
};

export type ProgressionEffect = {
  readonly kind: string;
  readonly [key: string]: unknown;
};

export type ResourceDefinition = {
  readonly id: string;
  readonly label: string;
  readonly shortLabel: string;
  readonly kind: ResourceKind;
  readonly scope: ResourceScope;
  readonly visibility: ResourceVisibility;
  readonly resetScope: ResetScope;
  readonly initial: number;
  readonly minimum: number;
  readonly maximum: number | null;
  readonly spendable: boolean;
  readonly description: string;
};

export type EventDefinition = {
  readonly id: string;
  readonly moduleId: string;
  readonly persistence: PersistenceLevel;
  readonly description: string;
  readonly effects?: Readonly<Record<string, number>>;
  readonly profiles?: Readonly<Record<string, Readonly<Record<string, number>>>>;
  readonly secondaryEvents?: readonly Readonly<Record<string, unknown>>[];
  readonly notes?: string;
};

export type AuditField = {
  readonly id: string;
  readonly type: string;
  readonly label: string;
  readonly required: boolean;
  readonly [key: string]: unknown;
};

export type AuditAuthorization = {
  readonly moduleId: string;
  readonly resourceId: "notionalWorkUnits";
  readonly cost: number;
};

export type AuditFormDefinition = {
  readonly id: string;
  readonly code: string;
  readonly title: string;
  readonly estimatedMinutes: number;
  readonly interactionClickProfile: string;
  readonly submitEvent: string;
  readonly fields: readonly AuditField[];
  readonly requirements?: Requirement;
  readonly authorization?: AuditAuthorization;
  readonly completionEffects: readonly ProgressionEffect[];
  readonly availableAtStart?: boolean;
  readonly optional?: boolean;
  readonly repeatable?: boolean;
};

export type UpgradeCost = {
  readonly resourceId: string;
  readonly amount: number;
};

export type UpgradeDefinition = {
  readonly id: string;
  readonly title: string;
  readonly department: string;
  readonly tier: number;
  readonly balanceRole: string;
  readonly resetScope: ResetScope;
  readonly costs: readonly UpgradeCost[];
  readonly requirements: Requirement;
  readonly effects: readonly ProgressionEffect[];
  readonly copy: string;
};

export type MemoDefinition = {
  readonly id: string;
  readonly from: string;
  readonly subject: string;
  readonly priority: string;
  readonly delivery: string;
  readonly trigger: Requirement;
  readonly body: readonly string[];
};

export type CertificationDefinition = {
  readonly id: string;
  readonly moduleId: string;
  readonly title: string;
  readonly requirements: Requirement;
};

export type CrossModuleDefinition = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly [key: string]: unknown;
};

export type PrestigeDirectiveDefinition = {
  readonly id: string;
  readonly title: string;
  readonly cost: number;
  readonly effects: readonly ProgressionEffect[];
  readonly copy: string;
};

export type FirstCyclePhase = {
  readonly id: string;
  readonly title: string;
  readonly minuteRange: readonly [number, number];
  readonly primarySurface: string;
  readonly expectedActions: Readonly<Record<string, unknown>>;
  readonly expectedCumulative: Readonly<Record<string, unknown>>;
  readonly expectedPurchases?: readonly string[];
  readonly unlocks: readonly string[];
  readonly designGoal: string;
};

export type ProgressionDatabase = {
  readonly meta: Readonly<Record<string, unknown>>;
  readonly balance: Readonly<Record<string, unknown>>;
  readonly resources: readonly ResourceDefinition[];
  readonly events: readonly EventDefinition[];
  readonly auditForms: readonly AuditFormDefinition[];
  readonly upgrades: readonly UpgradeDefinition[];
  readonly certifications: readonly CertificationDefinition[];
  readonly crossModuleInteractions: readonly CrossModuleDefinition[];
  readonly memos: readonly MemoDefinition[];
  readonly prestige: Readonly<Record<string, unknown>>;
  readonly prestigeDirectives: readonly PrestigeDirectiveDefinition[];
  readonly firstCyclePhases: readonly FirstCyclePhase[];
};
