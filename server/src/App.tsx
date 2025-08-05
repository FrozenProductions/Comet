import type { FC } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Changelog from "./pages/changelogs";
import Landing from "./pages/Landing";

const App: FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Landing />} />
                <Route path="/changelogs" element={<Changelog />} />
                <Route path="*" element={<Landing />} />
            </Routes>
        </BrowserRouter>
    );
};

export default App;
