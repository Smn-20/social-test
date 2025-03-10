export interface IMenuItem {
    icon?: string;
    text: string;
    link: string;
    subMenu?: Array<{
        text: string;
        link: string;
    }>;
}
