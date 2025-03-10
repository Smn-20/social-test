import { ECivilStatus, EDocumentType, EMembershipType } from 'src/app/core/enums';

export interface HeadObject {
    id: string;
    firstName: string;
    lastName: string;
    phoneNumber: string;
    documentNumber: string;
    identificationType: string;
    dateOfBirth: string;
    gender: string;
    maritalStatus: string;
    civilStatus: string;
    membershipType: string;
    memberCode?: string;
}

interface LocationObject {
    villageName: string;
    cellName: string;
    sectorName: string;
    districtName: string;
    provinceName: string;
}

export interface HouseholdObject {
    id?: string;
    code: string;
    lodaCode: string;
    size: number;
    score: number;
    targetingProgram: string;
    scoringStatus: string;
    targetingStatus: string;
    ubudeheCategory: string;
    head: HeadObject;
    villageId: string;
    targetingPriority: string;
    status: string;
    changeStatusReason: string;
    targetGroup: string;
}

export interface HouseholdDetails {
    householdData: HouseholdObject | null;
    headNidaData: any;
    membersList: any;
    selectedMemberNidaData: any;
    householdAppeals: any;
    householdLocation: LocationObject | null;
}

export interface CreateHousehold {
    villageCode: string;
    headDocumentNumber: string;
    enumeratorId: string;
    upi?: string;
    longitude: string;
    latitude: string;
}

export interface HouseholdMemberObject {
    id: string;
    firstName: string;
    lastName: string;
    documentNumber: string;
    identificationType: EDocumentType;
    dateOfBirth: string | Date;
    gender: string;
    maritalStatus: ECivilStatus;
    membershipType: EMembershipType;
    memberCode?: string;
    civilStatus?: ECivilStatus;
}

interface HouseholdMovment {
    householdId: string;
    villageCode: string;
    householdMovementId: string;
    event: string;
    description: string;
    reason: string;
    upi: string;
    longitude: string;
    latitude: string;
    enumeratorId: string;
    memberDocumentNumber: string;
    phoneNumber: string;
    userType: string;
}
