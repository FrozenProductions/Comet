import { FC } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./pages/landing";

const App: FC = () => {
	return (
		<BrowserRouter>
			<Routes>
				<Route path="/" element={<Landing />} />
				<Route path="*" element={<Landing />} />
			</Routes>
		</BrowserRouter>
	);
};

export default App;
