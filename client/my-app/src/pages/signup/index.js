import Header from "../../components/Header";
import Footer from "../../components/Footer";
import User from "./components/User";
import { useState } from "react";
import "./index.css";

const Signup = () => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const [cartItems,] = useState(cart);
  return (
    <div >
      <Header cartItems={cartItems}/>
      <User />
      <Footer />
    </div>
  );
};

export default Signup;