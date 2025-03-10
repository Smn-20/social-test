import {
    EValueOperations,
    EConditionMeets,
    ECriteriaApplicationGroup,
    EReturnGroups,
    EConditionInputType,
    EConditionQuestionType,
    EInterviewee
} from '../enums';

export interface ITwoSidedConditionValue {
    operation: EValueOperations
    number_value_one: number
    number_value_two: number
}

export interface IOneSidedConditionValue {
    operation: EValueOperations
    value: number | string | boolean | Array<string>
}

export interface IConditionCategory {
    inputType: EConditionInputType
    questionType: EConditionQuestionType
    respondentType: EInterviewee
}

export interface IConditionValue {
    condition_id: string,
    question_category: string,
    question: string,
    condition_value: ITwoSidedConditionValue | IOneSidedConditionValue,
    condition_category: IConditionCategory,
    value: ITwoSidedConditionValue | IOneSidedConditionValue | 'ALL'
}

export interface ICriteria {
    criteria_id: string,
    criteria_statement: string,
    applies_to: ECriteriaApplicationGroup,
    must_meet: EConditionMeets,
    conditions: Array<IConditionValue>
}

export interface ITargetGroupPayload {
    program_returns: EReturnGroups,
    program_name: string,
    cutoff_group: string,
    included_programs: Array<string>,
    excluded_programs: Array<string>,
    institution: string,
    criterias: Array<ICriteria>
}

export interface IMasterProgramCreationPayload {
    programName: string,
    programDescription: string
}
