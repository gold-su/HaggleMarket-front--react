// src/Shop/ProductManagementPage.jsx
import React, { useState, useEffect } from 'react';
import styles from '../ShopCSS/ProductManagementPage.module.css';

const PRODUCT_STATUSES = ['전체', '판매중', '예약중', '거래완료', '숨김'];
const PRODUCT_TYPES = ['전체 상품', '중고', '경매'];

function ProductManagementPage() {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('판매중');
  const [productType, setProductType] = useState('전체 상품');

  const [products, setProducts] = useState([]);

  useEffect(() => {
    const allDummyProducts = [
      { id: 1, image: 'https://via.placeholder.com/80', name: '나이키 에어 포스 1', price: '55,000', status: '판매중', likes: 12, comments: 3, type: '중고' },
      { id: 2, image: 'https://via.placeholder.com/80', name: '빈티지 레코드 플레이어', price: '200,000', status: '판매중', likes: 20, comments: 5, type: '경매' },
    ];

    let filtered = allDummyProducts.filter(p => activeTab === '전체' || p.status === activeTab);
    if (productType !== '전체 상품') filtered = filtered.filter(p => p.type === productType);
    setProducts(filtered);
  }, [activeTab, productType]);

  const handleSearch = e => {
    e.preventDefault();
    console.log('검색:', search);
  };

  return (
    <div className={styles.productManagementPage}>
      <h2 className={styles.pageTitle}>내 상점 관리</h2>

      <div className={styles.tabNav}>
        {PRODUCT_STATUSES.map(tab => (
          <button key={tab} className={`${styles.tabButton} ${activeTab === tab ? styles.active : ''}`} onClick={() => setActiveTab(tab)}>
            {tab}
          </button>
        ))}
      </div>

      <div className={styles.toolbar}>
        <form onSubmit={handleSearch} className={styles.searchForm}>
          <input
            type="text"
            placeholder="상품명을 입력해주세요."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={styles.searchInput}
          />
          <button type="submit" className={styles.searchButton}>검색</button>
        </form>

        <select value={productType} onChange={e => setProductType(e.target.value)} className={styles.dropdown}>
          {PRODUCT_TYPES.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
      </div>

      <table className={styles.productTable}>
        <thead>
          <tr>
            <th>사진</th>
            <th>판매상태</th>
            <th>상품명</th>
            <th>가격</th>
            <th>찜</th>
            <th>기능</th>
          </tr>
        </thead>
        <tbody>
          {products.length === 0 ? (
            <tr><td colSpan={6} className={styles.empty}>등록된 상품이 없습니다</td></tr>
          ) : (
            products.map(prod => (
              <tr key={prod.id}>
                <td><img src={prod.image} alt={prod.name} width={60} /></td>
                <td>{prod.status}</td>
                <td>{prod.name}</td>
                <td>{prod.price}</td>
                <td>{prod.likes}</td>
                <td>
                  <button className={styles.action}>수정</button>
                  <button className={styles.action}>삭제</button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default ProductManagementPage;