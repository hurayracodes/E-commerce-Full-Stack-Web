import "./App.css";
import { BrowserRouter } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import Navigation from "./components/Navigation";
import Home from "./pages/Home";
import About from "./pages/About";
import Product from "./pages/Product";
import Contact from "./pages/Contact";
import Cart from "./pages/Cart";
import Collection from "./pages/Collection";
import CreateProduct from "./admin/CreateProduct";
import ProductList from "./components/HomeUi/ProductList";
import AdminDashboard from "./admin/AdminDashboard";
import MyOrders from "./admin/MyOrders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import { AuthProvider } from "./context/AuthContext";
import ShopProvider from "./context/ShopContext";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <div>
      <>
        <BrowserRouter className="w-full bg-slate-100 ">
        <AuthProvider>
          <ShopProvider>
          <Navigation />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/create-product"
              element={
                <ProtectedRoute adminOnly>
                  <CreateProduct />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/product-list"
              element={
                <ProtectedRoute adminOnly>
                  <ProductList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/orders"
              element={
                <ProtectedRoute adminOnly>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-orders"
              element={
                <ProtectedRoute>
                  <MyOrders />
                </ProtectedRoute>
              }
            />
            <Route path="/about" element={<About />} />
            <Route path="/collection" element={<ProductList />} />
            <Route path="/product/:productId" element={<Product />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
          </ShopProvider>
          </AuthProvider>
        </BrowserRouter>
        {/* <div className="w-full bg-slate-100 min-h-screen">
          <Navigation />
          
        <div className="max-w-6xl mx-auto px-4">
        </div>

      </div> */}
      </>
    </div>
  );
}

export default App;
