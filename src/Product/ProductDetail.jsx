// src/Product/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import LikeHeart from "../like/LikeHeart";
import "../ProductCSS/ProductDetail.css";

// ✅ 외부 import 없이 파일 내부에 라벨 맵 정의(대소문자 경로문제 회피)
const PRODUCT_STATUS_LABEL = {
  NEW: "새 상품",
  USED_LIKE_NEW: "사용감 없음",
  USED_GOOD: "사용감 적음",
  USED: "사용감 많음",
  DAMAGED: "고장/파손",
};

// ✅ mock 토글: 주소에 http://localhost:3000/products/detail/123?mock=1 붙이면 네트워크 호출 없이 더미로 렌더
const USE_MOCK = new URLSearchParams(window.location.search).has("mock");

function ProductDetail() {
  const { id } = useParams();
  const postId = Number(id);
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [mainImage, setMainImage] = useState(null);

  const fetchDetail = async () => {
    try {
      // ================================
      // ✅ 더미데이터 시작 (언제든 삭제 OK)
      // 위치: ProductDetail.jsx -> fetchDetail() 내부 USE_MOCK 분기
      // ================================
      if (USE_MOCK) {
        const mock = {
          postId,
          title: "더미 상품 제목",
          cost: 19900,
          content:
            "여기는 더미 상세 설명입니다.\n이 블록만 지우면 실제 API만 사용합니다.",
          likeCount: 12,
          hit: 345,
          createdAt: "2025-01-01T12:34:56",
          productStatus: "USED_GOOD",
          deliveryFee: true,
          seller: { userNo: 1, address: "서울특별시 강남구" },
          images: ["/images/default.jpg"],
          thumbnail: "/images/default.jpg",
          imageUrl: null,
          tag: "예시, 더미",
          categoryPath: "카테고리>하위",
        };
        setProduct(mock);
        return;
      }
      // ================================
      // ✅ 더미데이터 끝
      // ================================

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  if (error) return <div>{error}</div>;
  if (!product) return <div>로딩 중...</div>;

  const imageList = (
    product.images?.length
      ? product.images.map((p) =>
        p?.startsWith("http") ? p : `http://localhost:8080${p}`
      )
      : []
  ).concat(
    product.thumbnail
      ? [
        product.thumbnail.startsWith("http")
          ? product.thumbnail
          : `http://localhost:8080${product.thumbnail}`,
      ]
      : [],
    product.imageUrl
      ? [
        product.imageUrl.startsWith("http")
          ? product.imageUrl
          : `http://localhost:8080${product.imageUrl}`,
      ]
      : []
  );

  const displayMain = mainImage || imageList[0] || "/images/default.jpg";
  const createdAtText =
    typeof product.createdAt === "string" ? product.createdAt.slice(0, 10) : "";

  const token = localStorage.getItem("jwtToken");
  let myNo = null;
  try {
    myNo = token ? jwtDecode(token)?.userNo : null;
  } catch { }
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
                  className={`product-thumb ${displayMain === img ? "active" : ""
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
              상품상태: <b>{PRODUCT_STATUS_LABEL[product.productStatus] || product.productStatus}</b>
            </li>
            <li>
              설명: <b>{product.content}</b>
            </li>
            <li>
              배송비: <b>{product.deliveryFee ? "있음" : "없음"}</b>
            </li>
            <li>
              직거래지역: <b>{product.seller?.address || "-"}</b>
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
            <button className="chat">해글톡</button>
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
      <div className="seller-info-strip" role="contentinfo" aria-label="판매자 정보">
        {/* 아바타 + 판매자명 */}
        <div className="seller-left">
          <img
            className="seller-avatar"
            src={
              product?.seller?.profileImageUrl
              || product?.seller?.avatarUrl
              || "/images/default-avatar.png"
            }
            alt="판매자 프로필"
            onError={(e) => { e.currentTarget.src = "/images/default-avatar.png"; }}
          />
          <div className="seller-meta">
            <div className="seller-name">
              {product?.seller?.nickname
                || product?.seller?.userName
                || product?.seller?.name
                || "판매자"}
              {product?.seller?.verified ? <span className="seller-badge">본인인증</span> : null}
            </div>
            <div className="seller-stats">
              <span>상품 {product?.seller?.productCount ?? 0}</span>
              <span>평점 {product?.seller?.rating ?? "N/A"}</span>
            </div>
            <div className="seller-addr">
              {product?.seller?.address || "-"}
            </div>
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
                onError={(e) => { e.currentTarget.src = "/images/default.jpg"; }}
              />
              <span className="seller-thumb-price">
                {(Number(p.price ?? p.cost ?? 0)).toLocaleString()}원
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
        {/* ───────────── /판매자 정보 스트립 ───────────── */}
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
