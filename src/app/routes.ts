import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { DataMonitoring } from "./components/DataMonitoring";
import { OperationAudit } from "./components/OperationAudit";
import { UserManagement } from "./components/UserManagement";
import { SystemSettings } from "./components/SystemSettings";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: DataMonitoring },
      { path: "audit", Component: OperationAudit },
      { path: "users", Component: UserManagement },
      { path: "settings", Component: SystemSettings },
    ],
  },
]);
