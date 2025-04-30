import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminStudents from "./pages/admin/Students";
import AdminCoordinators from "./pages/admin/Coordinators";
import AdminMentors from "./pages/admin/Mentors";
import CoordinatorDashboard from "./pages/coordinator/Dashboard";
import CoordinatorMentors from "./pages/coordinator/Mentors";
import CoordinatorStudents from "./pages/coordinator/Students";
import MentorDashboard from "./pages/mentor/Dashboard";
import MentorStudents from "./pages/mentor/Students";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            
            {/* Admin Routes */}
            <Route 
              path="/admin" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/students" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminStudents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/coordinators" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminCoordinators />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/mentors" 
              element={
                <ProtectedRoute allowedRoles={["admin"]}>
                  <AdminMentors />
                </ProtectedRoute>
              } 
            />
            
            {/* Coordinator Routes */}
            <Route 
              path="/coordinator" 
              element={
                <ProtectedRoute allowedRoles={["coordinator"]}>
                  <CoordinatorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/coordinator/mentors" 
              element={
                <ProtectedRoute allowedRoles={["coordinator"]}>
                  <CoordinatorMentors />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/coordinator/students" 
              element={
                <ProtectedRoute allowedRoles={["coordinator"]}>
                  <CoordinatorStudents />
                </ProtectedRoute>
              } 
            />
            
            {/* Mentor Routes */}
            <Route 
              path="/mentor" 
              element={
                <ProtectedRoute allowedRoles={["mentor"]}>
                  <MentorDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/mentor/students" 
              element={
                <ProtectedRoute allowedRoles={["mentor"]}>
                  <MentorStudents />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
