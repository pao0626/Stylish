import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { API_GET_PRODUCT_DETAIL } from "../../../global/constants";


const Top = (props) => {
    let { id } = useParams();
    const [product, setProduct] = useState();
    const [selectedColorCode, setSelectedColorCode] = useState();
    const [selectedSize, setSelectedSize] = useState();
    const [quantity, setQuantity] = useState(1);

    async function fetchDetail(setSelectedColorCode, setProduct, id) {
        const res = await fetch(`${API_GET_PRODUCT_DETAIL}/?id=${id}`)
        .then((response) => response.json());
        if (res.data) {
            setSelectedColorCode(res.data.colors[0]);
            setProduct(res.data);
        }

    }
    useEffect(() => {
        fetchDetail(setSelectedColorCode, setProduct, id);
    }, []);

    if (!product)
    return <div className="detail-product">查無此產品</div>; 

    function getStock(color, size) {
        return product.variants.find(
          (variant) => variant.color_code === color && variant.size === size
        ).stock;
    }

    function renderProductColorSelector() {
        return (
          <div className="detail-product__color-selector">
            {product.colors.map((color) => (
              <div
                key={color}
                className={`detail-product__color${
                  color === selectedColorCode
                    ? ' detail-product__color--selected'
                    : ''
                }`}
                style={{ backgroundColor: `#${color}` }}
                onClick={() => {
                  setSelectedColorCode(color);
                  setSelectedSize();
                  setQuantity(1);
                }}
              />
            ))}
          </div>
        );
    }

    function renderProductSizeSelector() {
        return (
          <div className="detail-product__size-selector">
            {product.sizes.map((size) => {
              const stock = getStock(selectedColorCode, size);
              return (
                <div
                  key={size}
                  className={`detail-product__size${
                    size === selectedSize ? ' detail-product__size--selected' : ''
                  }${stock === 0 ? ' detail-product__size--disabled' : ''}`}
                  onClick={() => {
                    if (stock === 0) return;
                    setSelectedSize(size);
                    if (stock < quantity) setQuantity(1);
                  }}
                >
                  {size}
                </div>
              );
            })}
          </div>
        );
    }

    function renderProductQuantitySelector() {
        return (
          <div className="detail-product__quantity-selector">
            <div
              className="detail-product__quantity-minus"
              onClick={() => {
                if (!selectedSize) return;
                if (quantity === 1) return;
                setQuantity(quantity - 1);
              }}
            />
            <div className="detail-product__quantity-value">{quantity}</div>
            <div
              className="detail-product__quantity-add"
              onClick={() => {
                if (!selectedSize) return;
                const stock = getStock(selectedColorCode, selectedSize);
                if (quantity === stock) return;
                setQuantity(quantity + 1);
              }}
            />
          </div>
        );
    }

    function addToCart() {
        if (!selectedSize) {
              window.alert('請選擇尺寸');
              return;
        }
        const newCartItems = [
            ...props.cartItems,
            {
                color: product.colors.find((color) => color === selectedColorCode),
                id: product.id,
                image: product.imageURL,
                name: product.title,
                price: product.price,
                qty: quantity,
                size: selectedSize,
                stock: getStock(selectedColorCode, selectedSize),
            },
        ];
        window.localStorage.setItem('cart', JSON.stringify(newCartItems));
        props.setCartItems(newCartItems);
        window.alert('已加入購物車');
    }

    return (
        <div className="detail-product">
            <img src={product.imageURL} className="detail-product__main-image" alt="商品圖"/>
            <div className="detail-product__detail">
                <div className="detail-product__title">{product.title}</div>
                <div className="detail-product__id">{product.id}</div>
                <div className="detail-product__price">TWD.{product.price}</div>
                <div className="detail-product__variant">
                    <div className="detail-product__color-title">顏色｜</div>
                    {renderProductColorSelector()}
                </div>
                <div className="detail-product__variant">
                    <div className="detail-product__size-title">尺寸｜</div>
                    {renderProductSizeSelector()}
                </div>
                <div className="detail-product__variant">
                    <div className="detail-product__quantity-title">數量｜</div>
                    {renderProductQuantitySelector()}
                </div>
                <button className="detail-product__add-to-cart-button" onClick={addToCart}>
                    {selectedSize ? '加入購物車' : '請選擇尺寸'}
                </button>
                <div className="detail-product__texture">{product.basic_info}</div>
            </div>
        </div>
    );
}
export default Top;
