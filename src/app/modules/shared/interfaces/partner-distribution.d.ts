export interface CreatePartnerDistribution {
    batchId: string;
    programComponentId: string;
    externalPartnerId: string;
    distributionStatus: string;
    distributionType: string;
    numberOfBeneficiaries: number;
}