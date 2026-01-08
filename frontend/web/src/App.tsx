import { BrowserRouter, Routes, Route } from "react-router"
import Dashboard from "./publicPages/Dashboard"
import PrivateRoute from "./services/PrivateRoute"
import ShopAdmin from "./adminPages/ShopAdmin"
import ShopDetailPage from "./publicPages/ShopDetailPage"
import ShopInfo from "./adminPages/ShopInfo"
import Register from "./auths/Register"
import ResetPassword from "./auths/ResetPassword"
import Activate from "./auths/Activate"
import ResetPasswordConfirm from "./auths/ResetPasswordConfirm"
import ShopListPage from "./publicPages/ShopListPage"
import AddProducts from "./adminPages/AddProducts"
import ProductDetailByShop from "./components/products/ProductDetailByShop"
import ShopProducts from "./adminPages/ShopProducts"
import ProductListPage from "./publicPages/ProductListPage"
import HomePage from "./publicPages/HomePage"
import LoginPage from "./auths/LoginPage"
import OrderList from "./adminPages/OrderList"

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
          <Route path="/shop-page/templates/:shopId" element={<ShopDetailPage/>}/>
          <Route path="/product-page/:shopId/:productId" element={<ProductDetailByShop/>}/>
          
        </Route>

        {/* auth paths */}
        <Route path="/login" element={<LoginPage/>}/>
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
          <Route path="/management/order-list" element={<OrderList/>}/>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
