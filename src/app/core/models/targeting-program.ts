import { EOperations } from '../enums/operations.enum';

export interface ITargetProgram {
    programName: string;
    cutOffId: string;
    criteria: ItargetingCriteria[];
}

export interface ItargetingCriteria {
    questionnaireId: string;
    criteria: string;
    operation: EOperations;
    value: string;
    values: string[];
}

export default interface ITargetGroup {
    name: string;
    categories: any[];
    matchAllCategories: boolean;
    matchAllMembers: boolean;
    operation: string;
    numberOfMembers: number;
}
