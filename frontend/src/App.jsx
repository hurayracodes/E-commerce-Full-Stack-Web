import './App.css';
import { BrowserRouter } from 'react-router-dom';
import { Routes, Route } from 'react-router-dom';
import Navigation from './components/Navigation';
import Home from './pages/Home';
import About from './pages/About';
import Product from './pages/Product';
import Contact from './pages/Contact';
import Cart from './pages/Cart';
import Collection from './pages/Collection';
import CreateProduct from './admin/CreateProduct';
import ProductList from './components/HomeUi/ProductList';
function App() {
  return (
    <div>
      <>
        <BrowserRouter className="w-full bg-slate-100 ">
          <Navigation />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-product" element={<CreateProduct />} />
            <Route path="/admin/product-list" element={<ProductList />} />
            <Route path="/about" element={<About />} />
            <Route path="/collection" element={<Collection />} />
            <Route path="/product/:productId" element={<Product />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </BrowserRouter>
      {/* <div className="w-full bg-slate-100 min-h-screen">
          <Navigation />
          
        <div className="max-w-6xl mx-auto px-4">
        </div>

      </div> */}
      </>
    </div>
  )
}

export default App
