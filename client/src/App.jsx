import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Interview from "./pages/InterviewPage";
import Result from "./pages/ResultPage";
import LandingPage from './pages/LandingPage';
import InterviewSetup from './pages/InterviewSetup';
import StatisticsPage from './pages/StatisticsPage';
import HistoryPage from './pages/HistoryPage';
import SettingsPage from './pages/SettingsPage'; 
import AdminDashboard from './pages/AdminDashboard';
import ErrorBoundary from './components/ErrorBoundary'; 

function App() {

  return (
     <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
         <Route path="/login" element={<LandingPage />} />
        <Route path="/register" element={<LandingPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/interview/:id" element={<Interview />} />
         <Route path="/interview/setup" element={<InterviewSetup />} /> 
        <Route path="/result/:id" element={<Result />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/statistics" element={<StatisticsPage />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/settings" element={<SettingsPage />} />

      </Routes>

    </BrowserRouter>
     </ErrorBoundary>
  );
}

export default App;