import { useState } from "react";
import { API_SIGNUP } from "../../../global/constants";

const User = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordCheck, setPasswordCheck] = useState('');
  const [shown, setShown] = useState(false);

  async function signup() {
    const userInfo = {
      name,
      email,
      password,
      passwordCheck
    };

    if (Object.values(userInfo).some((value) => !value)) {
      window.alert('請填寫完整資料');
      return;
    }

    if (password !== passwordCheck) {
      window.alert('密碼不相等');
      return;
    }
    const res =  await fetch(`${API_SIGNUP}`, {
      body: JSON.stringify({
      name: name, 
      email: email, 
      password: password
      }),
      headers:({
        'Content-Type': 'application/json',
      }),
      method: 'POST'
    }).then((response) => response.json());
   
    if (!res.data) {
      window.alert(res.error);
      return;
    }         
    window.alert('註冊成功');
    window.localStorage.setItem('jwtToken', res.data.access_token);
    window.location.href = '/member';
  }
 
  return (
    <div className="signup">
      <div className="signup__title">會員註冊</div>   
      <div className="form">
        <div className="form__field">
          <div className="form__field-name">姓名</div>
          <input className="form__field-input" placeholder="中文或英文姓名" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="form__field">
          <div className="form__field-name">Email</div>
          <input className="form__field-input" type="email" placeholder="電子郵件地址" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="form__note">※電子郵件地址將作為登入帳號，敬請填寫正確資訊，以免喪失會員權益。</div>
        <div className="form__field">
          <div className="form__field-name">密碼</div>
          <input className="form__field-input" type={`${shown ? 'text' : 'password'}`} maxLength="20" placeholder="請輸入20位數以內密碼" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <div className="form__field">
          <div className="form__field-name">確認密碼</div>
          <input className="form__field-input" type={`${shown ? 'text' : 'password'}`} maxLength="20" placeholder="請輸入20位數以內密碼" value={passwordCheck} onChange={(e) => setPasswordCheck(e.target.value)} />
          <div className= "show_password">
            <input type="checkbox" onClick={() => setShown(!shown)}/>
            <div className= "show_password_text">顯示密碼</div>
          </div>
        </div>
      </div>
      <button className={`${(name && email && password) ? 'signup_finish-button' : 'signup-button'}`} onClick={signup} >註冊</button>
    </div>
  );
}

export default User;