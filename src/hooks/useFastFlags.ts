import { useContext } from "react";
import { FastFlagsContext } from "../contexts/fastFlags/fastFlagsContextType";

export const useFastFlags = () => {
    const context = useContext(FastFlagsContext);
    if (!context) {
        throw new Error("useFastFlags must be used within a FastFlagsProvider");
    }
    return context;
};
