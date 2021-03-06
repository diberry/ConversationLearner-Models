/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExtractResponse } from './Extract'
import { Teach, TeachResponse } from './Teach'
import { TrainRound, TrainDialog, TrainExtractorStep, TrainScorerStep, TextVariation, CreateTeachParams } from './TrainDialog'
import { LogDialog, LogRound, LogScorerStep } from './LogDialog'
import { EntityList, EntityBase, LabeledEntity, PredictedEntity } from './Entity'
import { ActionBase } from './Action'
import { AppDefinition } from './AppDefinition'

export class ModelUtils {
  /** Remove n words from start of string */
  public static RemoveWords(text: string, numWords: number): string {
    if (text.length === 0 || numWords === 0) {
      return text
    }

    const firstSpace = text.indexOf(' ')
    const remaining = firstSpace > 0 ? text.slice(firstSpace + 1) : ''
    numWords--

    return this.RemoveWords(remaining, numWords)
  }

  //====================================================================
  // CONVERSION: LabeledEntity == PredictedEntity
  //====================================================================
  public static ToLabeledEntity(predictedEntity: PredictedEntity): LabeledEntity {
    const { score, ...labeledEntity } = predictedEntity
    return predictedEntity
  }

  public static ToLabeledEntities(predictedEntities: PredictedEntity[]): LabeledEntity[] {
    let labeledEntities: LabeledEntity[] = []
    for (let predictedEntity of predictedEntities) {
      let labelEntity = ModelUtils.ToLabeledEntity(predictedEntity)
      labeledEntities.push(labelEntity)
    }
    return labeledEntities
  }

  public static ToPredictedEntity(labeledEntity: LabeledEntity): PredictedEntity {
    return {
      ...labeledEntity,
      score: undefined
    }
  }

  public static ToPredictedEntities(labeledEntities: LabeledEntity[]): PredictedEntity[] {
    let predictedEntities: PredictedEntity[] = []
    for (let labeledEntity of labeledEntities) {
      let predictedEntity = ModelUtils.ToPredictedEntity(labeledEntity)
      predictedEntities.push(predictedEntity)
    }
    return predictedEntities
  }

  //====================================================================
  // CONVERSION: ExtractResponse == TextVariation
  //====================================================================
  public static ToTextVariation(extractResponse: ExtractResponse): TextVariation {
    let labeledEntities = this.ToLabeledEntities(extractResponse.predictedEntities)
    let textVariation = {
      text: extractResponse.text,
      labelEntities: labeledEntities
    }
    return textVariation
  }

  public static ToExtractResponses(textVariations: TextVariation[]): ExtractResponse[] {
    let extractResponses: ExtractResponse[] = []
    for (let textVariation of textVariations) {
      let predictedEntities = this.ToPredictedEntities(textVariation.labelEntities)
      let extractResponse: ExtractResponse = {
        definitions: {
          entities: [],
          actions: [],
          trainDialogs: []
        },
        packageId: '',
        metrics: {
          wallTime: 0
        },
        text: textVariation.text,
        predictedEntities: predictedEntities
      }
      extractResponses.push(extractResponse)
    }
    return extractResponses
  }

  public static ToTextVariations(extractResponses: ExtractResponse[]): TextVariation[] {
    let textVariations: TextVariation[] = []
    for (let extractResponse of extractResponses) {
      let labelEntities = this.ToLabeledEntities(extractResponse.predictedEntities)
      let textVariation: TextVariation = {
        text: extractResponse.text,
        labelEntities: labelEntities
      }
      textVariations.push(textVariation)
    }
    return textVariations
  }

  //====================================================================
  // CONVERSION: LogDialog == TrainDialog
  //====================================================================
  public static ToTrainDialog(
    logDialog: LogDialog,
    actions: ActionBase[] | null = null,
    entities: EntityBase[] | null = null
  ): TrainDialog {
    let trainRounds: TrainRound[] = []
    for (let logRound of logDialog.rounds) {
      let trainRound = ModelUtils.ToTrainRound(logRound)
      trainRounds.push(trainRound)
    }

    let appDefinition: AppDefinition | null = null
    if (entities != null && actions != null) {
      appDefinition = {
        entities,
        actions,
        trainDialogs: []
      }
    }

    return {
      createdDateTime: logDialog.createdDateTime,
      lastModifiedDateTime: logDialog.lastModifiedDateTime,
      packageCreationId: 0,
      packageDeletionId: 0,
      trainDialogId: '',
      sourceLogDialogId: logDialog.logDialogId,
      version: 0,
      rounds: trainRounds,
      definitions: appDefinition
    }
  }

  //====================================================================
  // CONVERSION: LogRoung == TrainRound
  //====================================================================
  public static ToTrainRound(logRound: LogRound): TrainRound {
    return {
      extractorStep: {
        textVariations: [
          {
            labelEntities: ModelUtils.ToLabeledEntities(logRound.extractorStep.predictedEntities),
            text: logRound.extractorStep.text
          }
        ]
      },
      scorerSteps: logRound.scorerSteps.map<TrainScorerStep>(logScorerStep => ({
        input: logScorerStep.input,
        labelAction: logScorerStep.predictedAction,
        logicResult: undefined,
        scoredAction: undefined
      }))
    }
  }

  //====================================================================
  // CONVERSION: LogScorerStep == TrainScorerStep
  //====================================================================
  public static ToTrainScorerStep(logScorerStep: LogScorerStep): TrainScorerStep {
    return {
      input: logScorerStep.input,
      labelAction: logScorerStep.predictedAction,
      logicResult: undefined,
      scoredAction: undefined
    }
  }

  //====================================================================
  // CONVERSION: TrainDialog == CreateTeachParams
  //====================================================================
  public static ToCreateTeachParams(trainDialog: TrainDialog): CreateTeachParams {
    let createTeachParams: CreateTeachParams = {
      contextDialog: trainDialog.rounds,
      sourceLogDialogId: trainDialog.sourceLogDialogId
    }

    // TODO: Change to non destructive operation
    // Strip out "entityType" (*sigh*)
    for (let round of createTeachParams.contextDialog) {
      for (let textVariation of round.extractorStep.textVariations) {
        for (let labeledEntity of textVariation.labelEntities) {
          delete (labeledEntity as any).entityType
        }
      }
    }
    return createTeachParams
  }

  //====================================================================
  // CONVERSION: TeachResponse == Teach
  //====================================================================
  public static ToTeach(teachResponse: TeachResponse): Teach {
    return {
      teachId: teachResponse.teachId,
      trainDialogId: teachResponse.trainDialogId,
      createdDatetime: undefined,
      lastQueryDatetime: undefined,
      packageId: undefined
    }
  }

  public static PrebuiltDisplayText(builtinType: string, resolution: any, entityText: string): string {
    if (!builtinType || !resolution) {
      return entityText
    }

    if (['builtin.geography', 'builtin.encyclopedia'].some(prefix => builtinType.startsWith(prefix))) {
      return entityText
    }

    switch (builtinType) {
      case 'builtin.datetimeV2.date':
        let date = resolution.values[0].value
        if (resolution.values[1]) {
          date += ` or ${resolution.values[1].value}`
        }
        return date
      case 'builtin.datetimeV2.time':
        let time = resolution.values[0].value
        if (resolution.values[1]) {
          time += ` or ${resolution.values[1].value}`
        }
        return time
      case 'builtin.datetimeV2.daterange':
        return `${resolution.values[0].start} to ${resolution.values[0].end}`
      case 'builtin.datetimeV2.timerange':
        return `${resolution.values[0].start} to ${resolution.values[0].end}`
      case 'builtin.datetimeV2.datetimerange':
        return `${resolution.values[0].start} to ${resolution.values[0].end}`
      case 'builtin.datetimeV2.duration':
        return `${resolution.values[0].value} seconds`
      case 'builtin.datetimeV2.set':
        return `${resolution.values[0].value}`
      case 'builtin.number':
        return resolution.value
      case 'builtin.ordinal':
        return resolution.value
      case 'builtin.temperature':
        return resolution.value
      case 'builtin.dimension':
        return resolution.value
      case 'builtin.money':
        return resolution.value
      case 'builtin.age':
        return resolution.value
      case 'builtin.percentage':
        return resolution.value
      default:
        return entityText
    }
  }
}
