import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./component/Layout";
import Home from "./page/Home";
import Register from "./page/Register";
import Login from "./page/Login";
import ForgotPassword from "./page/ForgotPassword";
import ResetPassword from "./page/ResetPassword";
import Dashboard from "./page/Dashboard";
import CreateBotMethod from "./page/CreateBotMethod";
import CreateBot from "./page/CreateBot";
import BotDetail from "./page/BotDetail";
import AccountSettings from "./page/AccountSettings";
import AdminDashboard from "./page/AdminDashboard";
import AdminUsers from "./page/admin/AdminUsers";
import AdminBots from "./page/admin/AdminBots";
import AdminSystem from "./page/admin/AdminSystem";
import AdminLogs from "./page/admin/AdminLogs";
import AdminConfig from "./page/admin/AdminConfig";
import Builder from "./page/Builder";
import NotFound from "./page/NotFound";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "register",
        element: <Register />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "reset-password",
        element: <ResetPassword />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/dashboard/create/method",
    element: <CreateBotMethod />,
  },
  {
    path: "/dashboard/create",
    element: <CreateBot />,
  },
  {
    path: "/dashboard/bots/:id",
    element: <BotDetail />,
  },
  {
    path: "/dashboard/settings",
    element: <AccountSettings />,
  },
  {
    path: "/dashboard/admin",
    element: <AdminDashboard />,
  },
  {
    path: "/dashboard/admin/users",
    element: <AdminUsers />,
  },
  {
    path: "/dashboard/admin/bots",
    element: <AdminBots />,
  },
  {
    path: "/dashboard/admin/system",
    element: <AdminSystem />,
  },
  {
    path: "/dashboard/admin/logs",
    element: <AdminLogs />,
  },
  {
    path: "/dashboard/admin/config",
    element: <AdminConfig />,
  },
  {
    path: "/builder",
    element: <Builder />,
  },
]);

const App = () => (
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);

export default App;
