import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../pagesCSS/login.css";
import { login } from "../api/auth";

function Login() {
  const navigate = useNavigate();
  // 값 저장을 위한 상태 변수들
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = await login(userId, password);
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("userId",userId);
      alert("로그인 성공");
      navigate('/');
    } catch (error) {
      alert("로그인 실패: 아이디나 비밀번호를 확인하세요");
      console.log(error);
    }
  };

  const handleLinkClick = (action) => {
    alert(`${action} 기능은 아직 구현되지 않았습니다.`);
  };

  return (
  <div className="login-page-wrapper">
    <div className="login-container">
      <h1>HAGGLE</h1>
      <form onSubmit={handleSubmit}>
        <input
        type="text"
        placeholder="아이디"
        value={userId}
        onChange={(e) => setUserId(e.target.value)}
        required
          />
          <input
          type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <div className="links">
            <Link to="/signup" style={{ color: '#aaaaaa' }}>회원가입</Link>
            <div>
              <span onClick={() => handleLinkClick('계정찾기')} style={{ cursor: 'pointer', color: '#aaaaaa' }}>계정찾기</span> |
              <span onClick={() => handleLinkClick('비밀번호 찾기')} style={{ cursor: 'pointer', color: '#aaaaaa' }}> 비밀번호 찾기</span>
            </div>
          </div>
          <button type="submit">로그인</button>
        </form>
      </div>
      </div>
      );
}

export default Login;
