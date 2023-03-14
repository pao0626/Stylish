import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Carousel from "./components/Carousel";
import List from "./components/List";
import { useEffect, useState } from "react";
import { API_GET_PRODUCT_LIST } from "../../global/constants";
import { useParams } from "react-router-dom";
import "./index.css";

async function fetchProduct(setProduct, setLoading, category, paging) {
    setLoading(true);
    let res;
    if (category) {
      res = await fetch(`${API_GET_PRODUCT_LIST}/${category}?paging=${paging}`)
        .then((response) => response.json());
    }
    else{
        res = await fetch(`${API_GET_PRODUCT_LIST}/all?paging=${paging}`)
        .then((response) => response.json());
    }
    setProduct(res.data);   
    setLoading(false);
}

const Home = () => {
    let { category, paging } = useParams();
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const [cartItems] = useState(cart);
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState([]);
    useEffect(() => {
        fetchProduct(setProduct, setLoading, category, paging);
    }, [category,paging]);
    const hasProduct = product.length > 0;

    if (loading) {
        return <div>loading...</div>;
    } else
        return (
            <div>
                <Header cartItems={cartItems}/>
                <Carousel />
                {hasProduct && <List listData={product} />}
                <Footer />
            </div>
        );
};

export default Home;
