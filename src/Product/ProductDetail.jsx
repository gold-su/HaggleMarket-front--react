// src/Product/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode"; // 추가
import LikeHeart from "../like/LikeHeart";
import "../ProductCSS/ProductDetail.css";
import { PRODUCT_STATUS_LABEL } from "../Product/productStatus.js";

function ProductDetail() {
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  // 상세 조회 (항상 토큰 포함해서 요청)
  const fetchDetail = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await axios.get(`/api/products/detail/${postId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      setProduct(res.data);
    } catch (e) {
      console.error(e);
      setError("상품 정보를 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [postId]);

  if (error) return <div>{error}</div>;
  if (!product) return <div>로딩 중...</div>;

  const imageList = (
    product.images?.length
      ? product.images.map((p) => `http://localhost:8080${p}`)
      : []
  ).concat(
    product.thumbnail ? [`http://localhost:8080${product.thumbnail}`] : [],
    product.imageUrl ? [`http://localhost:8080${product.imageUrl}`] : []
  );

  const displayMain = mainImage || imageList[0] || "/images/default.jpg";
  const createdAtText =
    typeof product.createdAt === "string" ? product.createdAt.slice(0, 10) : "";

  // 소유자 판별: 서버 mine/isMine + 토큰 비교(백업)
  const token = localStorage.getItem("jwtToken");
  let myNo = null;
  try {
    myNo = token ? jwtDecode(token)?.userNo : null;
  } catch {}
  const isMineFromToken =
    myNo != null &&
    product?.seller?.userNo != null &&
    Number(myNo) === Number(product.seller.userNo);
  const canEdit =
    (product?.mine ?? product?.isMine ?? false) || isMineFromToken;

  return (
    <div className="product-page">
      <div className="product-detail">
        {/* 좌측 이미지 영역 */}
        <div className="product-media">
          <div className="product-image">
            <img
              src={displayMain}
              alt={product.title}
              onError={(e) => {
                e.currentTarget.src = "/images/default.jpg";
              }}
            />
          </div>

          {imageList.length > 1 && (
            <div className="product-thumbs">
              {imageList.map((img, idx) => (
                <button
                  key={idx}
                  className={`product-thumb ${
                    displayMain === img ? "active" : ""
                  }`}
                  onClick={() => setMainImage(img)}
                  aria-label={`이미지 ${idx + 1}`}
                >
                  <img
                    src={img}
                    alt={`썸네일 ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = "/images/default.jpg";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 우측 정보 영역 */}
        <div className="product-info">
          <h2>{product.title}</h2>
          <div className="price">
            {Number(product.cost ?? 0).toLocaleString()}원
          </div>

          {/* 상단 통계 - 항상 DB 값 */}
          <div className="stats">
            ❤️ {product.likeCount ?? 0} &nbsp; 👁 {product.hit} &nbsp; 📅{" "}
            {createdAtText}
          </div>

          <ul className="details">
            <li>
              <strong>상품상태:</strong>{" "}
              {PRODUCT_STATUS_LABEL[product.productStatus] ||
                product.productStatus}
            </li>
            <li>
              <strong>설명:</strong> {product.content}
            </li>
            <li>
              <strong>배송비:</strong> {product.deliveryFee ? "있음" : "없음"}
            </li>
            <li>
              <strong>직거래지역:</strong> {product.seller?.address || "-"}
            </li>
          </ul>

          <div className="buttons">
            {/* 텍스트 버튼, 버튼 자체엔 카운트 숨김, 토글 후 상세 재조회로 DB값 반영 */}
            <LikeHeart
              postId={postId}
              initialLiked={product?.likedByMe ?? false}
              initialCount={product?.likeCount ?? 0}
              textMode
              showCount={false}
              onChanged={() => fetchDetail()}
            />
            <button className="chat">해글톡</button>
            <button className="buy">즉시구매</button>

            {/* 수정하기: 서버 mine/isMine 또는 토큰비교가 true면 노출 */}
            {canEdit && (
              <button
                className="edit"
                onClick={() => navigate(`/products/edit/${postId}`)}
              >
                수정하기
              </button>
            )}
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
            <div className="card-content">{product.seller?.address || "-"}</div>
          </div>
          <div className="card">
            <div className="card-title">📂 카테고리</div>
            <div className="card-content">{product.categoryPath || "-"}</div>
          </div>
          <div className="card">
            <div className="card-title">🏷️ 상품태그</div>
            <div className="card-content">{product.tag || "-"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
