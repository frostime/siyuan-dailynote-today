type TSettingItemType = "checkbox" | "select" | "textinput" | "textarea" | "number" | "slider" | "button" | "hint" | "custom";

interface ISettingItemCore {
    type: TSettingItemType;
    key: string;
    value: any;
    placeholder?: string;
    slider?: {
        min: number;
        max: number;
        step: number;
    };
    options?: { [key: string | number]: string };
    button?: {
        label: string;
        callback: () => void;
    }
}

interface ISettingItem extends ISettingItemCore {
    title: string;
    description: string;
    direction?: "row" | "column";
}
