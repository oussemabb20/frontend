import { Navigate, Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store/index.js";
import { useEffect, useState } from "react";
import { setUser } from "../../store/slices/userSlice.js";
import { authService } from "../../services/auth.service.js";

interface ProtectedRouteProps {
    requiredRole?: string;
    redirectTo?: string;
}

const ProtectedRoute = ({ requiredRole, redirectTo = "/authentication/sign-in" }: ProtectedRouteProps) => {
    const { currentUser: user, isAuthenticated } = useSelector((state: RootState) => state.user);
    const dispatch = useDispatch();
    const [isChecking, setIsChecking] = useState(true);

    const toReduxUser = (storedUser: any) => ({
        id: storedUser.id || storedUser._id,
        username: storedUser.username,
        email: storedUser.email,
        role: storedUser.role,
        avatar: storedUser.profile?.avatar || storedUser.providerAvatar,
        rank: storedUser.statistics?.rank,
        points: storedUser.statistics?.totalPoints,
    });

    useEffect(() => {
        // Double-check authentication from localStorage if Redux state says not authenticated
        if (!isAuthenticated) {
            const storedUser = authService.getCurrentUser();
            const hasToken = authService.isAuthenticated();
            
            console.log('ProtectedRoute - Checking localStorage');
            console.log('ProtectedRoute - hasToken:', hasToken);
            console.log('ProtectedRoute - storedUser:', storedUser);
            
            if (hasToken && storedUser) {
                // Restore user to Redux
                const userWithCorrectStructure = toReduxUser(storedUser);
                console.log('ProtectedRoute - Restoring user to Redux:', userWithCorrectStructure);
                dispatch(setUser(userWithCorrectStructure));
            }
        }
        setIsChecking(false);
    }, [isAuthenticated, dispatch]);

    const storedUser = authService.getCurrentUser();
    const hasToken = authService.isAuthenticated();
    const fallbackAuthenticated = Boolean(!isAuthenticated && hasToken && storedUser);
    const effectiveIsAuthenticated = isAuthenticated || fallbackAuthenticated;
    const effectiveUser = user || (storedUser ? toReduxUser(storedUser) : null);

    // Show nothing while checking (prevents flash of redirect)
    if (isChecking) {
        return null;
    }

    if (!effectiveIsAuthenticated) {
        console.log('ProtectedRoute - Redirecting to login, not authenticated');
        return <Navigate to={redirectTo} replace />;
    }

    // Check role requirement
    if (requiredRole && effectiveUser?.role !== requiredRole) {
        console.log('ProtectedRoute - Redirecting to dashboard, insufficient role');
        return <Navigate to="/dashboard" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
