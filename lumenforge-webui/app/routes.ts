import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("stage/editor", "stage/stageEditor.tsx"),
    route("admin/users", "admin/users.tsx"),
    route("admin/groups", "admin/groups.tsx"),
    route("events", "events/eventsList.tsx"),
] satisfies RouteConfig;
