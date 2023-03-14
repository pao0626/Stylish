import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home/index";
import Product from "./pages/product/index";
import Cart from "./pages/cart/index";
import Member from "./pages/member/index";
import Signup from "./pages/signup/index";
import Order from "./pages/dashboard/index";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/:category/:paging" element={<Home />} />
      <Route path="product/:id" element={<Product />} />
      <Route path="cart" element={<Cart />} />
      <Route path="member" element={<Member />} />
      <Route path="signup" element={<Signup />} />
      <Route path="admin/dashboard.html" element={<Order />} />
    </Routes>
  </BrowserRouter>
);

