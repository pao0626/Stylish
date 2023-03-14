import styled from "styled-components";
import picture from "../../../image/home.jpg";

const Picture = styled.div`
  background-image: url(${picture});
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  width: 100%;
  height: 500px;
  margin: 0 0 ;
`;

const Carousel = () => {
  return <Picture />;
};

export default Carousel;
