import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
    route("stage/editor", "stage/stageEditor.tsx"),
    route("events", "events/eventsPage.tsx"),
] satisfies RouteConfig;
