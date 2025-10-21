// src/components/ProductList.jsx
import React from "react";
import ProductCard from "./ProductCard";
import "../MainPagesCSS/productcard.css";

// 🔧 [TEST DATA START] — 확인 후 삭제 가능
const mockProducts = [
  {
    id: 1,
    title: "테스트 노트북 상품",
    content: "이것은 테스트용 설명입니다. 경매 및 중고 테스트 중입니다.",
    thumbnailUrl: "/no-image.png",
    price: 155000,
    likeCount: 3,
  },
  {
    id: 2,
    title: "설명 없는 테스트 상품",
    content: "",
    thumbnailUrl: "/no-image.png",
    price: 45000,
    likeCount: 0,
  },
  {
    id: 3,
    title: "긴 제목 테스트 상품 긴 제목 테스트 상품 긴 제목 테스트 상품",
    content: "이 설명은 두 줄을 넘어갈 정도로 길게 작성되어 있습니다. 빈칸 여부를 테스트합니다.",
    thumbnailUrl: "/no-image.png",
    price: 9900,
    likeCount: 2,
  },
];
// 🔧 [TEST DATA END]

function ProductList({
  products = [],
  selectedCategory = "used",
  onCategoryChange,
}) {
  // 🔧 [TEST MODE] — 실제 API 대신 mock 데이터 사용 (삭제 가능)
  const dataToRender = products.length > 0 ? products : mockProducts;

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
        {dataToRender.length > 0 ? (
          dataToRender.map((product) => {
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
