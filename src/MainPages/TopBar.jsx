import React from 'react';
import { Link } from 'react-router-dom';
import '../MainPagesCSS/TopBar.css'; // CSS 파일 경로를 맞춰주세요

function TopBar() {
  const isLoggedIn = !!localStorage.getItem('jwtToken');

  return (
    <div className="top-bar-wrapper">
      <div className='top-bar'>  
      {isLoggedIn ? (
        <div className="top-bar-links">
          <span>{localStorage.getItem("nickName")}님 환영합니다</span>
          <Link to="/mypage">마이페이지</Link>
          <button onClick={() => {
            localStorage.clear();
            window.location.href = '/login';
          }}>로그아웃</button>
        </div>
      ) : (
        <div className="top-bar-links">
          <Link to="/login">로그인</Link>
          <Link to="/signup">회원가입</Link>
        </div>
      )}
    </div>
    </div>
  );
}

export default TopBar;