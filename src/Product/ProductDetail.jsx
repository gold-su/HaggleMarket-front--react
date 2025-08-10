import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../ProductCSS/ProductDetail.css';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const navigate = useNavigate();
  const token = localStorage.getItem("jwtToken");

  const statusLabelMap = {
    NEW: "새상품",
    USED_LIKE_NEW: "사용감 거의 없음",
    USED: "사용감 있음",
    DAMAGED: "고장/파손 상품"
  };

  useEffect(() => {
    axios.get(`/api/products/detail/${id}`)
      .then((res) => {
        console.log(" 불러온 상품:", res.data);
        setProduct(res.data);
      })
      .catch((err) => {
        console.error(err);
        setError('상품 정보를 불러오지 못했습니다.');
      });
  }, [id]);

  useEffect(() => {
    if (product?.images?.length > 0) {
      setMainImage(product.images[0]);
    }
  }, [product]);

  useEffect(() => {
    axios.post(`/api/products/${id}/hit`, null, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("jwtToken")}`
      }
    })
      .then(() => console.log("조회수 증가됨"))
      .catch(err => console.error("조회수 증가 실패", err));
  }, [id]);

  if (error) return <div>{error}</div>;
  if (!product) return <div>로딩 중...</div>;

  let currentUserNo = null;

  if (token) {
    try {
      const decoded = jwtDecode(token);
      console.log("토큰 payload:", decoded);
      currentUserNo = decoded.userNo; // 숫자 userNo 사용
    } catch (err) {
      console.error("JWT 파싱 실패", err);
    }
  }

  console.log(product.seller)

  return (
    <div className="product-page">
      <div className="product-detail">
        <div className="product-image-box">
          <div className="main-image">
            <img src={`http://localhost:8080${mainImage}`} alt="대표 이미지" />
          </div>
          <div className="thumbnail-list">
            {product.images?.map((img, idx) => (
              <img
                key={idx}
                src={`http://localhost:8080${img}`}
                alt={`썸네일-${idx}`}
                className={`thumbnail-image ${mainImage === img ? 'selected' : ''}`}
                onClick={() => setMainImage(img)}
              />
            ))}
          </div>
        </div>

        <div className="product-info">
          <h2>{product.title}</h2>
          <div className="price">{product.cost.toLocaleString()}원</div>
          <div className="stats">❤️ 6 👁 {product.hit} 📅 {product.createdAt?.slice(0, 10)}</div>
          <ul className="details">
            <li><strong>상품상태:</strong> {statusLabelMap[product.productStatus] || product.productStatus}</li>
            <li><strong>설명:</strong> {product.content}</li>
            <li><strong>배송비:</strong> {product.deliveryFee ? '있음' : '없음'}</li>
            <li><strong>직거래지역:</strong> {product.seller.address}</li>
          </ul>

          <div className="buttons">
            <button className="wish">찜 6</button>
            <button className="chat">해글톡</button>
            <button className="buy">즉시구매</button>
            {currentUserNo && product.seller.userNo === currentUserNo && (
              <button
                className="edit"
                onClick={() => navigate(`/products/edit/${id}`)}
              >
                수정하기
              </button>
            )}
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
