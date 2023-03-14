import Item from "./Item";

const List = ({ listData }) => {
    return (
        <div className="products">
            {listData.map((item) => {
                const { id, title, price, imageURL, colors } = item;
                return (
                    <Item
                        key={id}
                        id={id}
                        title={title}
                        price={price}
                        imageURL={imageURL}
                        colors={colors}
                    />
                );
            })}
        </div>
    );
};

export default List;
