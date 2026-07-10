import { applyKorpEvent, createInitialState } from "../../../packages/korp-core/src/index";
import type { KorpEvent, KorpState } from "../../../packages/korp-core/src/index";

let clickSequence = 0;
let korpState = createInitialState();

export type ClickAuditCoreUpdate = {
  event: KorpEvent;
  state: KorpState;
};

export const emitClickAuditClick = (timestamp = Date.now()): ClickAuditCoreUpdate => {
  const event: KorpEvent = {
    id: `clickaudit-click-${timestamp}-${clickSequence++}`,
    timestamp,
    sourceModule: "click-audit",
    type: "clickaudit.click",
    value: 1
  };

  korpState = applyKorpEvent(korpState, event);

  return { event, state: korpState };
};

export const getClickAuditKorpState = (): KorpState => korpState;

export const resetClickAuditKorpState = (): KorpState => {
  clickSequence = 0;
  korpState = createInitialState();
  return korpState;
};
