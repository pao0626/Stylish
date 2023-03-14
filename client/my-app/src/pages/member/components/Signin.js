import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { API_SIGNIN } from "../../../global/constants";


const Signin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [shown, setShown] = useState(false);
  const [sign, setSign] = useState();
  const jwtToken = window.localStorage.getItem('jwtToken');

  useEffect(() => {
    if (!jwtToken){setSign(false)}
    if (jwtToken){setSign(true)}
    }
  ,[sign]);

  if (!jwtToken) {

    async function signIn() {
      const res =  await fetch(`${API_SIGNIN}`, {
        body: JSON.stringify({
        email: email,
        password: password
        }),
        headers: new Headers({
          'Content-Type': 'application/json',
        }),
        method: 'POST'
      }).then((response) => response.json());

      if (!res.data) {
        window.alert(res.error);
        return;
      }  
      window.localStorage.setItem('jwtToken', res.data.access_token);
      setSign(true);
    }

    return(
      <div className="profile__before__signin">               
        <div className="form">
          <div className="form__title">會員登入</div>
            <div className="form__field">
              <div className="form__field-name">Email</div>
              <input className="form__field-input" type="email" placeholder="電子郵件地址" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form__field">
              <div className="form__field-name">密碼</div>
              <input className="form__field-input" type={`${shown ? 'text' : 'password'}`} maxLength="20" placeholder="請輸入20位數以內密碼" value={password} onChange={(e) => setPassword(e.target.value)} />
              <div className= "show_password">
                <input type="checkbox" onClick={() => setShown(!shown)}/>
                <div className= "show_password_text">顯示密碼</div>
              </div>
            </div> 
            <button className={`${(email && password) ? 'signin_finish-button' : 'signin-button'}`} onClick={signIn}>登入</button>
        </div>
          <Link to="/signup" className="link">
            <div className="member_signup-button" >註冊</div>
          </Link>
      </div>
    )  
  }

  return (
    <div className="profile">
      <div className="profile__title">會員已登入</div>
        <button className="signout-button" onClick={() => {
            window.localStorage.removeItem('jwtToken');
            setSign(false);
        }}>登出</button>
    </div>
  )
}

export default Signin;
