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
import Layout from './components/Layout';
import './responsive.css';


function App() {

  return (
     <ErrorBoundary>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
         <Route path="/login" element={<LandingPage />} />
        <Route path="/register" element={<LandingPage />} />
         <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/interview/:id" element={<Layout><Interview /></Layout>} />
          <Route path="/interview/setup" element={<Layout><InterviewSetup /></Layout>} />
          <Route path="/result/:id" element={<Layout><Result /></Layout>} />
          <Route path="/statistics" element={<Layout><StatisticsPage /></Layout>} />
          <Route path="/history" element={<Layout><HistoryPage /></Layout>} />
          <Route path="/admin" element={<AdminDashboard />}/>
          <Route path="/settings" element={<Layout><SettingsPage /></Layout>} />

      </Routes>

    </BrowserRouter>
     </ErrorBoundary>
  );
}

export default App;