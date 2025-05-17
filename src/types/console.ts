export interface ConsoleContextType {
    isFloating: boolean;
    setIsFloating: (isFloating: boolean) => void;
}

export interface ConsoleState {
    isFloating: boolean;
    size?: ConsoleSize;
    position?: {
        x: number;
        y: number;
    };
}

export interface ConsoleSize {
    width: number;
    height: number;
}
