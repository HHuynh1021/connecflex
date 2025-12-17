import { BrowserRouter, Routes, Route } from "react-router"
import Login from "./auths/Login"
import Dashboard from "./dashboard/Dashboard"
import Home from "./dashboard/Home"
import PrivateRoute from "./services/PrivateRoute"
import ShopAdmin from "./components/shop/ShopAdmin"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard/>}/>}>
          <Route index element={<Home/>}/>
          <Route path="/dashboard/home" element={<Home/>}/>
          <Route path="/dashboard/shopadmin" element={<ShopAdmin/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
