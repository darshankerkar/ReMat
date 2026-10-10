import { createBrowserRouter } from "react-router-dom";
import { Navigate } from "react-router-dom";

import ProtectedRoute from "../auth/ProtectedRoutes";

import AdminLayout from "../layouts/AdminLayout";
import UserLayout from "../layouts/UserLayout";

import Login from "../pages/auth/Login";
import Signup from "../pages/auth/Signup";

import UserDashboard from "../pages/user/UserDashboard";
import UserProfile from "../pages/user/UserProfile";
import UserRecycle from "../pages/user/UserRecycle";
import UserChat from "../pages/user/UserChat";
import UserTransactions from "../pages/user/UserTransactions";
import UserLeaderboard from "../pages/user/UserLeaderboard";


import AdminDashboard from "../pages/admin/AdminDashboard";
import AddBin from "../pages/admin/bins/AddBin";
import ViewBins from "../pages/admin/bins/ViewBins";

import Unauthorized from "../pages/Unauthorized";
import ThankYouPage from "../pages/ThankYou";

import RoleRedirect from "./RoleRedirect";
import BinDetails from "../pages/admin/bins/BinDetails";
import PickupRoute from "../pages/admin/bins/PickupRoute";
import BinScreen from "../pages/bin/BinScreen";
import Analytics from "../pages/admin/analytics/Analytics";
import UserPickups from "../pages/user/UserPickupRequest";
import AdminPickups from "../pages/admin/ViewRequests";
import AdminPickupDetail from "../pages/admin/AdminPickupDetail";
import PickupDetails from "../pages/user/UserPickupDetails";



export const router = createBrowserRouter([
    {
        path: "/",
        element: <Login />
    },
    {
        path: "/auth/login",
        element: <Login />
    },
    {
        path: "/auth/signup",
        element: <Signup />
    },
    {
        path: "/",
        element: (
            <ProtectedRoute>
                <RoleRedirect />
            </ProtectedRoute>
        )
    },
    {
        path: "/unauthorized",
        element: <Unauthorized />

    },
    {
        path: "/bin/:binId",
        element: <BinScreen />
    },
    {
        path: "/user",
        element: (
            <ProtectedRoute role="user">
                <UserLayout />
            </ProtectedRoute>
        ),
        children: [
            {path:"dashboard", element: <UserDashboard />},
            { index: true, element: <Navigate to="dashboard" replace /> },
            {path:"profile", element: <UserProfile />},
            {path:"recycle", element: <UserRecycle />},
            {path:"chat", element: <UserChat />},
            {path:"transactions", element: <UserTransactions />},
            {path:"thankyou", element: <ThankYouPage />},
            {path:"leaderboard",element: <UserLeaderboard />},
            {path:"pickup-requests", element: <UserPickups />}, 
            {path:"pickup-request/:requestId", element: <PickupDetails />}
        ]
    },
    {
        path: "/admin",
        element: (
            <ProtectedRoute role="admin">
                <AdminLayout />
            </ProtectedRoute>
        ),
        children: [
            {path: "dashboard", element: <AdminDashboard />},
            {path: "bins/add", element: <AddBin />},
            {path: "bins", element: <ViewBins />},
            {path: "bins/:binId", element: <BinDetails />},
            {path: "route", element: <PickupRoute />},
            {path: "analytics", element: <Analytics />},
            {path: "pickup-requests", element: <AdminPickups />},
            {path: "pickup-requests/:requestId", element: <AdminPickupDetail />},
            { index: true, element: <Navigate to="dashboard" replace /> },
        ]
    }
])