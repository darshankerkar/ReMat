import { type JSX } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "./useAuth";

type ProtectedRouteProps = {
  children: JSX.Element;
  role?: "user" | "admin";
};

const ProtectedRoute = ({ children, role }: ProtectedRouteProps) => {
  const { user, profile, loading } = useAuth();

  // Updated loading component matching your project's green theme

    if (loading) {
      document.body.style.backgroundColor = "black";
      return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
          {/* Animated background gradient - Green theme */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-600/10 animate-pulse"></div>
          
          {/* Floating particles effect - Green theme */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
            <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '5s', animationDelay: '1s' }}></div>
            <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-green-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
          </div>

          {/* Main loading card */}
          <div className="relative z-10 text-center">
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-12 shadow-2xl">
              {/* Animated recycling bin icon */}
              <div className="relative mx-auto mb-8">
                {/* Outer ring */}
                <div className="w-32 h-32 mx-auto relative">
                  <div className="absolute inset-0 border-4 border-white/20 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-green-400 border-r-emerald-500 rounded-full animate-spin"></div>
                  
                  {/* Inner rotating ring - counter rotation */}
                  <div className="absolute inset-4 border-4 border-white/10 rounded-full"></div>
                  <div className="absolute inset-4 border-4 border-transparent border-b-green-500 border-l-emerald-400 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                  
                  {/* Center icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Loading text */}
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-white">
                  Loading E-Waste System
                </h2>
                <p className="text-white/60 font-medium">
                  Authenticating and preparing your dashboard...
                </p>
                
                {/* Animated dots - Green theme */}
                <div className="flex items-center justify-center gap-2 pt-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>

            {/* Optional: Brand or system name */}
            <div className="mt-8 text-white/40 text-sm font-medium">
              Powered by Smart Recycling Technology
            </div>
          </div>
        </div>
      );
    }

  if(!user) {
    return <Navigate to="/auth/login" replace />
  }

  if (role && !profile) return <div>Loading...</div>;
  
  if (role && profile?.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
