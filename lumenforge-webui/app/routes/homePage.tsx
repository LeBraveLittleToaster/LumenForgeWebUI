import { Box, Button } from "@mui/material";
import type { Route } from "./+types/homePage";
import { Navigate, useNavigate } from "react-router";
import { useAuthStore } from "~/stores/authStore";
import { useEffect } from "react";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function HomePage() {

    const ensureInit = useAuthStore(s => s.ensureInit);

    useEffect(() => {
        void ensureInit();
    }, [ensureInit]);

    const navigate = useNavigate();
    const login = useAuthStore((s: any) => s.login);
    const logout = useAuthStore((s: any) => s.logout);
    const status = useAuthStore((s: any) => s.status);
    return <Box>
        <h1>Home Page</h1>
        <p>Authentication status: {status}</p>
        <Button variant="contained" onClick={() => { login(); }}>Login</Button>
        <Button variant="contained" onClick={() => logout()}>Logout</Button>
        <Button variant="contained" onClick={() => navigate("/app")}>Go to Dashboard</Button>
    </Box>;
}
