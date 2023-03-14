import { useState , useEffect} from "react";
import { API_ORDER } from "../../global/constants";
const Order = () => {
  const [total, setTotal] = useState();
  async function fetchTotal(){

    const res =  await fetch(`${API_ORDER}`, {
      headers:({
        'Content-Type': 'application/json',
      }),
    }).then((response) => response.json());
    if (res.data) {
        setTotal(res.data);
    }
  }
  useEffect(() => {
    fetchTotal();
  }, []);

  return (
    <div >
      <div>Total Revenue:{total}</div>
    </div>
  );
};

export default Order;