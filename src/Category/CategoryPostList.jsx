// src/Category/CategoryPostList.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ProductCard from "../MainPages/ProductCard";
import { PRODUCT_STATUS_LABEL } from "../Product/productStatus.js";

export default function CategoryPostList() {
  const { categoryId } = useParams();
  const [posts, setPosts] = useState([]);
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        // ✅ 1) 카테고리 이름 불러오기
        const catRes = await axios.get(`/api/categories/detail/${categoryId}`);
        setCategoryName(catRes.data?.name || "");

        // ✅ 2) 게시글 불러오기
        const postRes = await axios.get(`/api/categories/${categoryId}/posts`);
        const mapped = postRes.data.map((post) => ({
          id: post.postId,
          title: post.title,
          content: PRODUCT_STATUS_LABEL[post.productStatus] || "",
          price: post.cost?.toLocaleString() + "원",
          imageUrl: post.thumbnail,
          detailUrl: `/products/detail/${post.postId}`,
        }));
        setPosts(mapped);
      } catch (err) {
        console.error("카테고리 게시글 조회 실패:", err);
        setPosts([]);
      }
    };

    loadData();
  }, [categoryId]);

  return (
    <div style={{ maxWidth: 1200, margin: "0px auto", padding: "0 16px" }}>
      {/* ✅ 헤더 영역 */}
      <h2 style={{ fontSize: "1.5rem", marginBottom: 8 }}>
        {categoryName ? `${categoryName} 카테고리` : "카테고리"}
      </h2>
      <div style={{ marginBottom: 20, opacity: 0.7 }}>
        {posts.length > 0
          ? `총 ${posts.length}건의 상품이 있습니다.`
          : "해당 카테고리의 상품이 없습니다."}
      </div>

      {/* ✅ 카드 리스트 */}
      {posts.length > 0 ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
            gap: 16,
          }}
        >
          {posts.map((post) => (
            <ProductCard
              key={post.id}
              product={post}
              mode="used"
              link={post.detailUrl}
            />
          ))}
        </div>
      ) : (
        <p style={{ opacity: 0.7 }}>표시할 상품이 없습니다.</p>
      )}
    </div>
  );
}
