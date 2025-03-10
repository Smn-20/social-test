import { EFileType, EMembershipType, EState } from 'src/app/core/enums';
import { HouseholdDetails } from 'src/app/modules/shared/interfaces/household';

export interface Paginate {
    page?: number;
    size?: number;
}

export interface ResponseObject<T> {
    status: boolean;
    response: T;
    message: string;
}

export const initPaginate = (page = 1, size = 20): Paginate => {
    return {
        page,
        size,
    };
};

export const initHouseholdDetails = (): HouseholdDetails => {
    return {
        householdData: null,
        headNidaData: null,
        membersList: null,
        selectedMemberNidaData: null,
        householdAppeals: null,
        householdLocation: null,
    };
};

export const formatMessage = (message: string): string => {
    return message.split(':')?.length > 1 ? message.split(':')[1] : message;
};

export const base64ToArrayBuffer = (base64: string): Uint8Array => {
    const binaryString = window.atob(base64);
    const binaryLen = binaryString.length;
    const bytes = new Uint8Array(binaryLen);
    for (let i = 0; i < binaryLen; i++) {
        const ascii = binaryString.charCodeAt(i);
        bytes[i] = ascii;
    }
    return bytes;
};

export const saveFile = (fileType: EFileType, reportName: string, byte: any): void => {
    let blob!: Blob;
    switch (fileType) {
        case EFileType.PDF:
            blob = new Blob([byte], { type: 'application/pdf' });
            break;
        case EFileType.CSV:
            blob = new Blob([byte], { type: 'text/csv' });
            break;
        case EFileType.XLSX:
            blob = new Blob([byte], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            break;
        default:
            break;
    }
    const url = window.URL.createObjectURL(blob);
    // window.open(url);

    const a = document.createElement('a');
    a.href = url;
    a.download = reportName; // Set the desired file name
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
};

export const removeSecondCharacter = (inputString: string): string => {
    if (inputString.length >= 2) {
        return inputString.substring(0, 1) + inputString.substring(2);
    } else {
        return inputString;
    }
};

export const getRandomColor = (): string => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const populateMaritalStatus = (option: string): string => {
    switch (option) {
        case 'SINGLE':
            return '1';
        case 'MARIED':
            return '2';

        case 'COHABITATION':
            return '3';

        case 'DIVORCED':
            return '4';

        case 'SEPARATED':
            return '5';

        case 'WIDOW':
        case 'WIDOWER':
        case 'WIDDOWED':
            return '6';
        default:
            return '1';
    }
};

export const getJurisdictionFirstLetter = (option: string): string => {
    switch (option) {
        case 'ADM1':
            return 'P';
        case 'ADM2':
            return 'D';

        case 'ADM3':
            return 'S';

        case 'ADM4':
            return 'C';

        case 'ADM5':
            return 'V';

        default:
            return '';
    }
};

export const populateRelationship = (membership: EMembershipType): string => {
    switch (membership) {
        case EMembershipType.CHILD:
            return '3';
        case EMembershipType.SPOUSE:
            return '2';

        case EMembershipType.ADOPTED_CHILD:
            return '4';

        case EMembershipType.PARENT:
            return '5';

        case EMembershipType.SIBLING:
            return '6';

        case EMembershipType.GRAND_CHILD:
            return '7';
        case EMembershipType.PARENT_IN_LAW:
            return '8';
        case EMembershipType.SIBLING_IN_LAW:
            return '9';
        case EMembershipType.OTHER_RELATIVE:
            return '10';
        case EMembershipType.OTHER_NON_RELATIVE:
            return '11';
        default:
            return '1';
    }
};

export const formatDates = (inputDate: string): string => {
    const parts = inputDate.split('-');
    const dateObj = `${parts[2]}-${parts[1]}-${parts[0]}`;
    return dateObj;
};

export const convertDate = (date: string): string => {
    const [day, month, year] = date.split('/');
    return [year, month, day].join('-');
};

export const convertDate2 = (date: string): string => {
    const _d = new Date(date).toISOString().split('T')[0];
    const [year, month, day] = _d.split('-');
    return [year, month, day].join('-');
};

export const calculateAge = (dateString: string): string => {
    const today = new Date();
    const birthDate = new Date(dateString);

    let age = today.getFullYear() - birthDate.getFullYear();

    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }

    return `${age}`;
};

export const populateHouseholdIds = (householdIds: any[], households: any[]) => {
    const selectedIds: { [key: string]: number } = {};

    for (let i = 0; i < householdIds.length; i++) {
        const index_ = households.findIndex((household) => household.id === householdIds[i]);
        if (index_ >= 0) {
            selectedIds[householdIds[i]] = index_;
        }
    }

    return selectedIds;
};

export const compareObjects = (obj1: { [key: string]: any }, obj2: { [key: string]: any }): boolean => {
    const sortedKeys1 = Object.keys(obj1).sort();
    const sortedKeys2 = Object.keys(obj2).sort();

    if (sortedKeys1.length !== sortedKeys2.length) {
        return false;
    }

    for (let i = 0; i < sortedKeys1.length; i++) {
        const key1 = sortedKeys1[i];
        const key2 = sortedKeys2[i];

        if (key1 !== key2 || obj1[key1] !== obj2[key2]) {
            return false;
        }
    }

    return true;
};

export const removeIndex = (array: any[], index: number): any[] => {
    const newArr = [...array];
    return newArr.filter((el, i) => i !== index);
};

export const compareByStatus = (a: any, b: any): any => {
    const statusOrder = [EState.ACTIVE, EState.INACTIVE, EState.ARCHIVED, EState.DELETED];

    // Get the index of the status in the order
    const statusA = statusOrder.indexOf(a.status);
    const statusB = statusOrder.indexOf(b.status);

    // Compare the statuses based on their order
    return statusA - statusB;
};

export const generateRandomUniqueId = (length: number) => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = ''
    const timestamp = Date.now().toString(36)
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * (`${characters}${timestamp}`).length)
        result += (`${characters}${timestamp}`).charAt(randomIndex)
    }
    return (`${result}`).slice(0, length).toUpperCase()
}

export const setDashaboardLabels = (array: string[], translations: string[]): string[] => {
  return array.map(label => {
    let newLabel = ''
    const _l  = label.split('(', 1);

    const bool = _l?.length > 1;

    const _label = bool ? _l[0]?.toLowerCase().trimEnd() : label.toLowerCase().trimEnd()

    switch (true) {
      case _label === 'male':
        newLabel = translations[5];
      break;
    case _label === 'female':
      newLabel = translations[6];
      break;
    case _label === 'south':
      newLabel = translations[0];
      break;
    case _label === 'north':
      newLabel = translations[1];
      break;
    case _label === 'east':
      newLabel = translations[2];
      break;
    case _label === 'west':
      newLabel = translations[3];
      break;
    case _label === 'kigali city':
      newLabel = translations[4];
      break;
    case _label === 'total':
      newLabel = translations[7];
      break;
    default:
      newLabel = label;
      break;
    }

    return bool ? (
        newLabel + (' (') + _l[1]
    ) : newLabel;
  });
}
