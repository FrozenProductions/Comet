import { createContext } from "react";
import { ConnectionContextType } from "../../types/connection";

export const ConnectionContext = createContext<
	ConnectionContextType | undefined
>(undefined);
