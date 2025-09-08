// src/MainPages/MenuBox.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../MainPagesCSS/menubox.css';

function MenuBox({ isOpen, onClose, frequentKeywords }) {
  const [categoryTree, setCategoryTree] = useState([]);
  const [openLarge, setOpenLarge] = useState(null); // 열린 대분류 ID
  const [openMiddle, setOpenMiddle] = useState(null); // 열린 중분류 ID
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';

      axios.get('/api/categories/roots')
        .then(async (res) => {
          const roots = res.data;

          const tree = await Promise.all(
            roots.map(async (root) => {
              const middleRes = await axios.get(`/api/categories/${root.id}`);
              const middles = await Promise.all(
                middleRes.data.map(async (middle) => {
                  const smallRes = await axios.get(`/api/categories/${middle.id}`);
                  return {
                    ...middle,
                    children: smallRes.data
                  };
                })
              );
              return {
                ...root,
                children: middles
              };
            })
          );

          setCategoryTree(tree);
        })
        .catch(err => console.error('카테고리 로딩 실패:', err));
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCategoryClick = (categoryId) => {
    navigate(`/category/${categoryId}`);
    onClose();
  };

  const toggleLarge = (id) => {
    setOpenLarge(prev => prev === id ? null : id);
    setOpenMiddle(null); // 대분류 바뀌면 중분류 닫기
  };

  const toggleMiddle = (id) => {
    setOpenMiddle(prev => prev === id ? null : id);
  };

  return (
    <nav className={`menu-box ${isOpen ? 'active' : ''}`} id="menuBox">
      <div className="menu-category">
        <h3>전체 카테고리</h3>
        <ul className="category-tree">
          {categoryTree.map((large) => (
            <li key={large.id}>
              <div className="category-large" onClick={() => toggleLarge(large.id)}>
                ▸ {large.name}
              </div>
              {openLarge === large.id && (
                <ul>
                  {large.children.map((middle) => (
                    <li key={middle.id}>
                      <div className="category-middle" onClick={() => toggleMiddle(middle.id)}>
                        └▸ {middle.name}
                      </div>
                      {openMiddle === middle.id && (
                        <ul>
                          {middle.children.map((small) => (
                            <li key={small.id}>
                              <div
                                className="category-small"
                                onClick={() => handleCategoryClick(small.id)}
                              >
                                &nbsp;&nbsp;&nbsp;&nbsp;└ {small.name}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="menu-category">
        <h3>인기 카테고리</h3>
        <ul>
          {frequentKeywords.map((keyword, index) => (
            <li key={index} onClick={() => handleCategoryClick(keyword.categoryId)}>
              {keyword.name}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}

export default MenuBox;
