import { Box } from "@mui/material";
import { useEffect } from "react";
import { Outlet, Navigate } from "react-router";
import type { Route } from "./+types/protectedRoutes";
import { useAuthStore } from "~/stores/authStore";

const ProtectedRoutes = () => {

    const status = useAuthStore((s: any) => s.status);
    
    if (status === "idle" || status === "initializing") {
        return <Box margin={0} width={"100dvw"} height={"100dvh"} sx={{ display: 'flex', alignContent: 'center', justifyContent: 'center', alignItems: 'center' }}><span className="loader"></span></Box>
    }
    if (status !== "authenticated") {
        return <Navigate to="/" replace />;
    }
    console.log("Auth status:", status);
    
    return <Outlet />;
};

export default ProtectedRoutes;