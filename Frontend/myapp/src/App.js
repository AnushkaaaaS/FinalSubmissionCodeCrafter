import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import Bonds from "./Bonds";
import Insurance from "./Insurance";
import BuyBond from "./BuyBond";
import BuyInsurance from "./BuyInsurance";
import Register from "./Register";
import Recommendations from "./Recommendations";
import ProfitEstimation from "./ProfitEstimation";
import LearningModule from "./LearningModule";

// Protected route component
const ProtectedRoute = ({ children }) => {
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
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Navigate to="/home" />} />
          
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/stocks" 
            element={
              <ProtectedRoute>
                <Stocks />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/portfolio" 
            element={
              <ProtectedRoute>
                <Portfolio />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recommendations" 
            element={
              <ProtectedRoute>
                <StockRecommendations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/buy-stock/:symbol" 
            element={
              <ProtectedRoute>
                <BuyStock />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/sell-stock/:symbol" 
            element={
              <ProtectedRoute>
                <SellStock />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/stock/:symbol" 
            element={
              <ProtectedRoute>
                <StockDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/stocks/compare/:symbol" 
            element={
              <ProtectedRoute>
                <StockCompare />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/bonds" 
            element={
              <ProtectedRoute>
                <Bonds />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/insurance" 
            element={
              <ProtectedRoute>
                <Insurance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/buy-bond/:id" 
            element={
              <ProtectedRoute>
                <BuyBond />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/buy-insurance/:id" 
            element={
              <ProtectedRoute>
                <BuyInsurance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/recommendations" 
            element={
              <ProtectedRoute>
                <Recommendations />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profit-estimation" 
            element={
              <ProtectedRoute>
                <ProfitEstimation />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/learning" 
            element={
              <ProtectedRoute>
                <LearningModule />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
