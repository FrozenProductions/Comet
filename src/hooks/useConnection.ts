import { useContext } from "react";
import { ConnectionContext } from "../contexts/connection/connectionContextType";

export const useConnection = () => {
    const context = useContext(ConnectionContext);
    if (!context) {
        throw new Error(
            "useConnection must be used within a ConnectionProvider"
        );
    }
    return context;
};
