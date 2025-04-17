import { RouterProvider, createBrowserRouter } from "react-router-dom";
import DashboardPage from "./pages/DashboardPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./utils/NotFoundPage";
import ProtectedRoute from "./utils/ProtectedRoute";
import NuevoProcesoForm from "./components/Dashboard/NuevoProcesoForm";
import WriteProcessForm from "./components/Dashboard/WriteProcessForm";
import ProcessPage from "./pages/ProcessPage";
import ModalPdf from "./components/Modals/ModalPdf";
import ModalTxt from "./components/Modals/ModalTxt";
import CorrectionsListPage from "./components/Dashboard/CorrectionListPage";

const routes = [
  { path: "/", element: <LoginPage /> },
  {
    path: "/dashboard",
    element: <ProtectedRoute allowedRoles={[4,5,6,7]} />, 
    children: [{ path: "", element: <DashboardPage /> }],
  },
  {
    path: "/process",
    element: <ProtectedRoute allowedRoles={[4]} />, 
    children: [{ path: "", element: <ProcessPage /> }],
  },
  {
    path: "/nuevo-proceso",
    element: <ProtectedRoute allowedRoles={[4]} />, 
    children: [{ path: "", element: <NuevoProcesoForm /> }],
  },
  {
    path: "/correccion-lista",
    element: <ProtectedRoute allowedRoles={[4]}/>,
    children: [{path: "", element: <CorrectionsListPage/>}]
  },
  {
    path: "/escribir-proceso",
    element: <ProtectedRoute allowedRoles={[4]} />, 
    children: [{ path: "", element: <WriteProcessForm /> }],
  },
  {
    path: "/modal-pdf/:escrituraId",
    element: <ProtectedRoute allowedRoles={[4,5,6]} />,
    children: [{path: "", element: <ModalPdf/>}]
  },
  {
    path: "/modal-txt/:escrituraId",
    element: <ProtectedRoute allowedRoles={[4,5,6]} />,
    children: [{path: "", element: <ModalTxt/>}]
  },
  {path: "*", element: <NotFoundPage />}
];

const router = createBrowserRouter(routes);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
