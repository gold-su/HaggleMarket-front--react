import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../ProductCSS/ProductDetail.css'

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`/api/products/detail/${id}`)
      .then((res) => setProduct(res.data))
      .catch((err) => {
        console.error(err);
        setError('상품 정보를 불러오지 못했습니다.');
      });
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!product) return <div>로딩 중...</div>;

  return (
    <div className="product-page">
      <div className="product-detail">
        <div className="product-image">
          <img
            src={`http://localhost:8080${product.imageUrl}`}
            alt={product.title}
            onError={(e) => { e.target.src = '/images/default.jpg'; }}
          />
        </div>

        <div className="product-info">
          <h2>{product.title}</h2>
          <div className="price">{product.cost.toLocaleString()}원</div>
          <div className="stats">❤️ 6 👁 {product.hit} 📅 {product.createdAt?.slice(0,10)}</div>
          <ul className="details">
            <li><strong>상품상태:</strong> {product.productStatus}</li>
            <li><strong>설명:</strong> {product.content}</li>
            <li><strong>배송비:</strong> {product.deliveryFee ? '있음' : '없음'}</li>
            <li><strong>직거래지역:</strong> {product.seller.address}</li>
          </ul>

          <div className="buttons">
            <button className="wish">찜 6</button>
            <button className="chat">해글톡</button>
            <button className="buy">즉시구매</button>
          </div>
        </div>
      </div>

      <div className="product-extra-info">
        <h3>상품정보</h3>
        <div className="divider" />
        <div className="product-description">{product.content}</div>
        <div className="divider" />
        <div className="product-extra-cards">
          <div className="card">
            <div className="card-title">📍 직거래지역</div>
            <div className="card-content">{product.seller.address}</div>
          </div>
          <div className="card">
            <div className="card-title">📂 카테고리</div>
            <div className="card-content">{product.category || '-'}</div>
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
