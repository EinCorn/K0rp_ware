import metaData from "../data/shards/meta.json";
import balanceData from "../data/shards/balance.json";
import resourcesData from "../data/shards/resources.json";
import eventsData from "../data/shards/events.json";
import auditFormsData from "../data/shards/audit-forms.json";
import upgradesData1 from "../data/shards/upgrades-audit.json";
import upgradesData2 from "../data/shards/upgrades-care.json";
import upgradesData3 from "../data/shards/upgrades-confirmation.json";
import upgradesData4 from "../data/shards/upgrades-cross.json";
import upgradesData5 from "../data/shards/upgrades-idle.json";
import upgradesData6 from "../data/shards/upgrades-stabilization.json";
import upgradesData7 from "../data/shards/upgrades-system.json";
import certificationsData from "../data/shards/certifications.json";
import crossModuleInteractionsData from "../data/shards/cross-module-interactions.json";
import memosData from "../data/shards/memos.json";
import prestigeData from "../data/shards/prestige.json";
import prestigeDirectivesData from "../data/shards/prestige-directives.json";
import firstCyclePhasesData from "../data/shards/first-cycle-phases.json";
import type { ProgressionDatabase } from "./progression.types";

export const KORP_PROGRESSION_DATABASE = {
  meta: metaData,
  balance: balanceData,
  resources: resourcesData,
  events: eventsData,
  auditForms: auditFormsData,
  upgrades: [
    ...upgradesData1,
    ...upgradesData2,
    ...upgradesData3,
    ...upgradesData4,
    ...upgradesData5,
    ...upgradesData6,
    ...upgradesData7
  ],
  certifications: certificationsData,
  crossModuleInteractions: crossModuleInteractionsData,
  memos: memosData,
  prestige: prestigeData,
  prestigeDirectives: prestigeDirectivesData,
  firstCyclePhases: firstCyclePhasesData
} as unknown as ProgressionDatabase;
