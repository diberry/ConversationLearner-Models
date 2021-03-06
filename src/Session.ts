/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { LogRound } from './LogDialog'

export enum DialogType {
  TEACH = 'teach',
  TRAINDIALOG = 'traindialog',
  LOGDIALOG = 'logdialog'
}

export interface Session {
  sessionId: string
  logDialogId: string
  createdDatetime: string
  lastQueryDatetime: string
  packageId: number
  saveToLog: boolean
}

export interface SessionList {
  sessions: Session[]
}

export interface SessionIdList {
  sessionIds: string[]
}

export interface SessionCreateParams {
  contextDialog?: LogRound[]
  packageId?: string
  saveToLog: boolean
}
