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

  // ✅ 상품 상세 불러오기
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

  useEffect(() => {
    if (product?.seller) {
      console.log("🧩 판매자 데이터:", product.seller);
    }
  }, [product]);

  // ✅ 판매자 상점 정보 불러오기
  useEffect(() => {
    if (!product) return;
    const sellerNo = product?.seller?.userNo;
    if (!sellerNo) return;
    if (product?.seller?.profileUrl || product?.seller?.shopLoaded) return;

    axios
      .get(`/api/shops/${sellerNo}`)
      .then((res) => {
        setProduct((prev) => ({
          ...prev,
          seller: {
            ...prev.seller,
            ...res.data,
            shopLoaded: true,
          },
        }));
      })
      .catch((err) => console.error("❌ 상점정보 불러오기 실패:", err));
  }, [product]);

  if (error) return <div>{error}</div>;
  if (!product) return <div>로딩 중...</div>;

  // ✅ 이미지 처리
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

  // ✅ 로그인 사용자 번호 확인
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

  // ✅ 프로필 URL 처리
  const resolveProfileUrl = (url) => {
    if (!url || url === "null" || url === "undefined") {
      return "/images/default-avatar.svg";
    }
    if (typeof url === "string" && url.startsWith("/uploads/")) {
      return `http://localhost:8080${url}`;
    }
    return url;
  };

  // ✅ 렌더링
  return (
    <div className="product-page">
      <div className="product-detail">
        {/* 좌측 이미지 */}
        <div className="product-media">
          <div className="product-detail-image">
            <img
              src={displayMain}
              alt={product.title}
              onError={(e) => {
                if (!e.currentTarget.src.includes("default.jpg")) {
                  e.currentTarget.src = "/images/default.jpg";
                }
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
                      if (!e.currentTarget.src.includes("default.jpg")) {
                        e.currentTarget.src = "/images/default.jpg";
                      }
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 우측 상품 정보 */}
        <div className="product-info">
          <h2>{product.title}</h2>
          <div className="price">
            {Number(product.cost ?? 0).toLocaleString()}원
          </div>

          <div className="stats">
            ❤️ {product.likeCount ?? 0} &nbsp; 👁 {product.hit} &nbsp;{" "}
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

                  const data = await createChatRoom({
                    roomKind: "POST",
                    postId: product.postId,
                  });

                  navigate(`/chat?roomId=${data.roomId}`);
                } catch (err) {
                  console.error(err);
                  alert("채팅방 생성 중 오류가 발생했습니다.");
                }
              }}
            >
              해글톡
            </button>
          </div>
        </div>
      </div>

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
        {/* ───────────── 판매자 정보 영역 ───────────── */}
        <div className="card seller-card">
          <div className="seller-left">
            <img
              className="seller-avatar"
              src={resolveProfileUrl(product?.seller?.profileUrl)}
              alt="판매자 프로필"
              onError={(e) => {
                if (!e.currentTarget.src.includes("default-avatar.svg")) {
                  e.currentTarget.src = "/images/default-avatar.svg";
                }
              }}
            />
            <div className="seller-meta">
              <div className="seller-name">
                {product?.seller?.nickname || "판매자"}
                {product?.seller?.verified ? (
                  <span className="seller-badge">본인인증</span>
                ) : null}
              </div>
              <div className="seller-stats">
                <span>상품 {product?.seller?.productCount ?? 0}</span>
                <span>
                  {(() => {
                    const opened = product?.seller?.storeOpenedAt;
                    if (!opened) return "운영일 정보 없음";

                    const days =
                      Math.floor(
                        (new Date() - new Date(opened)) / (1000 * 60 * 60 * 24)
                      ) + 1; // 당일 포함
                    return `오픈 ${days}일째`;
                  })()}
                </span>
              </div>
              <div className="seller-addr">
                {product?.seller?.address || "-"}
              </div>
            </div>
            <button
              type="button"
              className="seller-btn store"
              onClick={() => {
                if (Number(product.seller.userNo) === Number(myNo)) {
                  navigate("/myshop");
                } else {
                  navigate(`/shop/${product.seller.userNo}`);
                }
              }}
            >
              {Number(product.seller.userNo) === Number(myNo)
                ? "내 상점"
                : "상점 보기"}
            </button>
          </div>
        </div>

        {/* ───────────── 상품 추가 정보 ───────────── */}
        <div className="product-extra-info">
          <h3>상품정보</h3>
          <div className="divider" />
          <div className="product-description">{product.content}</div>
        </div>
      </div>
    </div>
  );
}

export default ProductDetail;
