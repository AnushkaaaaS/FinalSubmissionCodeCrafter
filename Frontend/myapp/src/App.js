import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./AuthContext";
import Login from "./Login";
import Home from "./Home";
import Stocks from "./Stocks";
import Portfolio from "./Portfolio";
import BuyStock from "./BuyStock";
import SellStock from "./SellStock";
import StockDetails from "./StockDetails";
import StockCompare from "./StockCompare";
import StockRecommendations from "./StockRecommendations";
import StockPrediction from "./StockPrediction";
import Bonds from "./Bonds";
import Insurance from "./Insurance";
import BuyBond from "./BuyBond";
import BuyInsurance from "./BuyInsurance";
import Register from "./Register";
import Recommendations from "./Recommendations";
import ProfitEstimation from "./ProfitEstimation";
import LearningModule from "./LearningModule";
import Navbar from './components/Navbar';
import AutoTrading from './AutoTrading';
import GeminiInsights from './pages/GeminiInsights';
import './App.css';

// Protected route component
const ProtectedRouteComponent = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

// Main app content component
const AppContent = () => {
  const location = useLocation();
  const noNavbarRoutes = ['/login', '/register'];
  const showNavbar = !noNavbarRoutes.includes(location.pathname);

  return (
    <div className="app">
      {showNavbar && <Navbar />}
      <main className="main-content">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/home" />} />
          
          <Route 
            path="/home" 
            element={
              <ProtectedRouteComponent>
                <Home />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/stocks" 
            element={
              <ProtectedRouteComponent>
                <Stocks />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/portfolio" 
            element={
              <ProtectedRouteComponent>
                <Portfolio />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/recommendations" 
            element={
              <ProtectedRouteComponent>
                <StockRecommendations />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/buy/:symbol" 
            element={
              <ProtectedRouteComponent>
                <BuyStock />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/buy-stock/:symbol" 
            element={
              <ProtectedRouteComponent>
                <BuyStock />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/sell-stock/:symbol" 
            element={
              <ProtectedRouteComponent>
                <SellStock />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/stock/:symbol" 
            element={
              <ProtectedRouteComponent>
                <StockDetails />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/prediction/:symbol" 
            element={
              <ProtectedRouteComponent>
                <StockPrediction />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/stocks/compare/:symbol" 
            element={
              <ProtectedRouteComponent>
                <StockCompare />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/bonds" 
            element={
              <ProtectedRouteComponent>
                <Bonds />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/insurance" 
            element={
              <ProtectedRouteComponent>
                <Insurance />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/buy-bond/:id" 
            element={
              <ProtectedRouteComponent>
                <BuyBond />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/buy-insurance/:id" 
            element={
              <ProtectedRouteComponent>
                <BuyInsurance />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/profit-estimation" 
            element={
              <ProtectedRouteComponent>
                <ProfitEstimation />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/learning" 
            element={
              <ProtectedRouteComponent>
                <LearningModule />
              </ProtectedRouteComponent>
            } 
          />
          <Route 
            path="/auto-trading" 
            element={
              <ProtectedRouteComponent>
                <AutoTrading />
              </ProtectedRouteComponent>
            } 
          />
          <Route path="/gemini-insights" element={<GeminiInsights />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
