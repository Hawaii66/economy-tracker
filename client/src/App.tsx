import { RedirectToSignIn, SignedIn, SignedOut } from "@clerk/clerk-react";
import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import DashboardNavigation from "./components/DashboardNavigation";
import { SidebarProvider } from "./components/ui/sidebar";

const Dashboard = () => <h1>Dashboard Home</h1>;
const PageOne = () => <h1>Dashboard - Page One</h1>;
const PageTwo = () => <h1>Dashboard - Page Two</h1>;

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <SignedIn>
        <SidebarProvider>
          <DashboardNavigation />
          {children}
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
          path="/dashboard/page-one"
          element={
            <ProtectedRoute>
              <PageOne />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/page-two"
          element={
            <ProtectedRoute>
              <PageTwo />
            </ProtectedRoute>
          }
        />

        {/* Redirect unknown paths */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
