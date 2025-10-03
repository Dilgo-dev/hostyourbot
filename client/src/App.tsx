import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Layout from "./component/Layout";
import Home from "./page/Home";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
    ],
  },
]);

const App = () => <RouterProvider router={router} />;

export default App;