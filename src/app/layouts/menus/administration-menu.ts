import { IMenuItem } from 'src/app/modules/shared/interfaces/menu-item';

export const administrationMenu: IMenuItem[] = [
    {
        text: 'Users',
        link: 'administration/users',
    },
    {
        text: 'Roles',
        link: 'administration/roles',
    },
    {
        text: 'Permissions',
        link: 'administration/permissions',
    },
];
