import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../MainPagesCSS/productcard.css';
import LikeHeart from '../like/LikeHeart';

function ProductCard({ product }) {
  const navigate = useNavigate();

  // 카드 내부에서 즉시 반영될 로컬 상태
  const [liked, setLiked] = useState(product?.likedByMe ?? product?.liked ?? false);
  const [likeCount, setLikeCount] = useState(product?.likeCount ?? 0);

  // prop이 바뀌면 동기화 (리스트 재로딩/페이지네이션 등)
  useEffect(() => {
    setLiked(product?.likedByMe ?? product?.liked ?? false);
    setLikeCount(product?.likeCount ?? 0);
  }, [product?.likedByMe, product?.liked, product?.likeCount]);

  const handleCardClick = () => {
    navigate(`/product/detail/${product.id}`);
  };

  const initialLiked = liked;
  const initialCount = likeCount;

  // 가격 키 정리: 백엔드가 cost라면 toLocaleString 처리
  const priceText =
    product?.price != null
      ? product.price
      : product?.cost != null
      ? `${Number(product.cost).toLocaleString()}원`
      : '';

  // 이미지 안전 처리
  const imageSrc = product?.imageUrl
    ? `http://localhost:8080${product.imageUrl}`
    : '/images/default.jpg';

  return (
    <div
      className="product-card"
      tabIndex="0"
      onClick={handleCardClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter') handleCardClick();
      }}
      role="button"
      aria-label={`${product.title} 상세로 이동`}
    >
      <img
        src={imageSrc}
        alt={product.title}
        className="product-image"
        onError={(e) => { e.currentTarget.src = '/images/default.jpg'; }}
        draggable="false"
      />

      <div className="product-info">
        <div className="product-title">{product.title}</div>
        <div className="product-description">{product.content || ''}</div>

        <div className="product-price-row">
          <div className="product-price">{priceText}</div>

          {/* 토글 성공 시 카드 로컬 상태 즉시 갱신 */}
          <LikeHeart
            postId={product.id}
            initialLiked={initialLiked}
            initialCount={initialCount}
            onChanged={({ liked: L, count: C }) => {
              setLiked(L);
              setLikeCount(C);
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
