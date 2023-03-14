import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Bill from "./components/Bill";
import { useState } from "react";
import "./index.css";

const Cart = () => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const [cartItems, setCartItems] = useState(cart);

  return (
    <div >
      <Header cartItems={cartItems}/>
      <Bill cartItems={cartItems} setCartItems={setCartItems}/>
      <Footer />
    </div>
  );
};

export default Cart;
