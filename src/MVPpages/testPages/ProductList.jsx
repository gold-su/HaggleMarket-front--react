// src/components/ProductList.js
import React from 'react';
import ProductCard from './ProductCard';
import '../testCSS/productcard.css'; // CSS 파일 경로를 맞춰주세요

function ProductList({ products, selectedCategory, onCategoryChange }) {
  return (
    <div className="product-list-wrapper">
      <div className="product-list-header">
        <h2 className="product-list-title">오늘의 추천 물품</h2>
        <select
          className="category-dropdown"
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="used">중고</option>
          <option value="auction">경매</option>
        </select>
      </div>

      <div className="product-list" id="productList">
        {products.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}

export default ProductList;
