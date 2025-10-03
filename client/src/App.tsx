import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./component/Layout";
import Home from "./page/Home";
import Register from "./page/Register";

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
    ],
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;