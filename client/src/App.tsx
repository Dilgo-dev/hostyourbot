import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./component/Layout";
import Home from "./page/Home";
import Register from "./page/Register";
import Login from "./page/Login";
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
]);

const App = () => <RouterProvider router={router} />;

export default App;