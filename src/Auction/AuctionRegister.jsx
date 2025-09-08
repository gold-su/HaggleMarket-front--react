// src/Auction/AuctionRegister.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { whoAmI } from "../api/auction";
import stylesLayout from "../AuctionCSS/AuctionRegisterLayout.module.css";
import stylesForm from "../AuctionCSS/AuctionRegisterForm.module.css";
import stylesButtons from "../AuctionCSS/AuctionRegisterButtons.module.css";
import { createAuctionPost, uploadAuctionImages } from "../api/auction";

// 데모 카테고리 (필요시 교체)
const categoriesData = {
  "디지털/가전": { 휴대폰: ["갤럭시", "아이폰"], 노트북: ["맥북", "그램"] },
  "의류/잡화": { 패션잡화: ["가방", "지갑", "시계"], 의류: ["상의", "하의"] },
};

function AuctionRegister() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("[auth] token present?", !!token);

    whoAmI()
      .then((me) => {
        console.log("[auth] /api/auth/me =>", me);
        if (!me?.authenticated) {
          alert("로그인이 필요합니다.");
        }
      })
      .catch((e) => {
        console.log("[auth] me error", e?.response?.status, e?.response?.data);
      });
  }, []);

  // 이미지: File과 미리보기 URL 둘 다 관리
  const [imageFiles, setImageFiles] = useState([]); // File[]
  const [imagePreviews, setImagePreviews] = useState([]); // string[]
  const maxImages = 12;

  // 기본 정보
  const [auctionTitle, setAuctionTitle] = useState("");
  const [auctionContent, setAuctionContent] = useState("");
  const [selectedLargeCategory, setSelectedLargeCategory] = useState("");
  const [selectedMiddleCategory, setSelectedMiddleCategory] = useState("");
  const [selectedSmallCategory, setSelectedSmallCategory] = useState("");
  // 경매 정보
  const [startCost, setStartCost] = useState("");
  const [buyoutCost, setBuyoutCost] = useState("");
  const [startTime, setStartTime] = useState(""); // yyyy-MM-ddTHH:mm
  const [endTime, setEndTime] = useState("");

  // 상태
  const [submitting, setSubmitting] = useState(false);

  const categoryText = useMemo(() => {
    const parts = [
      selectedLargeCategory,
      selectedMiddleCategory,
      selectedSmallCategory,
    ].filter(Boolean);
    return parts.join(" > ");
  }, [selectedLargeCategory, selectedMiddleCategory, selectedSmallCategory]);

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const allowed = files.filter(
      (f) => /image\/(png|jpeg|jpg)/i.test(f.type) && f.size <= MAX_SIZE
    );
    if (allowed.length < files.length) {
      alert("PNG/JPG만 가능하며, 파일당 5MB 이하만 업로드됩니다.");
    }
    const nextFiles = [...imageFiles, ...allowed].slice(0, maxImages);
    const newPreviews = nextFiles.map((f) => URL.createObjectURL(f));

    setImageFiles(nextFiles);
    setImagePreviews(newPreviews);
  };

  const handleRemoveImage = (idx) => {
    const nextFiles = imageFiles.filter((_, i) => i !== idx);
    const nextPreviews = imagePreviews.filter((_, i) => i !== idx);
    setImageFiles(nextFiles);
    setImagePreviews(nextPreviews);
  };

  // 카테고리 핸들러
  const handleLargeCategoryClick = (cat) => {
    setSelectedLargeCategory(cat);
    setSelectedMiddleCategory("");
    setSelectedSmallCategory("");
  };
  const handleMiddleCategoryClick = (cat) => {
    setSelectedMiddleCategory(cat);
    setSelectedSmallCategory("");
  };
  const handleSmallCategoryClick = (cat) => setSelectedSmallCategory(cat);

  // 프론트 유효성 검증
  const validate = () => {
    if (!auctionTitle.trim()) return "상품명을 입력해 주세요.";
    if (!auctionContent.trim() || auctionContent.trim().length < 10)
      return "상품 설명은 10자 이상 입력해 주세요.";
    // if (!selectedLargeCategory) return '대분류를 선택해 주세요.'; 카테고리 임시로 빼둠
    if (!startCost || Number(startCost) <= 0)
      return "시작가를 올바르게 입력해 주세요.";
    if (buyoutCost && Number(buyoutCost) <= Number(startCost))
      return "즉시 구매가는 시작가보다 커야 합니다.";
    if (!startTime || !endTime)
      return "경매 시작/종료 시간을 모두 입력해 주세요.";
    const st = new Date(startTime);
    const et = new Date(endTime);
    if (isNaN(st.getTime()) || isNaN(et.getTime()))
      return "시간 형식을 확인해 주세요.";
    if (st >= et) return "종료 시간은 시작 시간보다 늦어야 합니다.";
    if (!imageFiles.length) return "이미지는 최소 1장 이상 등록해 주세요.";
    if (imageFiles.length > maxImages)
      return `이미지는 최대 ${maxImages}장까지 등록 가능합니다.`;
    return null;
  };

  // TODO: 실제 로그인/세션에서 userNo 받아오기
  const userNo = 1; // 데모: 고정.

  const handleSubmitAuction = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      alert(err);
      return;
    }

    try {
      setSubmitting(true);

      // 1) 본문 생성
      const { auctionId, message } = await createAuctionPost({
        title: auctionTitle.trim(),
        content: auctionContent.trim(), //카테고리 임시 빼둠
        startCost,
        buyoutCost: buyoutCost || null,
        startTime,
        endTime,
      });

      // 2) 이미지 업로드 (정렬 순서: 현재 배열 순서를 1부터 부여)
      const sortOrder = imageFiles.map((_, i) => i + 1);
      await uploadAuctionImages(auctionId, imageFiles, sortOrder);

      alert(message ?? "경매 상품이 등록되었습니다.");
      navigate(`/auction/detail/${auctionId}`);
    } catch (e) {
      console.error(e);
      alert(
        "일부 단계에서 오류가 발생했습니다. 이미지 재업로드를 시도해주세요."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    // 간단 예시: localStorage 임시저장
    const draft = {
      auctionTitle,
      auctionContent,
      selectedLargeCategory,
      selectedMiddleCategory,
      selectedSmallCategory,
      startCost,
      buyoutCost,
      startTime,
      endTime,
      // 이미지 File은 직렬화 불가 → 필요하면 IndexedDB 사용
    };
    localStorage.setItem("auction_draft", JSON.stringify(draft));
    alert("임시 저장되었습니다.");
  };

  // previews가 바뀔 때 이전 URL 해제
  useEffect(() => {
    return () => {
      imagePreviews.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [imagePreviews]);

  return (
    <div className={stylesLayout.auctionRegisterPage}>
      <main className={stylesLayout.mainContent} role="main">
        <form
          onSubmit={handleSubmitAuction}
          id="auction-register-form"
          noValidate
        >
          <section className={stylesLayout.section}>
            <h1 className={stylesLayout.pageTitle}>경매 상품 등록</h1>
            <h2 className={stylesLayout.sectionTitle}>경매 상품 정보 입력</h2>

            <ul className={stylesLayout.formGroups}>
              {/* 이미지 업로드 */}
              <li className={stylesLayout.formGroup}>
                <div className={stylesLayout.formLabel}>
                  상품 이미지{" "}
                  <small>
                    ({imageFiles.length}/{maxImages})
                  </small>
                </div>
                <div className={stylesLayout.formContent}>
                  <ul className={stylesForm.imageUploadList}>
                    <li
                      className={`${stylesForm.imageUploadItem} ${stylesForm.addImage}`}
                    >
                      <label htmlFor="image-upload-input">
                        <span>이미지 등록</span>
                      </label>
                      <input
                        id="image-upload-input"
                        type="file"
                        accept="image/jpg, image/jpeg, image/png"
                        multiple
                        onChange={handleImageChange}
                        style={{ display: "none" }}
                      />
                    </li>
                    {imagePreviews.map((src, idx) => (
                      <li
                        key={idx}
                        className={`${stylesForm.imageUploadItem} ${stylesForm.imagePreviewItem}`}
                      >
                        <img src={src} alt={`상품 이미지 ${idx + 1}`} />
                        <button
                          type="button"
                          className={stylesForm.removeImageButton}
                          onClick={() => handleRemoveImage(idx)}
                          aria-label="이미지 삭제"
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                  {/* 안내 문구에서 '썸네일 클릭 → 1번 이동' 문구 제거 */}
                  <div className={stylesForm.formHint}>
                    최대 {maxImages}장, PNG/JPG만 가능.
                  </div>
                </div>
              </li>

              {/* 상품명 */}
              <li className={stylesLayout.formGroup}>
                <div className={stylesLayout.formLabel}>상품명</div>
                <div className={stylesLayout.formContent}>
                  <input
                    type="text"
                    className={stylesForm.formInput}
                    placeholder="경매 상품명을 입력해 주세요."
                    maxLength={50}
                    value={auctionTitle}
                    onChange={(e) => setAuctionTitle(e.target.value)}
                    required
                  />
                  <div className={stylesForm.charCounter}>
                    {auctionTitle.length}/50
                  </div>
                </div>
              </li>

              {/* 카테고리 */}
              <li className={stylesLayout.formGroup}>
                <div className={stylesLayout.formLabel}>카테고리</div>
                <div
                  className={`${stylesLayout.formContent} ${stylesForm.categorySelectionArea}`}
                >
                  {/* 대분류 */}
                  <div className={stylesForm.categoryColumn}>
                    <ul className={stylesForm.categoryList}>
                      {Object.keys(categoriesData).map((cat) => (
                        <li
                          key={cat}
                          className={`${stylesForm.categoryItem} ${
                            selectedLargeCategory === cat
                              ? stylesForm.active
                              : ""
                          }`}
                        >
                          <button
                            type="button"
                            onClick={() => handleLargeCategoryClick(cat)}
                          >
                            {cat}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  {/* 중분류 */}
                  <div className={stylesForm.categoryColumn}>
                    <ul className={stylesForm.categoryList}>
                      {selectedLargeCategory ? (
                        Object.keys(categoriesData[selectedLargeCategory]).map(
                          (cat) => (
                            <li
                              key={cat}
                              className={`${stylesForm.categoryItem} ${
                                selectedMiddleCategory === cat
                                  ? stylesForm.active
                                  : ""
                              }`}
                            >
                              <button
                                type="button"
                                onClick={() => handleMiddleCategoryClick(cat)}
                              >
                                {cat}
                              </button>
                            </li>
                          )
                        )
                      ) : (
                        <li
                          className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}
                        >
                          중분류
                        </li>
                      )}
                    </ul>
                  </div>
                  {/* 소분류 */}
                  <div className={stylesForm.categoryColumn}>
                    <ul className={stylesForm.categoryList}>
                      {selectedLargeCategory && selectedMiddleCategory ? (
                        categoriesData[selectedLargeCategory][
                          selectedMiddleCategory
                        ].map((cat) => (
                          <li
                            key={cat}
                            className={`${stylesForm.categoryItem} ${
                              selectedSmallCategory === cat
                                ? stylesForm.active
                                : ""
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => handleSmallCategoryClick(cat)}
                            >
                              {cat}
                            </button>
                          </li>
                        ))
                      ) : (
                        <li
                          className={`${stylesForm.categoryItem} ${stylesForm.placeholder}`}
                        >
                          소분류
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
                {categoryText && (
                  <div className={stylesForm.formHint}>
                    선택됨: {categoryText}
                  </div>
                )}
              </li>

              {/* 시작가 */}
              <li className={stylesLayout.formGroup}>
                <div className={stylesLayout.formLabel}>시작가</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.priceInputWrapper}>
                    <input
                      type="number"
                      className={`${stylesForm.formInput} ${stylesForm.priceInput}`}
                      placeholder="경매 시작가를 입력해 주세요."
                      value={startCost}
                      onChange={(e) => setStartCost(e.target.value)}
                      min="1"
                      required
                    />
                    <span className={stylesForm.currency}>원</span>
                  </div>
                </div>
              </li>

              {/* 즉시 구매가 (선택) */}
              <li className={stylesLayout.formGroup}>
                <div className={stylesLayout.formLabel}>즉시 구매가 (선택)</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.priceInputWrapper}>
                    <input
                      type="number"
                      className={`${stylesForm.formInput} ${stylesForm.priceInput}`}
                      placeholder="즉시 구매가를 입력해 주세요."
                      value={buyoutCost}
                      onChange={(e) => setBuyoutCost(e.target.value)}
                      min={startCost ? Number(startCost) + 1 : 1}
                    />
                    <span className={stylesForm.currency}>원</span>
                  </div>
                </div>
              </li>

              {/* 시간 */}
              <li className={stylesLayout.formGroup}>
                <div className={stylesLayout.formLabel}>경매 시작 시간</div>
                <div className={stylesLayout.formContent}>
                  <input
                    type="datetime-local"
                    className={stylesForm.formInput}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
              </li>
              <li className={stylesLayout.formGroup}>
                <div className={stylesLayout.formLabel}>경매 종료 시간</div>
                <div className={stylesLayout.formContent}>
                  <input
                    type="datetime-local"
                    className={stylesForm.formInput}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </li>

              {/* 설명 */}
              <li className={stylesLayout.formGroup}>
                <div className={stylesLayout.formLabel}>상품 설명</div>
                <div className={stylesLayout.formContent}>
                  <textarea
                    className={stylesForm.formTextarea}
                    value={auctionContent}
                    onChange={(e) => setAuctionContent(e.target.value)}
                    placeholder="경매 상품 설명을 입력해주세요. (10자 이상)"
                    rows={8}
                    required
                    minLength={10}
                  />
                  <div className={stylesForm.charCounter}>
                    {auctionContent.length}/2000
                  </div>
                </div>
              </li>
            </ul>
          </section>
        </form>
      </main>

      <footer className={stylesLayout.registerFooter}>
        <div className={stylesLayout.inner}>
          <div className={stylesButtons.btnGroup}>
            <button
              type="button"
              className={stylesButtons.btnDraft}
              onClick={handleSaveDraft}
            >
              임시저장
            </button>
            <button
              type="submit"
              form="auction-register-form"
              className={stylesButtons.btnSubmit}
            >
              등록하기
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AuctionRegister;
