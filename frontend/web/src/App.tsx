import { BrowserRouter, Routes, Route } from "react-router"
import Login from "./auths/Login"
import Dashboard from "./publicPages/Dashboard"
import PrivateRoute from "./services/PrivateRoute"
import ShopAdmin from "./adminPages/ShopAdmin"
import ShopPage from "./publicPages/ShopDetailPage"
import ShopInfo from "./adminPages/ShopInfo"
import Register from "./auths/Register"
import ResetPassword from "./auths/ResetPassword"
import Activate from "./auths/Activate"
import ResetPasswordConfirm from "./auths/ResetPasswordConfirm"
import ShopListPage from "./publicPages/ShopListPage"
import AddProducts from "./adminPages/AddProducts"
import ProductPage from "./components/products/ProductDetailByShop"
import ShopProducts from "./adminPages/ShopProducts"
import ProductListPage from "./publicPages/ProductListPage"
import HomePage from "./publicPages/HomePage"

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* public page paths */}
        <Route path="/" element={<Dashboard/>}>
          <Route index element={<HomePage/>}/>
          <Route path="/home" element={<HomePage/>}/>
          <Route path="/home/shop-list" element={<ShopListPage/>}/>
          <Route path="/home/product-list/" element={<ProductListPage/>}/>
        </Route>
        <Route path="/shop-page/templates/:shopId" element={<ShopPage/>}/>
        <Route path="/product-page/:shopId/:productId" element={<ProductPage/>}/>

        {/* auth paths */}
        <Route path="/login" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/reset-password" element={<ResetPassword/>}/>
        <Route path="/activate/:uid/:token" element={<Activate/>} />
        <Route path="/password-reset/confirm/:uid/:token" element={<ResetPasswordConfirm/>} />
      {/* management pages paths */}
        <Route path="/management" element={<PrivateRoute element={<ShopAdmin/>}/>}>
          <Route index element={<ShopInfo/>}/>
          <Route path="/management/shop-info" element={<ShopInfo/>}/>
          <Route path="/management/shop-product/add-product" element={<AddProducts/>}/>
          <Route path="/management/shop-product" element={<ShopProducts/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
