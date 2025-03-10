import { EBeneficiaryHelpStatus, EDocumentType, EJurisdiction } from '../core/enums';

export const TOKEN_NAME = 'access_token';
export const USER = 'user';

export const permTypes = [
    {
        name: 'Create',
        value: 'CREATE',
    },
    {
        name: 'Delete',
        value: 'DELETE',
    },
    {
        name: 'Update',
        value: 'UPDATE',
    },
    {
        name: 'Transfer',
        value: 'TRANSFER',
    },
    {
        name: 'Enable',
        value: 'ENABLE',
    },
    {
        name: 'Disable',
        value: 'DISABLE',
    },
    {
        name: 'View',
        value: 'VIEW',
    },
    {
        name: 'Archive',
        value: 'ARCHIVE',
    },
    {
        name: 'Download',
        value: 'DOWNLOAD',
    },
];

export const docTypes: any[] = [
    {
        name: 'National ID',
        value: EDocumentType.NATIONAL_ID,
    },
    {
        name: 'Child ID',
        value: EDocumentType.CHILD_ID,
    },
    {
        name: 'NIN',
        value: EDocumentType.NIN,
    },
];

export const jurOptions: any[] = [
    {
        name: 'National',
        value: EJurisdiction.NATIONAL,
    },
    {
        name: 'Province',
        value: EJurisdiction.PROVINCE,
    },
    {
        name: 'District',
        value: EJurisdiction.DISTRICT,
    },
    {
        name: 'Sector',
        value: EJurisdiction.SECTOR,
    },
    {
        name: 'Cell',
        value: EJurisdiction.CELL,
    },
    {
        name: 'Village',
        value: EJurisdiction.VILLAGE,
    },
];

export const beneficiaryHelpStatus: Array<{
    name: string, value: EBeneficiaryHelpStatus
}> = [
    {
        name: 'Not Helped',
        value: EBeneficiaryHelpStatus.NOT_HELPED,
    },
    {
        name: 'Helped',
        value: EBeneficiaryHelpStatus.HELPED,
    },
    {
        name: 'Mixed',
        value: EBeneficiaryHelpStatus.MIXED,
    },
];