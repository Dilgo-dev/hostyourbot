import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./component/Layout";
import Home from "./page/Home";
import Register from "./page/Register";
import Login from "./page/Login";
import Dashboard from "./page/Dashboard";
import CreateBot from "./page/CreateBot";
import BotDetail from "./page/BotDetail";
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
    path: "/dashboard/create",
    element: <CreateBot />,
  },
  {
    path: "/dashboard/bots/:id",
    element: <BotDetail />,
  },
]);

const App = () => (
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);

export default App;