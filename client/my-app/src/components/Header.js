import { Link } from "react-router-dom";
import "./Header.css";

const Header = (props) => {
    return (
        <div className="header">
            <Link className="header__logo" to="/" />
            <div className="header__categories">
                <Link className="header__category" to="/women/0">女裝</Link>
                <Link className="header__category" to="/men/0">男裝</Link>
                <Link className="header__category" to="/accessories/0">配件</Link>
            </div>
            <input className="header__search-input"/>
            <div className="header__links">
                <Link className="header__link" to="/cart">
                    <div className="header__link-icon-cart">
                        <div className="header__link-icon-cart-number">
                            {props.cartItems.length}
                        </div>
                    </div>
                    <div className="header__link-text">購物車</div>
                </Link>
                <Link className="header__link" to="/member">
                  <div className="header__link-icon-profile" />
                  <div className="header__link-text">會員</div>
                </Link>
            </div>
        </div>
    );
};

export default Header;
