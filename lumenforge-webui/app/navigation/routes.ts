export type NavigationRoute = {
    title: string;
    redirectTo: string;
};

export const navigationRoutes: NavigationRoute[] = [
    { title: "FaderBar", redirectTo: "/" },
    { title: "Editor", redirectTo: "/stage/editor" },
    { title: "Admin Users", redirectTo: "/admin/users" },
    { title: "Admin Groups", redirectTo: "/admin/groups" },
    { title: "Events", redirectTo: "/events" },
    { title: "Settings", redirectTo: "/settings" },
];
