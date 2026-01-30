import { Box, Button } from "@mui/material";
import type { Route } from "./+types/mainPage";
import { useNavigate } from "react-router";
import { useAuthStore } from "~/stores/authStore";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "New React Router App" },
        { name: "description", content: "Welcome to React Router!" },
    ];
}

export default function MainPage() {
    const navigate = useNavigate();
    const login = useAuthStore((s: any) => s.login);
    const logout = useAuthStore((s: any) => s.logout);
    const status = useAuthStore((s: any) => s.status);
    return <Box>
        <h1>Main Page</h1>
        <p>Authentication status: {status}</p>
        <Button variant="contained" onClick={() => {login();}}>Login</Button>
        <Button variant="contained" onClick={() => logout()}>Logout</Button>
        <Button variant="contained" onClick={() => navigate("/home")}>Go to rental</Button>
    </Box>;
}
