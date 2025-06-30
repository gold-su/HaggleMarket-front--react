// src/pages/Login.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../pagesCSS/login.css";

const Login = () => {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    alert(`로그인 시도: ${userId}, ${password}`);
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
};

export default Login;
