import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Top from "./components/Top";
import { useState } from "react";
import "./index.css";

const Product = () => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const [cartItems, setCartItems] = useState(cart);

    return (
        <div>
            <Header cartItems={cartItems}/>
            <Top cartItems={cartItems} setCartItems={setCartItems}/>
            <Footer />
        </div>
    );
}
export default Product;
