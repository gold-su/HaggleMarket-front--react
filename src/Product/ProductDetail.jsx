import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import useLike from '../like/useLike';
import '../ProductCSS/ProductDetail.css';

function ProductDetail() {
  const { id } = useParams();
  const postId = Number(id);

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  // 🔹 항상 호출 (조건 X). product가 아직 없으면 false/0으로 초기화됨.
  const initialLiked = product?.likedByMe ?? false;
  const initialCount = product?.likeCount ?? 0;
  const { liked, count, toggle } = useLike(postId, initialLiked, initialCount);

  // 상품 상세 조회
  useEffect(() => {
    axios.get(`/api/products/detail/${postId}`)
      .then(res => setProduct(res.data))
      .catch(err => {
        console.error(err);
        setError('상품 정보를 불러오지 못했습니다.');
      });
  }, [postId]);

  if (error) return <div>{error}</div>;
  if (!product) return <div>로딩 중...</div>;

  const statusLabelMap = {
    LIKE_NEW: '새 상품',
    USED_GOOD: '사용감 적음',
    USED: '사용감 많음',
    DAMAGED: '고장/파손',
  };

  // 이미지 배열 구성
  const imageList = (product.images?.length ? product.images.map(p => `http://localhost:8080${p}`) : [])
    .concat(
      product.thumbnail ? [`http://localhost:8080${product.thumbnail}`] : [],
      product.imageUrl ? [`http://localhost:8080${product.imageUrl}`] : []
    );

  const displayMain = mainImage || imageList[0] || '/images/default.jpg';
  const createdAtText = typeof product.createdAt === 'string' ? product.createdAt.slice(0, 10) : '';

  return (
    <div className="product-page">
      <div className="product-detail">
        {/* 좌측 이미지 영역 */}
        <div className="product-media">
          <div className="product-image">
            <img
              src={displayMain}
              alt={product.title}
              onError={(e) => { e.currentTarget.src = '/images/default.jpg'; }}
            />
          </div>

          {imageList.length > 1 && (
            <div className="product-thumbs">
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  className={`product-thumb ${displayMain === img ? 'active' : ''}`}
                  onClick={() => setMainImage(img)}
                  aria-label={`이미지 ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`썸네일 ${idx + 1}`}
                    onError={(e) => { e.currentTarget.src = '/images/default.jpg'; }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 우측 정보 영역 */}
        <div className="product-info">
          <h2>{product.title}</h2>
          <div className="price">{Number(product.cost ?? 0).toLocaleString()}원</div>

          {/* 상단 통계에 찜 수 표시 */}
          <div className="stats">
            ❤️ {count} &nbsp; 👁 {product.hit} &nbsp; 📅 {createdAtText}
          </div>

          <ul className="details">
            <li><strong>상품상태:</strong> {statusLabelMap[product.productStatus] || product.productStatus}</li>
            <li><strong>설명:</strong> {product.content}</li>
            <li><strong>배송비:</strong> {product.deliveryFee ? '있음' : '없음'}</li>
            <li><strong>직거래지역:</strong> {product.seller?.address || '-'}</li>
          </ul>

          <div className="buttons">
            {/* 찜 버튼: 숫자 보이게 + 토글 */}
            <button
              className={`wish ${liked ? 'on' : ''}`}
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
              aria-pressed={liked}
              title={liked ? '찜 해제' : '찜하기'}
            >
              {liked ? '♥' : '♡'} 찜 {count}
            </button>

            <button className="chat">해글톡</button>
            <button className="buy">즉시구매</button>
          </div>
        </div>
      </div>

      {/* 하단 추가 정보 */}
      <div className="product-extra-info">
        <h3>상품정보</h3>
        <div className="divider" />
        <div className="product-description">{product.content}</div>
        <div className="divider" />
        <div className="product-extra-cards">
          <div className="card">
            <div className="card-title">📍 직거래지역</div>
            <div className="card-content">{product.seller?.address || '-'}</div>
          </div>
          <div className="card">
            <div className="card-title">📂 카테고리</div>
            <div className="card-content">{product.categoryPath || '-'}</div>
          </div>
          <div className="card">
            <div className="card-title">🏷️ 상품태그</div>
            <div className="card-content">{product.tag || '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
