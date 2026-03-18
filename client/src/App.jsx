import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Interview from "./pages/InterviewPage";
import Result from "./pages/ResultPage";
import LandingPage from './pages/LandingPage';

function App() {

  return (
    <BrowserRouter>

      <Routes>
        <Route path="/" element={<LandingPage />} />
         <Route path="/login" element={<LandingPage />} />
        <Route path="/register" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview/:id" element={<Interview />} />
        <Route path="/result/:id" element={<Result />} />

      </Routes>

    </BrowserRouter>
  );
}

export default App;