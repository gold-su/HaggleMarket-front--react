import React from 'react';
import { useNavigate } from 'react-router-dom'; // 추가
import '../MainPagesCSS/productcard.css';
import LikeHeart from '../like/LikeHeart';

function ProductCard({ product }) {
  const navigate = useNavigate(); // 훅 초기화

  const handleCardClick = () => {
    console.log("🔍 클릭된 product 객체:", product);
    console.log("➡️ 이동할 postId:", product.id);
    navigate(`/product/detail/${product.id}`); // 상세 페이지 경로 이동
  };

  const initialLiked = product?.likedByMe ?? product?.liked ?? false;
  const initialCount = product?.likeCount ?? 0;

  return (
    <div className="product-card" tabIndex="0" onClick={handleCardClick}>
      <img
        src={`http://localhost:8080${product.imageUrl}`}
        alt={product.title}
        className="product-image"
      />
      <div className="product-info">
        <div className="product-title">{product.title}</div>
        <div className="product-description">{product.content || ''}</div>
        <div className="product-price-row">
          <div className="product-price">{product.price}</div>
          <LikeHeart
            postId={product.id}
            initialLiked={initialLiked}
            initialCount={initialCount}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
