import { useContext } from "react";
import { ExecuteContext } from "../../contexts/execute/executeContextType";

export const useExecute = () => {
	const context = useContext(ExecuteContext);
	if (!context) {
		throw new Error("useExecute must be used within an ExecuteProvider");
	}
	return context;
};
