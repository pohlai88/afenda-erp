export * from "./actions";
export * from "./contracts";
export * from "./data";
export * from "./events";
export * from "./policies";
export * from "./schemas";

export {
  buildHrTrainingPageModel,
  buildHrTalentTrainingPageModel,
  type HrTrainingPageModel,
  type HrTalentTrainingPageModel,
} from "./data/hr.talent.training.page-model.server";

export {
  HrTrainingAccessDeniedPanel,
  HrTrainingSection,
  HrTalentTrainingAccessDeniedPanel,
  HrTalentTrainingSection,
} from "./components";
