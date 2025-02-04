import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import DashboardNavigation from "./components/DashboardNavigation";
import { SidebarProvider } from "./components/ui/sidebar";
import UploadTransactions from "./pages/UploadTransactions";
import SwishRecipients from "./pages/SwishRecipients";
import Customers from "./pages/Customers";

const Dashboard = () => <h1>Dashboard Home</h1>;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SignedIn>
        <SidebarProvider>
          <DashboardNavigation />
          <div className="w-full min-h-screen">{children}</div>
        </SidebarProvider>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Navbar /> <Home />
            </>
          }
        />

        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/upload-transactions"
          element={
            <ProtectedRoute>
              <UploadTransactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/swish-recipients"
          element={
            <ProtectedRoute>
              <SwishRecipients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/customers"
          element={
            <ProtectedRoute>
              <Customers />
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
