export type SelectOption = {
    value: string;
    label: string;
};

export type SelectProps = {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    className?: string;
};
