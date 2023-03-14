import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Signin from "./components/Signin";
import { useState } from "react";
import "./index.css";

const Member = () => {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const [cartItems] = useState(cart);
  return (
    <div >
      <Header cartItems={cartItems}/>
      <Signin />
      <Footer />
    </div>
  );
};

export default Member;