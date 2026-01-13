import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import { useEffect, useMemo, useState } from 'react';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router';
import { useAuthStore } from '~/stores/authStore';

type RouteOptions = {
    title: string,
    redirectTo: string
}

export default function NavigationBar({ routes , title}: { routes: RouteOptions[], title: string }) {
    const navigate = useNavigate();
    const login = useAuthStore((s: any) => s.login);
    const status = useAuthStore((s: any) => s.status);
    const logout = useAuthStore((s: any) => s.logout);
    const userDataStore = useAuthStore((s: any) => s.userData);

    const [userData, setUserData] = useState<any | undefined>(undefined);

    useEffect(() => {
        userDataStore().then((data) => {
            console.log("User data:", data);
            setUserData(data);
        }).catch((err) => {
            console.error("Error fetching user data:", err);
            setUserData(undefined);
        });
    }, [status]);

    const displayName = useMemo(() => {
        console.log("Computing display name with userData:", userData, "and status:", status);
        if (userData !== undefined) {
            return "Welcome " + (userData.preferred_username || userData.name || "Username");
        } else if (status !== "authenticated") {
            return "Login to use full functionality";
        } else {
            return "Error loading username";
        }
    }, [userData]);

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    backdropFilter: 'blur(12px)',
                    WebkitBackdropFilter: 'blur(12px)',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.25)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
                }}
            >
                <Toolbar>
                    <Typography
                        variant="h6"
                        component="div"
                        color='black'
                        sx={{ flexGrow: 1, fontWeight: 600 }}
                    >
                        {title}
                    </Typography>

                    {routes.map((route) => (
                        <MenuItem key={route.title} onClick={() => navigate(route.redirectTo)}>
                            <Typography color='black' sx={{ textAlign: 'center' }}>{route.title}</Typography>
                        </MenuItem>
                    ))}

                    <Typography
                        variant="h6"
                        component="div"
                        color='black'
                        sx={{
                            flexGrow: 1,
                            textAlign: 'center',
                            fontWeight: 400,
                            opacity: 0.9,
                        }}
                    >
                        {displayName}
                    </Typography>


                    {status !== "authenticated" ? (
                        <Button color="inherit" onClick={() => login()}>
                            <Typography color='black'>Login</Typography>
                        </Button>
                    ) : (
                        <Button color="inherit" onClick={() => logout()}>
                            <Typography color='black'>Logout</Typography>
                        </Button>
                    )}
                </Toolbar>
            </AppBar>
        </Box>

    );
}