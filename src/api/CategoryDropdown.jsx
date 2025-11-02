// src/components/CategoryDropdownForForm.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import "./CategoryDropdown.css";

function CategoryDropdownForForm({ onSelect, defaultCategoryId }) {
  const [open, setOpen] = useState(false);
  const [largeCategories, setLargeCategories] = useState([]);
  const [middleCategories, setMiddleCategories] = useState([]);
  const [smallCategories, setSmallCategories] = useState([]);

  const [selectedLarge, setSelectedLarge] = useState(null);
  const [selectedMiddle, setSelectedMiddle] = useState(null);
  const [selectedSmall, setSelectedSmall] = useState(null);

  // 대분류 로드
  useEffect(() => {
    axios
      .get("/api/categories/roots")
      .then((res) => setLargeCategories(res.data || []))
      .catch(() => setLargeCategories([]));
  }, []);

  // 중분류 로드
  const handleLargeSelect = async (id) => {
    setSelectedLarge(id);
    setSelectedMiddle(null);
    setSelectedSmall(null);
    try {
      const res = await axios.get(`/api/categories/${id}`);
      setMiddleCategories(res.data || []);
      setSmallCategories([]);
    } catch {
      setMiddleCategories([]);
    }
  };

  // 소분류 로드
  const handleMiddleSelect = async (id) => {
    setSelectedMiddle(id);
    setSelectedSmall(null);
    try {
      const res = await axios.get(`/api/categories/${id}`);
      setSmallCategories(res.data || []);
    } catch {
      setSmallCategories([]);
    }
  };

  const handleSmallSelect = (cat) => {
    setSelectedSmall(cat.id);
    if (onSelect) onSelect(cat.id);

    // ✅ 살짝 늦게 닫기 (렌더링 후)
    setTimeout(() => setOpen(false), 150);
  };
  return (
    <div className="category-dropdown-form-wrapper">
      {/* 버튼 */}
      <button
        type="button"
        className="category-dropdown-btn"
        onClick={() => setOpen((p) => !p)}
      >
        {selectedSmall
          ? `${smallCategories.find((c) => c.id === selectedSmall)?.name || "선택됨"} ▾`
          : "카테고리 선택 ▾"}
      </button>

      {/* 드롭다운 내용 */}
      {open && (
        <div className="category-dropdown-menu">
          <div className="category-column">
            <h4>대분류</h4>
            <ul>
              {largeCategories.map((cat) => (
                <li
                  key={cat.id}
                  className={selectedLarge === cat.id ? "active" : ""}
                  onClick={() => handleLargeSelect(cat.id)}
                >
                  {cat.name}
                </li>
              ))}
            </ul>
          </div>

          {selectedLarge && (
            <div className="category-column">
              <h4>중분류</h4>
              <ul>
                {middleCategories.map((cat) => (
                  <li
                    key={cat.id}
                    className={selectedMiddle === cat.id ? "active" : ""}
                    onClick={() => handleMiddleSelect(cat.id)}
                  >
                    {cat.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {selectedMiddle && (
            <div className="category-column">
              <h4>소분류</h4>
              <ul>
                {smallCategories.map((cat) => (
                  <li key={cat.id} onClick={() => handleSmallSelect(cat)}>
                    {cat.name}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CategoryDropdownForForm;
