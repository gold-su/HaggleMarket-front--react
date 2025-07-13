// src/components/Header.js
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../MainPagesCSS/header.css'; // CSS 파일 경로를 맞춰주세요
import { FaStore, FaUser, FaComments, FaTags } from 'react-icons/fa'; // FontAwesome 예시

function Header({ onMenuToggle, onSearch, frequentKeywords }) {
  const [searchInput, setSearchInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      onSearch(searchInput);
    }
  };

  return (
    <header>
      <div className="header-inner-wrapper">
        <div className="logo-menu">
          <Link to="/" className="logo">해글마켓</Link>
          <svg
            className="menu-icon"
            id="menuToggle"
            viewBox="0 0 24 24"
            aria-label="메뉴 열기"
            role="button"
            tabIndex="0"
            onClick={onMenuToggle}
          >
            <rect y="4" width="24" height="2"></rect>
            <rect y="11" width="24" height="2"></rect>
            <rect y="18" width="24" height="2"></rect>
          </svg>
        </div>
        <div className="search-container">
          <div className="search-box-wrapper">
            <input
              type="text"
              className="search-box"
              id="searchInput"
              placeholder="검색어를 입력해주세요."
              aria-label="검색창"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <svg
              className="search-icon"
              id="searchIcon"
              viewBox="0 0 24 24"
              aria-label="검색"
              role="button"
              tabIndex="0"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              onClick={() => onSearch(searchInput)} // <-- 직접 onSearch 호출
            >
              <circle cx="11" cy="11" r="8" fill="white" stroke="currentColor"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor"></line>
            </svg>
          </div>
        </div>
        <div className="auth-buttons">
          {/* ✅ 판매하기 링크의 'to' 속성을 '/register-product'로 변경 */}
          <Link to="/register-product"><FaTags style={{ marginRight: '6px' }} />판매하기</Link>
          <span className="divider">|</span>
          <Link to="/myproduct"><FaStore style={{ marginRight: '6px' }} />내상점</Link>
          <span className="divider">|</span>
          <Link to="/chat"><FaComments style={{ marginRight: '6px' }} />해글톡</Link>
        </div>
      </div>
    </header>
  );
}

export default Header;