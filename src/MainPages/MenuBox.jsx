// src/components/MenuBox.js
import React, { useEffect } from 'react';
// import { Link } from 'react-router-dom'; // Link는 현재 MenuBox에서 직접 사용되지 않으므로 제거 가능
import '../MainPagesCSS/menubox.css'; // CSS 파일 경로를 맞춰주세요
function MenuBox({ isOpen, onClose, frequentKeywords }) {
  // 메뉴가 열릴 때 body 스크롤 방지 (선택 사항)
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // 카테고리 클릭 핸들러
  const handleCategoryClick = (category) => {
    alert(`선택한 카테고리: ${category}`); // 실제로는 페이지 이동 또는 검색 기능 연결
    onClose(); // 메뉴 닫기
    // 예: window.location.href = `/search?category=${encodeURIComponent(category)}`;
  };

  return (
    <nav className={`menu-box ${isOpen ? 'active' : ''}`} id="menuBox" aria-label="사이트 메뉴">
      {/* 전체 카테고리 */}
      <div className="menu-category">
        <h3>전체 카테고리</h3>
        <ul>
          <li onClick={() => handleCategoryClick('의류')}>의류</li>
          <li onClick={() => handleCategoryClick('가전제품')}>가전제품</li>
          <li onClick={() => handleCategoryClick('뷰티')}>뷰티</li>
          <li onClick={() => handleCategoryClick('가구')}>가구</li>
          <li onClick={() => handleCategoryClick('스포츠')}>스포츠</li>
          <li onClick={() => handleCategoryClick('생활')}>생활</li>
          <li onClick={() => handleCategoryClick('도서')}>도서</li>
          {/* 추가된 항목 */}
          <li onClick={() => handleCategoryClick('식품')}>식품</li>
          <li onClick={() => handleCategoryClick('유아용품')}>유아용품</li>
          <li onClick={() => handleCategoryClick('자동차용품')}>자동차용품</li>
          <li onClick={() => handleCategoryClick('취미/수집')}>취미/수집</li>
          <li onClick={() => handleCategoryClick('디지털기기')}>디지털기기</li>
        </ul>
      </div>

      {/* 인기 카테고리 */}
      <div className="menu-category">
        <h3>인기 카테고리</h3>
        <ul id="popularCategoryList">
          {frequentKeywords.map((keyword, index) => (
            <li key={index} onClick={() => handleCategoryClick(keyword)}>
              {keyword}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default MenuBox;
