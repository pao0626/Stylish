import { Link } from "react-router-dom";

const Item = ({ id, title, price, imageURL, colors }) => {
    return (
        <div className="product">
            <Link to={`/product/${id}`}>
                <img src={imageURL} className="product__image" alt="商品圖"/>
            </Link>
            <div className="product__colors">
                {colors.map((color) => (
                    <div className="product__color"
                      style={{ backgroundColor: `#${color}` }}
                      key={color}
                    />
                ))}
            </div>
            <div className="product__title">{title}</div>
            <div className="product__price">TWD.{price}</div>
        </div>
    );
};

export default Item;
