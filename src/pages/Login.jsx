// src/pages/Login.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import "../pagesCSS/login.css";
import { login } from "../api/auth";

function Login() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { token, nickname } = await login(userId, password);

      localStorage.setItem("jwtToken", token);
      localStorage.setItem("nickName", nickname);
      window.dispatchEvent(new Event("auth:changed"));

      alert("로그인 성공");
      navigate("/");
      window.location.reload();
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
        <h1>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            HAGGLE
          </Link>
        </h1>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="아이디"
            value={userId}
            onChange={(e) => {
              const val = e.target.value;
              const filtered = val.replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, ''); 
              setUserId(filtered); // ✅ 중복 setUserId 제거 + 한글 제거 처리 통합
            }}
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
              <span
                onClick={() => handleLinkClick('계정찾기')}
                style={{ cursor: 'pointer', color: '#aaaaaa' }}
              >
                계정찾기
              </span>
              {' | '}
              {/* ✅ 기존 onClick → handleLinkClick 대신 /forgot 경로로 연결 */}
              <Link to="/forgot" style={{ color: '#aaaaaa' }}>
                비밀번호 찾기
              </Link>
            </div>
          </div>

          <button type="submit">로그인</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
