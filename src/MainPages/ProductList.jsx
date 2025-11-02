import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "./ProductCard";
import axios from "axios";
import "../MainPagesCSS/productcard.css";
import "../MainPagesCSS/menubox.css";

function ProductList({
  products = [],
  selectedCategory = "used",
  onCategoryChange,
}) {
  const [open, setOpen] = useState(false);
  const [large, setLarge] = useState([]);
  const [middle, setMiddle] = useState([]);
  const [small, setSmall] = useState([]);
  const [selectedLarge, setSelectedLarge] = useState(null);
  const [selectedMiddle, setSelectedMiddle] = useState(null);
  const menuRef = useRef(null); // ✅ 메뉴 DOM 참조
  const navigate = useNavigate();

  // 메뉴박스 열기/닫기
  const toggleMenu = async () => {
    if (!open) {
      const res = await axios.get("/api/categories/roots");
      setLarge(res.data || []);
    }
    setOpen((prev) => !prev);
  };

  // ✅ 메뉴 외부 클릭 시 자동 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);

      // ✅ 닫힐 때 선택 초기화
      setSelectedLarge(null);
      setSelectedMiddle(null);
      setSmall([]);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);


  // 대분류 선택
  const handleLargeSelect = async (id) => {
    setSelectedLarge(id);
    setSelectedMiddle(null);
    setSmall([]);
    const res = await axios.get(`/api/categories/${id}`);
    setMiddle(res.data || []);
  };

  // 중분류 선택
  const handleMiddleSelect = async (id) => {
    setSelectedMiddle(id);
    const res = await axios.get(`/api/categories/${id}`);
    setSmall(res.data || []);
  };

  // 소분류 선택
  const handleSmallSelect = (id) => {
    setOpen(false);
    navigate(`/category/${id}`);
  };

  return (
    <div className="product-list-wrapper" style={{ position: "relative" }}>
      <div className="product-list-header">
        <div className="product-list-title-wrapper">
          <h2 className="product-list-title">오늘의 추천 물품</h2>

          {/* ☰ 카테고리 열기 */}
          <svg
            className="menu-icon"
            id="menuToggle"
            viewBox="0 0 24 24"
            aria-label="카테고리 열기"
            role="button"
            tabIndex="0"
            onClick={toggleMenu}
          >
            <rect y="4" width="24" height="2"></rect>
            <rect y="11" width="24" height="2"></rect>
            <rect y="18" width="24" height="2"></rect>
          </svg>
        </div>

        <select
          className="category-dropdown"
          value={selectedCategory}
          onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
        >
          <option value="used">중고</option>
          <option value="auction">경매</option>
        </select>
      </div>

      {/* ✅ 카테고리 메뉴 박스 */}
      {open && (
        <div className="menu-box active" ref={menuRef}>
          <div className="menu-category">
            <h3>대분류</h3>
            <ul>
              {large.map((cat) => (
                <li
                  key={cat.id}
                  onClick={() => handleLargeSelect(cat.id)}
                  className={selectedLarge === cat.id ? "active" : ""}
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>

          {selectedLarge && (
            <div className="menu-category">
              <h3>중분류</h3>
              <ul>
                {middle.map((cat) => (
                  <li
                    key={cat.id}
                    onClick={() => handleMiddleSelect(cat.id)}
                    className={selectedMiddle === cat.id ? "active" : ""}
                  >
                    {cat.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedMiddle && (
            <div className="menu-category">
              <h3>소분류</h3>
              <ul>
                {small.map((cat) => (
                  <li
                    key={cat.id}
                    onClick={() => handleSmallSelect(cat.id)}
                  >
                    {cat.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ✅ 상품 리스트 */}
      <div className="product-list" id="productList">
        {products.length > 0 ? (
          products.map((product) => {
            const id = product.id ?? product.postId;
            const link =
              selectedCategory === "auction"
                ? `/auction/detail/${id}`
                : product.detailUrl || `/products/detail/${id}`;
            const badge = selectedCategory === "auction" ? "경매" : undefined;
            const endsAt = product.endsAt ?? product.endTime ?? undefined;

            return (
              <ProductCard
                key={id}
                product={product}
                mode={selectedCategory}
                link={link}
                badge={badge}
                endsAt={endsAt}
              />
            );
          })
        ) : (
          <div className="product-list-empty">표시할 상품이 없습니다.</div>
        )}
      </div>
    </div>
  );
}

export default ProductList;
