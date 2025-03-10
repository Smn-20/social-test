import {
    EAction,
    EConditionCategory,
    EDataType,
    EDocumentType,
    EGender,
    EInterviewee,
    EOperations,
    EPermission,
    EReturnGroups,
    EScoreType,
    EState,
    ETargetingStatus,
    EValueOperations,
} from 'src/app/core/enums';
import { ECivilStatus } from '../enums/civil-status.enum';
import { EMembershipType } from '../enums/membership-type.enum';
import { EN, FR, RW } from '../services/translation.service';
import { EDashboard } from '../enums/dashboard';
import { EStorageLocation } from '../enums/storage.enum';

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
    {
        name: 'None',
        value: EDocumentType.NO_IDENTIFICATION,
    },
];

export const gender: any[] = [
    {
        name: 'Male',
        value: EGender.MALE,
    },
    {
        name: 'Female',
        value: EGender.FEMALE,
    },
];

export const dashboardCategories: any[] = [
    {
        name: 'General',
        value: EDashboard.GENERAL,
        // value: 'GENERAL'
    },
    {
        name: 'Dynamic',
        value: EDashboard.DYNAMIC,
        // value: 'DYNAMIC'
    },
];

export const civilStatuses: any[] = [
    {
        name: 'Married',
        value: ECivilStatus.MARRIED,
    },
    {
        name: 'Single',
        value: ECivilStatus.SINGLE,
    },
    {
        name: 'Divorced',
        value: ECivilStatus.DIVORCED,
    },
    {
        name: 'Widow',
        value: ECivilStatus.WIDOW,
    },
    {
        name: 'Cohabitation',
        value: ECivilStatus.COHABITATION,
    },
    {
        name: 'Separated',
        value: ECivilStatus.SEPARATED,
    },
];

export const membershipTypes = [
    {
        name: 'Child',
        value: EMembershipType.CHILD,
    },
    {
        name: 'Spouse',
        value: EMembershipType.SPOUSE,
    },
    {
        name: 'Adopted child',
        value: EMembershipType.ADOPTED_CHILD,
    },
    {
        name: 'Parent',
        value: EMembershipType.PARENT,
    },
    {
        name: 'Sibling',
        value: EMembershipType.SIBLING,
    },
    {
        name: 'Grand child',
        value: EMembershipType.GRAND_CHILD,
    },
    {
        name: 'Parent in law',
        value: EMembershipType.PARENT_IN_LAW,
    },
    {
        name: 'Other relative',
        value: EMembershipType.OTHER_RELATIVE,
    },
    {
        name: 'Other non relative',
        value: EMembershipType.OTHER_NON_RELATIVE,
    },
];

export const requestTypes = [
    {
        name: 'Request for transfer',
        value: 'transfer',
    },
    {
        name: 'Request for Archive',
        value: 'archive',
    },
];

export const reasonsOfHouseholdRemoval: any[] = [
    {
        name: 'Change of household',
        value: 'Change of household',
    },
    {
        name: 'Becomes head of new HH',
        value: 'Becomes head of new HH',
    },
    {
        name: 'Divorce',
        value: 'Divorce',
    },
    {
        name: 'Other',
        value: 'Other',
    },
];

export const statuses: any[] = [
    {
        name: 'Active',
        value: EState.ACTIVE,
    },
    {
        name: 'Inactive',
        value: EState.INACTIVE,
    },
    {
        name: 'Created',
        value: EState.CREATED,
    },
    {
        name: 'Deleted',
        value: EState.DELETED,
    },
    {
        name: 'Archived',
        value: EState.ARCHIVED,
    },
];

export const targetingStatus: any[] = [
    {
        name: 'All',
        value: 'ALL',
    },
    {
        name: 'Pending',
        value: ETargetingStatus.PENDING,
    },
    {
        name: 'Finished',
        value: ETargetingStatus.FINISHED,
    },
    {
        name: 'Not Started',
        value: ETargetingStatus.NOT_STARTED,
    },
    {
        name: 'Running',
        value: ETargetingStatus.RUNNING,
    },
    {
        name: 'Failed',
        value: ETargetingStatus.FAILED,
    },
];

export const searchBy: any[] = [
    {
        name: 'Household head',
        value: 'HEAD',
    },
    {
        name: 'Household member',
        value: 'MEMBER',
    },
];

export const filterBy: any[] = [
    {
        name: 'All',
        value: 'ALL',
    },
    {
        name: 'Active',
        value: 'ACTIVE',
    },
    {
        name: 'Inactive',
        value: 'ACTIVE',
    },
];

export type EPerm = EPermission | null;

export const permissionsMatrixData: EPerm[][] = [
    [
        EPermission.CREATE_HOUSE_HOLD,
        EPermission.DELETE_HOUSE_HOLD,
        EPermission.UPDATE_HOUSE_HOLD,
        EPermission.TRANSFER_HOUSE_HOLD,
        EPermission.ENABLE_HOUSE_HOLD,
        EPermission.DISABLE_HOUSE_HOLD,
        EPermission.VIEW_HOUSE_HOLD,
        EPermission.ARCHIVE_HOUSEHOLD,
        EPermission.DOWNLOAD_HOUSE_HOLD,
    ],
    [EPermission.CREATE_TARGETING, null, null, null, null, null, EPermission.VIEW_TARGETING, null, null],
    [
        EPermission.CREATE_MEMBER,
        EPermission.DELETE_MEMBER,
        EPermission.UPDATE_MEMBER,
        EPermission.TRANSFER_MEMBER,
        EPermission.ENABLE_MEMBER,
        EPermission.DISABLE_MEMBER,
        EPermission.VIEW_MEMBER,
        null,
        null,
    ],
    [
        EPermission.CREATE_QUESTIONNAIRE,
        EPermission.DELETE_QUESTIONNAIRE,
        EPermission.UPDATE_QUESTIONNAIRE,
        EPermission.TRANSFER_QUESTIONNAIRE,
        EPermission.ENABLE_QUESTIONNAIRE,
        EPermission.DISABLE_QUESTIONNAIRE,
        EPermission.VIEW_QUESTIONNAIRE,
        EPermission.ARCHIVE_QUESTIONNAIRE,
        EPermission.DOWNLOAD_QUESTIONNAIRE,
    ],
    [
        EPermission.CREATE_SYSTEM_USER,
        EPermission.DELETE_SYSTEM_USER,
        EPermission.UPDATE_SYSTEM_USER,
        EPermission.TRANSFER_SYSTEM_USER,
        EPermission.ENABLE_SYSTEM_USER,
        EPermission.DISABLE_SYSTEM_USER,
        EPermission.VIEW_SYSTEM_USER,
        null,
        null,
    ],
    [
        EPermission.CREATE_ADMINISTRATIVE_ENTITY,
        EPermission.DELETE_ADMINISTRATIVE_ENTITY,
        EPermission.UPDATE_ADMINISTRATIVE_ENTITY,
        EPermission.TRANSFER_ADMINISTRATIVE_ENTITY,
        EPermission.ENABLE_ADMINISTRATIVE_ENTITY,
        EPermission.DISABLE_ADMINISTRATIVE_ENTITY,
        EPermission.VIEW_ADMINISTRATIVE_ENTITY,
        null,
        null,
    ],
    [null, null, EPermission.UPDATE_APPEAL, null, null, null, EPermission.VIEW_APPEAL, null, null],
    [null, null, EPermission.UPDATE_COEFFICIENT, null, null, null, EPermission.VIEW_COEFFICIENT],
    [EPermission.CREATE_CUTOFF, null, EPermission.UPDATE_CUTOFF, null, null, null, EPermission.VIEW_CUTOFF, null, null],
    [null, null, null, null, null, null, EPermission.VIEW_SCORING, null, null],
    [null, null, EPermission.UPDATE_ANSWERS, null, null, null, EPermission.VIEW_ANSWERS, null, null],
    [
        EPermission.CREATE_INSTITUTION,
        EPermission.DELETE_INSTITUTION,
        EPermission.UPDATE_INSTITUTION,
        null,
        EPermission.ENABLE_INSTITUTION,
        EPermission.DISABLE_INSTITUTION,
        EPermission.VIEW_INSTITUTION,
        null,
        null,
    ],
    [
        EPermission.CREATE_DASHBOARD,
        EPermission.DELETE_DASHBOARD,
        EPermission.UPDATE_DASHBOARD,
        null,
        EPermission.ENABLE_DASHBOARD,
        EPermission.DISABLE_DASHBOARD,
        EPermission.VIEW_DASHBOARD,
        null,
        null,
    ],
    [
        EPermission.CREATE_DASHBOARD_TYPE,
        EPermission.DELETE_DASHBOARD_TYPE,
        null,
        null,
        null,
        null,
        EPermission.VIEW_DASHBOARD_TYPE,
        null,
        null,
    ],
    [
        EPermission.CREATE_DASHBOARD_CATEGORY,
        null,
        EPermission.UPDATE_DASHBOARD_CATEGORY,
        null,
        null,
        null,
        EPermission.VIEW_DASHBOARD_CATEGORY,
        null,
        null,
    ],
    [
        EPermission.CREATE_REPORT,
        null,
        null,
        null,
        null,
        null,
        EPermission.VIEW_REPORT,
        null,
        EPermission.DOWNLOAD_REPORT,
    ],
    [
        EPermission.CREATE_REPORT_TYPE,
        null,
        EPermission.UPDATE_REPORT_TYPE,
        null,
        EPermission.ENABLE_REPORT_TYPE,
        EPermission.DISABLE_REPORT_TYPE,
        EPermission.VIEW_REPORT_TYPE,
        null,
        null,
    ],
    [
        EPermission.CREATE_ROLE,
        EPermission.DELETE_ROLE,
        EPermission.UPDATE_ROLE,
        null,
        EPermission.ENABLE_ROLE,
        EPermission.DISABLE_ROLE,
        EPermission.VIEW_ROLE,
        null,
        null,
    ],
    [null, null, null, null, null, null, EPermission.VIEW_PERMISSION, null, null],
    [null, null, EPermission.UPDATE_TRANSLATION, null, null, null, EPermission.VIEW_TRANSLATION, null, null],
];

export const permissionTitles = [
    'House Hold',
    'Targeting',
    'Member',
    'Questionnaire',
    'System User',
    'Administrative Entity',
    'Appeal',
    'Coefficient',
    'Cutoff',
    'Scoring',
    'Answers',
    'Institutions Management',
    'Dashboard',
    'Dashboard Type',
    'Dashboard Category',
    'Report',
    'Report Type',
    'Role',
    'Permission',
    'Translation',
];

export const interviewees: Array<{
    name: string, value: EInterviewee
}> = [
    {
        name: 'Household questionnaire',
        value: EInterviewee.HOUSEHOLD,
    },
    {
        name: 'Member questionnaire',
        value: EInterviewee.PERSON,
    },
];

export const interviewees2: Array<{
    name: string, value: EInterviewee | string
}> = [
    {
        name: 'Household head',
        value: EInterviewee.HOUSEHOLD,
    },
    {
        name: 'Household member',
        value: EInterviewee.PERSON,
    },
    {
        name: 'Both',
        value: 'BOTH',
    },
    {
        name: 'Any',
        value: 'ANY',
    },
];

export const scoreTypes: Array<{
    name: string, value: EScoreType
}> = [
    {
        name: 'Percentage',
        value: EScoreType.PERCENTAGE,
    },
    {
        name: 'Number',
        value: EScoreType.NUMBER,
    },
];

export const dataTypes: Array<{
    name: string, value: EDataType
}> = [
    {
        name: 'Greater',
        value: EDataType.GREATER,
    },
    {
        name: 'Less',
        value: EDataType.LESS,
    },
    {
        name: 'Range',
        value: EDataType.RANGE,
    },
    {
        name: 'Equal',
        value: EDataType.EQUAL,
    },
    {
        name: 'Greater than or equal',
        value: EDataType.GREATER_THAN_OR_EQUAL,
    },
    {
        name: 'Less than or equal',
        value: EDataType.LESS_THAN_OR_EQUAL,
    },
];

export const operationsType: Array<{
    name: string, value: EOperations
}> = [
    {
        name: 'Equal',
        value: EOperations.EQUAL,
    },
    {
        name: 'Not equal',
        value: EOperations.NOT_EQUAL,
    },
    {
        name: 'Greater than',
        value: EOperations.GREATER_THAN,
    },
    {
        name: 'Greater than or equal',
        value: EOperations.GREATER_THAN_OR_EQUAL,
    },
    {
        name: 'Less than',
        value: EOperations.LESS_THAN,
    },
    {
        name: 'Less than or equal',
        value: EOperations.LESS_THAN_OR_EQUAL,
    },
    {
        name: 'In',
        value: EOperations.IN,
    },
];

export const statusesArchives: Array<{
    name: string, value: EAction
}> = [
    {
        name: 'Pending',
        value: EAction.ARCHIVE_REQUESTED,
    },
    {
        name: 'Approved',
        value: EAction.ARCHIVE_APPROVED,
    },
    {
        name: 'Cancelled',
        value: EAction.ARCHIVE_DENIED,
    },
];

export const statusesTransfers: Array<{
    name: string, value: EAction
}> = [
    {
        name: 'Pending',
        value: EAction.TRANSFER_REQUESTED,
    },
    {
        name: 'Approved',
        value: EAction.TRANSFER_APPROVED,
    },
    {
        name: 'Cancelled',
        value: EAction.TRANSFER_DENIED,
    },
];

export interface INav {
    name: string;
    link: string;
    icon: string;
    current: boolean;
    children?: any;
    haveCounter?: boolean;
    permissions?: EPermission[];
    isNew?: boolean;
}

export const navigation: INav[] = [
    {
        name: 'Dashboard',
        link: '/admin/dashboard',
        icon: 'grid',
        current: false,
        permissions: [EPermission.VIEW_DASHBOARD],
    },
    {
        name: 'Households',
        link: '',
        icon: 'home',
        current: false,
        permissions: [EPermission.VIEW_HOUSE_HOLD],
        children: [
            {
                name: 'Households',
                link: '/admin/households',
                default: true,
                permissions: [EPermission.VIEW_HOUSE_HOLD],
                current: false,
            },
            // {
            //     name: 'Self Registered',
            //     link: '/admin/households/self-registered',
            //     default: false,
            //     permissions: [EPermission.VIEW_HOUSE_HOLD],
            //     current: false,
            // },
            {
              name: 'Migration',
              link: '/admin/households/migration',
              default: false,
              permissions: [EPermission.VIEW_HOUSE_HOLD],
              current: false,
              isNew: true
           }
        ]
    },
    {
        name: 'Targeting',
        link: '',
        icon: 'bar-chart',
        current: false,
        permissions: [EPermission.VIEW_TARGETING, EPermission.VIEW_CUTOFF],
        children: [
            {
                name: 'Cut Offs',
                link: '/admin/targeting/cut-offs',
                default: true,
                permissions: [EPermission.VIEW_CUTOFF],
                current: false,
            },
            {
                name: 'Programs',
                link: '/admin/targeting/programs',
                default: false,
                permissions: [EPermission.VIEW_TARGETING],
                current: false,
            },
            {
                name: 'ISPMIS',
                link: '/admin/households/ispmis-programs',
                default: false,
                permissions: [EPermission.VIEW_TARGETING],
                current: false,
            },
            // {
            //     name: 'Revamped Programs',
            //     link: '/admin/revamped-targeting/revamped-programs',
            //     default: false,
            //     permissions: [EPermission.VIEW_TARGETING],
            //     current: false,
            // },
            // {
            //     name: 'Distributions',
            //     link: '/admin/revamped-targeting/partner-distributions',
            //     default: false,
            //     permissions: [EPermission.VIEW_TARGETING],
            //     current: false,
            //     isNew: true
            // },
        ],
    },
    {
        name: 'Reports',
        link: '/admin/reports',
        icon: 'file-text',
        current: false,
        permissions: [EPermission.VIEW_REPORT],
    },
    {
        name: 'Access Control',
        link: '/admin/users',
        icon: 'users',
        current: false,
        permissions: [EPermission.VIEW_SYSTEM_USER, EPermission.VIEW_ROLE, EPermission.VIEW_PERMISSION],
        children: [
            {
                name: 'Users',
                link: '/admin/users',
                icon: 'users',
                default: true,
                permissions: [EPermission.VIEW_SYSTEM_USER],
            },
            {
                name: 'Roles',
                link: '/admin/roles',
                icon: 'key',
                default: false,
                permissions: [EPermission.VIEW_ROLE],
            },
            {
                name: 'Permissions',
                link: '/admin/permissions',
                icon: 'check-square',
                default: false,
                permissions: [EPermission.VIEW_PERMISSION],
            },
        ],
    },
    {
        name: 'Questionnaires',
        link: '/admin/questionnaires',
        icon: 'layers',
        current: false,
        permissions: [EPermission.VIEW_QUESTIONNAIRE],
        children: [
            {
                name: 'Questionnaires',
                link: '/admin/questionnaires/qs',
                default: true,
                permissions: [EPermission.VIEW_QUESTIONNAIRE],
            },
            {
                name: 'Surveys',
                link: '/admin/questionnaires/surveys',
                default: false,
                permissions: [EPermission.VIEW_QUESTIONNAIRE],
            },
        ],
    },
    {
        name: 'Appeals',
        link: '/admin/appeals/submitted',
        icon: 'folder-minus',
        current: false,
        haveCounter: true,
        permissions: [EPermission.VIEW_APPEAL, EPermission.UPDATE_APPEAL],
        children: [
            {
                name: 'Pending',
                link: '/admin/appeals/submitted',
                default: true,
                haveCounter: true,
                permissions: [EPermission.VIEW_APPEAL, EPermission.UPDATE_APPEAL],
            },
            {
                name: 'Approved',
                link: '/admin/appeals/approved',
                default: false,
                permissions: [EPermission.VIEW_APPEAL, EPermission.UPDATE_APPEAL],
            },
            {
                name: 'Cancelled',
                link: '/admin/appeals/cancelled',
                default: false,
                permissions: [EPermission.VIEW_APPEAL, EPermission.UPDATE_APPEAL],
            },
        ],
    },
    {
        name: 'Requests',
        link: '/admin/requests/transfers',
        icon: 'help-circle',
        current: false,
        haveCounter: true,
        permissions: [EPermission.TRANSFER_HOUSE_HOLD, EPermission.DISABLE_HOUSE_HOLD],
        children: [
            {
                name: 'Transfers',
                link: '/admin/requests/transfers',
                default: true,
                haveCounter: true,
                permissions: [EPermission.TRANSFER_HOUSE_HOLD],
            },
            {
                name: 'Archives',
                link: '/admin/requests/archives',
                default: false,
                haveCounter: true,
                permissions: [EPermission.DISABLE_HOUSE_HOLD],
            },
        ],
    },
    {
        name: 'Translations',
        link: '/admin/translations',
        icon: 'book-open',
        current: false,
        permissions: [EPermission.CREATE_QUESTIONNAIRE],
        haveCounter: true,
    },
    {
        name: 'Institutions',
        link: '/admin/institutions',
        icon: 'briefcase',
        current: false,
        permissions: [EPermission.VIEW_INSTITUTION],
    },
    {
        name: 'Settings',
        link: '/admin/settings',
        icon: 'settings',
        current: false,
        haveCounter: true,
        permissions: [
            EPermission.VIEW_DASHBOARD_TYPE,
            EPermission.VIEW_DASHBOARD_CATEGORY,
            EPermission.VIEW_REPORT_TYPE,
        ],
        children: [
            {
                name: 'Dashboard types',
                link: '/admin/settings/dashboard-types',
                default: true,
                haveCounter: true,
                permissions: [EPermission.VIEW_ADMINISTRATIVE_ENTITY, EPermission.VIEW_DASHBOARD_TYPE],
            },
            {
                name: 'Dashboard Categories',
                link: '/admin/settings/dashboard-categories',
                default: true,
                haveCounter: true,
                permissions: [EPermission.VIEW_ADMINISTRATIVE_ENTITY, EPermission.VIEW_DASHBOARD_CATEGORY],
            },
            {
                name: 'Report types',
                link: '/admin/settings/report-types',
                default: false,
                haveCounter: true,
                permissions: [EPermission.VIEW_ADMINISTRATIVE_ENTITY, EPermission.VIEW_REPORT_TYPE],
            },
        ],
    },
];

export const answersDev = {
    Q1_17: '12',
    livestocks: {
        chicken: {
            numberOfLivestocks: '4',
            income: '0',
            otherReason: '0',
            disease: '0',
            stolen: '0',
            ownership: '1',
            slaughtered: '0',
        },
        other: { income: '0', otherReason: '0', disease: '0', stolen: '0', ownership: '2', slaughtered: '0' },
        rabbit: { income: '0', otherReason: '0', disease: '0', stolen: '0', ownership: '2', slaughtered: '0' },
        cow: {
            numberOfLivestocks: '3',
            income: '0',
            otherReason: '0',
            disease: '0',
            stolen: '0',
            ownership: '1',
            slaughtered: '0',
        },
        goat: { income: '0', otherReason: '0', disease: '0', stolen: '0', ownership: '2', slaughtered: '0' },
        sheep: { income: '0', otherReason: '0', disease: '0', stolen: '0', ownership: '2', slaughtered: '0' },
        pig: { income: '0', otherReason: '0', disease: '0', stolen: '0', ownership: '2', slaughtered: '0' },
    },
    Q1_16: '3',
    Q1_19: '11',
    Q2_28_1: ['2', '3'],
    Q2_28_2_1: ['3', '2'],
    Q1_15: '1',
    Q2_28_3_1: ['3', '2'],
    Q2_3: '1',
    Q4_1: '1',
    Q2_31: ['1'],
    Q2_12: '1',
    Q2_34: '2',
    Q3_4: '1',
    Q6_1: ['1', '2'],
    Q2_4: '1',
    Q2_33: '1',
    Q4_2: '2',
    Q5_1: '2',
    pageNo: 5,
    Q1_8: '1199980044907161',
    Q2_7: '4',
    Q3_6: '6',
    Q6_3: '4',
    Q7_2: ['14'],
    Q2_6: '7',
    Q3_5: '5',
    Q4_4: '3',
    Q6_2: ['2', '1'],
    Q7_1: '2',
    Q2_9: '2',
    Q1_9: '2',
    Q2_8: '4',
    Q3_7: '3',
    Q7_3: ['3', '2'],
    materialOwnership: {
        bed: { ownershipType: '1', number: '4' },
        wheelbarrow: { ownershipType: '2' },
        mattress: { ownershipType: '1', number: '4' },
        bicycle: { ownershipType: '2' },
        television: { ownershipType: '1', number: '1' },
        truck: { ownershipType: '2' },
        telephone: { ownershipType: '1', number: '3' },
        sittingChairs: { ownershipType: '1', number: '6' },
        boat: { ownershipType: '2' },
        radio: { ownershipType: '1', number: '1' },
        motorcycle: { ownershipType: '2' },
        computer: { ownershipType: '1', number: '2' },
        car: { ownershipType: '1', number: '2' },
        stove: { ownershipType: '2' },
        mosquitoNet: { ownershipType: '1', number: '4' },
        refrigerator: { ownershipType: '1', number: '1' },
        hoe: { ownershipType: '1', number: '2' },
    },
    Q2_17: '3',
    Q2_14: '1',
    Q2_36: '1',
    Q2_13: '1',
    Q2_35: '1',
    Q2_16: '2',
    Q2_15: ['3', '2'],
    quality: {
        subsidisedAccessToHealth: { haveYouBenefited: '3' },
        fargDs: { haveYouBenefited: '1', howOften: '3', numberOfTimes: '2' },
        rdrcDs: { haveYouBenefited: '3' },
        otherBenefits: { haveYouBenefited: '3' },
        vupMpg: { haveYouBenefited: '3' },
        educationSupport: { haveYouBenefited: '3' },
        vupDs: { haveYouBenefited: '1', howOften: '2', numberOfTimes: '1' },
        vupFinancialService: { haveYouBenefited: '3' },
        relativesAndNeighbors: { haveYouBenefited: '3' },
        subsidiesOnSeeds: { haveYouBenefited: '3' },
        vupCpw: { haveYouBenefited: '3' },
        otherPwPrograms: { haveYouBenefited: '3' },
        vupEpw: { haveYouBenefited: '3' },
        governmentDonations: { haveYouBenefited: '1', howOften: '5', numberOfTimes: '1' },
        skillsTraining: { haveYouBenefited: '3' },
        foodRelief: { haveYouBenefited: '3' },
        allowanceForDismissal: { haveYouBenefited: '1', howOften: '1', numberOfTimes: '1' },
    },
    Q3_12: '2',
    Q3_10: '2',
};

export const langulages: Array<{
    value: string
}> = [
    {
        value: EN,
    },
    {
        value: FR,
    },
    {
        value: RW,
    },
];

export const ispmisPrograms: Array<{
    name: string, value: string
}> = [
    {
        name: 'Funding district',
        value: 'FUNDING DISTRICT',
    },
    {
        name: 'RDRC',
        value: 'RDRC',
    },
    {
        name: 'FARG',
        value: 'FARG',
    },
    {
        name: 'LODA',
        value: 'LODA',
    },
];

export const conditionQuantifierCategories: Array<{ name: string, value: string }> = [
    {
        name: 'Age',
        value: EConditionCategory.AGE,
    },
    {
        name: 'Disability Level',
        value: EConditionCategory.DISABILITY_LEVEL,
    },
    {
        name: 'Education Level',
        value: EConditionCategory.EDUCATION_LEVEL,
    },
    {
        name: 'Gender',
        value: EConditionCategory.GENDER,
    },
    {
        name: 'Working Elibility',
        value: EConditionCategory.WORKING_ELIBILITY,
    },
];

export const programReturnals: Array<{ name: string, value: string }> = [
    {
        name: 'Households',
        value: EReturnGroups.HOUSEHOLDS,
    },
    {
        name: 'Household Heads',
        value: EReturnGroups.HOUSEHOLD_HEADS,
    },
    {
        name: 'Household Members',
        value: EReturnGroups.HOUSEHOLD_MEMBERS,
    },
];

export const revampedOperationsType: Array<{
    name: string, value: EOperations | EValueOperations
}> = [
    {
        value: EValueOperations.ALL,
        name: 'All'
    },
    ...operationsType,
    {
        value: EValueOperations.NOT_IN,
        name: 'Not In'
    },
    {
        value: EValueOperations.IN_RANGE,
        name: 'In Range'
    },
    {
        value: EValueOperations.NOT_IN_RANGE,
        name: 'Not In Range'
    }
];

export const storageLocation: Array<{ name: string, value: EStorageLocation }> = [
  {
      name: 'SR-IS',
      value: EStorageLocation.SRIS,
  },
  {
    name: 'MEIS',
    value: EStorageLocation.MIS,
  },
];
