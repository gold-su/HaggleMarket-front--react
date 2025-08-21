// src/components/ProductList.jsx
import React from 'react';
import ProductCard from './ProductCard';
import '../MainPagesCSS/productcard.css';

function ProductList({
  products = [],
  selectedCategory = 'used',
  onCategoryChange
}) {
  return (
    <div className="product-list-wrapper">
      <div className="product-list-header">
        <h2 className="product-list-title">오늘의 추천 물품</h2>

        <select
          className="category-dropdown"
          value={selectedCategory}
          onChange={(e) => onCategoryChange && onCategoryChange(e.target.value)}
        >
          <option value="used">중고</option>
          <option value="auction">경매</option>
        </select>
      </div>

      <div className="product-list" id="productList">
        {products.length > 0 ? (
          products.map((product) => {
            const id = product.id ?? product.postId;
            const link =
              selectedCategory === 'auction'
                ? `/auction/detail/${id}`
                : `/product-detail/${id}`;
            const badge = selectedCategory === 'auction' ? '경매' : undefined;
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