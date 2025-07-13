import React from 'react';
import { useParams } from 'react-router-dom';
import './ProductDetail.css';

function ProductDetail({ products }) {
  const { id } = useParams();
  const product = products.find((p) => p.id === parseInt(id));

  if (!product) {
    return <div>상품 정보를 찾을 수 없습니다.</div>;
  }

  return (
    <div className="product-page">
      <div className="product-detail">
        <div className="product-image">
          <img
            src={product.imageUrl?.trim() ? product.imageUrl : '/images/default.jpg'}
            alt={product.title}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/images/default.jpg';
            }}
          />
        </div>

        <div className="product-info">
          <h2>{product.title}</h2>
          <div className="price">{product.price}</div>
          <div className="stats">❤️ 6 👁 299 📅 7일 전</div>
          <ul className="details">
            <li><strong>상품상태:</strong> 상태 아주 좋음</li>
            <li><strong>설명:</strong> 사용감 약간 있음, 충전기 포함</li>
            <li><strong>배송비:</strong> 일반 3,000원</li>
            <li><strong>직거래지역:</strong> 경기도 부천시 원미구 상동</li>
          </ul>

          <div className="buttons">
            <button className="wish">찜 6</button>
            <button className="chat">해글톡</button>
            <button className="buy">즉시구매</button>
          </div>
        </div>
      </div>

      {/* 하단: 상품정보 카드 블록 */}
      <div className="product-extra-info">
        <h3>상품정보</h3>
        <div class="divider" />
        <div class="product-description">
          상품설명란
        </div>
        <div class="divider" />
        <div className="product-extra-cards">
          <div className="card">
            <div className="card-title">📍 직거래지역</div>
            <div className="card-content">{product.location}</div>
          </div>
          <div className="card">
            <div className="card-title">📂 카테고리</div>
            <div className="card-content">{product.category}</div>
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
