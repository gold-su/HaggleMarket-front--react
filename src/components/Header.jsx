// src/components/Header.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../componentCSS/header.css"; // CSS 파일 경로 유지
import { FaStore, FaComments, FaTags, FaGavel } from "react-icons/fa"; // 경매 아이콘 추가

function Header({ onMenuToggle, onSearch, frequentKeywords }) {
  const [searchInput, setSearchInput] = useState("");
  const navigate = useNavigate();

  const goSearch = () => {
    const q = searchInput.trim();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", "0");
    navigate(`/search?${params.toString()}`);
  };

  const handleKeyDown = (e) => {
    // 한글 입력(조합) 중 엔터는 무시
    if (e.nativeEvent.isComposing) return;
    if (e.key === "Enter") {
      e.preventDefault();
      goSearch();
    }
  };

  return (
    <header>
      <div className="header-inner-wrapper">
        <div className="logo-menu">
          {/* 10월 19일 별모양 NEW 배지 생성 */}
          <span className="new-burst" aria-hidden="true">
            <span className="label">NEW</span>
          </span>
          <Link to="/" className="logo">
            해글마켓
          </Link>
        </div>

        <div className="search-container">
          <div className="search-box-wrapper">
            <input
              type="text"
              className="search-box"
              id="searchInput"
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
              onClick={() => onSearch(searchInput)} // 직접 onSearch 호출
            >
              <circle
                cx="11"
                cy="11"
                r="8"
                fill="white"
                stroke="currentColor"
              ></circle>
              <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
                stroke="currentColor"
              ></line>
            </svg>
          </div>
        </div>

        <div className="auth-buttons">
          {/* 중고 판매 등록 → /product */}
          <Link to="/product">
            <FaTags style={{ marginRight: "6px" }} />
            판매하기
          </Link>
          <span className="divider">|</span>

          {/* 경매 등록 → /register-auction */}
          <Link to="/register-auction">
            <FaGavel style={{ marginRight: "6px" }} />
            경매 등록
          </Link>
          <span className="divider">|</span>

          {/* 내 상점 */}
          <Link to="/myshop">
            <FaStore style={{ marginRight: "6px" }} />
            내상점
          </Link>
          <span className="divider">|</span>

          {/* 해글톡 */}
          <Link to="/chat">
            <FaComments style={{ marginRight: "6px" }} />
            해글톡
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Header;
