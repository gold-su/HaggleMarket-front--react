// src/Product/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import LikeHeart from "../like/LikeHeart";
import "../ProductCSS/ProductDetail.css";
import { PRODUCT_STATUS_LABEL } from "../Product/productStatus.js";
import { createChatRoom } from "../api/chat";

function ProductDetail() {
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);

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
          <div className="product-detail-image">
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
              <strong>배송비:</strong> {product.deliveryFee ? "있음" : "없음"}
            </li>
            <li>
              <strong>직거래지역:</strong> {product.seller?.address || "-"}
            </li>
          </ul>

          <div className="buttons">
            <LikeHeart
              postId={postId}
              initialLiked={product?.likedByMe ?? false}
              initialCount={product?.likeCount ?? 0}
              textMode
              showCount={false}
              onChanged={() => fetchDetail()}
            />
            <button
              className="chat"
              onClick={async () => {
                try {
                  const token = localStorage.getItem("jwtToken");
                  if (!token) {
                    alert("로그인이 필요합니다.");
                    navigate("/login");
                    return;
                  }

                  // const sellerUserNo = product?.seller?.userNo;
                  // if (!sellerUserNo) {
                  //   alert("판매자 정보를 불러올 수 없습니다.");
                  //   return;
                  // }

                  console.log("🟢 product.id =", product.postId);

                  const data = await createChatRoom({
                    roomKind: "POST", // ✅ 중고거래
                    postId: product.postId, // ✅ 상품 ID 추가
                  });

                  alert("채팅방이 생성되었습니다.");
                  navigate(`/chat?roomId=${data.roomId}`);
                } catch (err) {
                  console.error(err);
                  alert("채팅방 생성 중 오류가 발생했습니다.");
                }
              }}
            >
              해글톡
            </button>

            <button className="buy">즉시구매</button>

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
      {/* 10월 1일 추가 부분 */}
      {/* 하단 추가 정보 */}
      {/* ───────────── 판매자 정보 스트립 (상품설명 아래) ───────────── */}
      <div
        className="seller-info-strip"
        role="contentinfo"
        aria-label="판매자 정보"
      >
        {/* 아바타 + 판매자명 */}
        <div className="seller-left">
          <img
            className="seller-avatar"
            src={
              product?.seller?.profileImageUrl ||
              product?.seller?.avatarUrl ||
              "/images/default-avatar.png"
            }
            alt="판매자 프로필"
            onError={(e) => {
              e.currentTarget.src = "/images/default-avatar.png";
            }}
          />
          <div className="seller-meta">
            <div className="seller-name">
              {product?.seller?.nickname ||
                product?.seller?.userName ||
                product?.seller?.name ||
                "판매자"}
              {product?.seller?.verified ? (
                <span className="seller-badge">본인인증</span>
              ) : null}
            </div>
            <div className="seller-stats">
              <span>상품 {product?.seller?.productCount ?? 0}</span>
              <span>평점 {product?.seller?.rating ?? "N/A"}</span>
            </div>
            <div className="seller-addr">{product?.seller?.address || "-"}</div>
          </div>
        </div>

        {/* 판매자의 다른 상품(최대 3개 썸네일) */}
        <div className="seller-middle">
          {(product?.seller?.otherProducts ?? []).slice(0, 3).map((p, i) => (
            <a
              key={p.id ?? i}
              className="seller-thumb"
              href={`/products/detail/${p.id ?? ""}`}
              onClick={(e) => {
                if (!p.id) e.preventDefault();
              }}
              title={p.title ?? "상품"}
            >
              <img
                src={p.thumbnailUrl || p.imageUrl || "/images/default.jpg"}
                alt={p.title ?? "상품"}
                onError={(e) => {
                  e.currentTarget.src = "/images/default.jpg";
                }}
              />
              <span className="seller-thumb-price">
                {Number(p.price ?? p.cost ?? 0).toLocaleString()}원
              </span>
            </a>
          ))}
        </div>

        {/* 액션 버튼 영역 */}
        <div className="seller-right">
          <button
            type="button"
            className="seller-btn store"
            onClick={() => alert("상점 이동은 나중에 라우팅 연결하세요.")}
          >
            상점 보기
          </button>
        </div>
      </div>
      <div className="product-extra-info">
        <h3>상품정보</h3>
        <div className="divider" />
        <div className="product-description">{product.content}</div>
        {/* 10월 1일 추가 부분 여기까지 */}
        {/* 하단 추가 정보 */}
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
