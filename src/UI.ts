/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Memory } from './Memory'
import { ScoreInput, ScoreResponse } from './Score'
import { TrainExtractorStep, TrainScorerStep } from './TrainDialog'
import { EntityBase } from './Entity'
import { ExtractResponse } from './Extract'
import { TeachResponse } from './Teach'
import { AppIdList, AppList } from './App'

export const CL_USER_NAME_ID = 'CLTrainer'
export const MEMORY_KEY_HEADER_NAME = 'x-conversationlearner-memory-key'

/** Indicates whether END_SESSION was called on the running Session */
export enum SessionEndState {
  /** Session ended because END_SESSION activity has been called */
  COMPLETED = 'completed',
  /** Session ended because of timeout or new session started w/o END_SESSION activity */
  OPEN = 'open'
}

export enum ScoreReason {
  // Action has been masked
  NotAvailable = 'notAvailable',

  // Action can't be scored because it hasn't been trained yet
  NotScorable = 'notScorable',

  // Score has not yet been calculated
  NotCalculated = 'notCalculated'
}

export interface UIScoreInput {
  trainExtractorStep: TrainExtractorStep | null
  extractResponse: ExtractResponse
}

export interface UIExtractResponse {
  extractResponse: ExtractResponse
  memories: Memory[]
}

export interface UIPostScoreResponse {
  teachResponse: TeachResponse
  isEndTask: Boolean
  memories: Memory[]
}

export interface UIScoreResponse {
  scoreResponse: ScoreResponse
  scoreInput: ScoreInput
  memories: Memory[]
}

export interface UITrainScorerStep {
  trainScorerStep: TrainScorerStep
  entities: EntityBase[]
}

export interface UIAppList {
  appList: AppList
  activeApps: { [appId: string]: string } // appId: packageId
}
