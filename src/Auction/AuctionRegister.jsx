import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { whoAmI, createAuctionPost, uploadAuctionImages } from "../api/auction";

// 💄 새 스타일 (판매하기 페이지와 동일)
import stylesLayout from "../ProductCSS/ProductFormLayout.module.css";
import stylesForm from "../ProductCSS/ProductFormInputs.module.css";
import stylesButtons from "../ProductCSS/ProductFormButtons.module.css";

function AuctionRegister() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  // 인증 체크
  useEffect(() => {
    const token = localStorage.getItem("token");
    console.log("[auth] token present?", !!token);
    whoAmI()
      .then((me) => {
        console.log("[auth] /api/auth/me =>", me);
        if (!me?.authenticated) alert("로그인이 필요합니다.");
      })
      .catch((e) =>
        console.log("[auth] me error", e?.response?.status, e?.response?.data)
      );
  }, []);

  // 이미지
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const maxImages = 12;

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const MAX_SIZE = 5 * 1024 * 1024;
    const allowed = files.filter(
      (f) => /image\/(png|jpeg|jpg)/i.test(f.type) && f.size <= MAX_SIZE
    );
    if (allowed.length < files.length) {
      alert("PNG/JPG만 가능하며, 파일당 5MB 이하만 업로드됩니다.");
    }
    const next = [...imageFiles, ...allowed].slice(0, maxImages);
    const urls = next.map((f) => URL.createObjectURL(f));
    setImageFiles(next);
    setImagePreviews(urls);
  };

  const removePreview = (idx) => {
    setImageFiles((p) => p.filter((_, i) => i !== idx));
    setImagePreviews((p) => p.filter((_, i) => i !== idx));
  };

  // 카테고리
  const [largeCategories, setLargeCategories] = useState([]);
  const [middleCategories, setMiddleCategories] = useState([]);
  const [smallCategories, setSmallCategories] = useState([]);
  const [selectedLarge, setSelectedLarge] = useState(null);
  const [selectedMiddle, setSelectedMiddle] = useState(null);
  const [selectedSmall, setSelectedSmall] = useState(null);

  useEffect(() => {
    axios
      .get("/api/categories/roots")
      .then((res) => setLargeCategories(res.data || []))
      .catch(() => setLargeCategories([]));
  }, []);

  const onLarge = async (id) => {
    setSelectedLarge(id);
    setSelectedMiddle(null);
    setSelectedSmall(null);
    setSmallCategories([]);
    try {
      const res = await axios.get(`/api/categories/${id}`);
      setMiddleCategories(res.data || []);
    } catch {
      setMiddleCategories([]);
    }
  };

  const onMiddle = async (id) => {
    setSelectedMiddle(id);
    setSelectedSmall(null);
    try {
      const res = await axios.get(`/api/categories/${id}`);
      setSmallCategories(res.data || []);
    } catch {
      setSmallCategories([]);
    }
  };

  const categoryText = useMemo(() => {
    const large = largeCategories.find((c) => c.id === selectedLarge)?.name;
    const mid = middleCategories.find((c) => c.id === selectedMiddle)?.name;
    const small = smallCategories.find((c) => c.id === selectedSmall)?.name;
    return [large, mid, small].filter(Boolean).join(" > ");
  }, [
    largeCategories,
    middleCategories,
    smallCategories,
    selectedLarge,
    selectedMiddle,
    selectedSmall,
  ]);

  // 입력 필드
  const [auctionTitle, setAuctionTitle] = useState("");
  const [auctionContent, setAuctionContent] = useState("");
  const [startCost, setStartCost] = useState("");
  const [buyoutCost, setBuyoutCost] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  // 유효성 검사
  const validate = () => {
    if (!auctionTitle.trim()) return "상품명을 입력해 주세요.";
    if (!auctionContent.trim() || auctionContent.length < 10)
      return "상품 설명은 10자 이상 입력해 주세요.";
    if (!selectedSmall) return "카테고리를 선택해 주세요.";
    if (!startCost || Number(startCost) <= 0)
      return "시작가를 올바르게 입력해 주세요.";
    if (buyoutCost && Number(buyoutCost) <= Number(startCost))
      return "즉시 구매가는 시작가보다 커야 합니다.";
    if (!startTime || !endTime)
      return "경매 시작/종료 시간을 모두 입력해 주세요.";
    const st = new Date(startTime);
    const et = new Date(endTime);
    if (st >= et) return "종료 시간은 시작 시간보다 늦어야 합니다.";
    if (!imageFiles.length) return "이미지를 1장 이상 등록해 주세요.";
    return null;
  };

  // 제출
  const handleSubmitAuction = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) return alert(err);

    try {
      setSubmitting(true);
      const { auctionId, message } = await createAuctionPost({
        title: auctionTitle.trim(),
        content: auctionContent.trim(),
        startCost: Number(startCost),
        buyoutCost: buyoutCost ? Number(buyoutCost) : null,
        startTime,
        endTime,
        categoryId: Number(selectedSmall),
      });

      const sortOrder = imageFiles.map((_, i) => i + 1);
      await uploadAuctionImages(auctionId, imageFiles, sortOrder);

      alert(message ?? "경매 상품이 등록되었습니다.");
      navigate(`/auction/detail/${auctionId}`);
    } catch (err) {
      console.error(err);
      alert("등록 중 오류가 발생했습니다.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={stylesLayout.productRegisterPage}>
      <main className={stylesLayout.registerMainContent} role="main">
        <form onSubmit={handleSubmitAuction} noValidate>
          <section className={stylesLayout.registerSection}>
            <h1 className={stylesLayout.registerTitle}>경매 상품 등록</h1>

            <ul className={stylesLayout.formGroups}>
              {/* 이미지 업로드 */}
              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
                <div className={stylesLayout.formLabel}>상품 이미지</div>
                <div className={stylesLayout.formContent}>
                  <ul className={stylesForm.imageUploadList}>
                    <li
                      className={`${stylesForm.imageUploadItem} ${
                        stylesForm.addImage
                      } ${
                        imagePreviews.length >= maxImages
                          ? stylesForm.disabled
                          : ""
                      }`}
                    >
                      <label htmlFor="auction-image-input">
                        <svg
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                          <circle cx="12" cy="13" r="4"></circle>
                        </svg>
                        <span>이미지 등록</span>
                      </label>
                      <input
                        id="auction-image-input"
                        type="file"
                        accept="image/jpg, image/jpeg, image/png"
                        multiple
                        onChange={handleImageChange}
                        disabled={imagePreviews.length >= maxImages}
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
                          onClick={() => removePreview(idx)}
                        >
                          ×
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className={stylesForm.formHint}>
                    최대 {maxImages}장까지 업로드 가능 (PNG/JPG)
                  </div>
                </div>
              </li>

              {/* 상품명 */}
              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
                <div className={stylesLayout.formLabel}>상품명</div>
                <div className={stylesLayout.formContent}>
                  <input
                    type="text"
                    className={stylesForm.formInput}
                    placeholder="경매 상품명을 입력해 주세요."
                    maxLength={50}
                    value={auctionTitle}
                    onChange={(e) => setAuctionTitle(e.target.value)}
                  />
                  <div className={stylesForm.charCounter}>
                    {auctionTitle.length}/50
                  </div>
                </div>
              </li>

              {/* 카테고리 */}
              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
                <div className={stylesLayout.formLabel}>카테고리</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.categorySelectionArea}>
                    {/* 대분류 */}
                    <div className={stylesForm.categoryColumn}>
                      <ul className={stylesForm.categoryList}>
                        {largeCategories.map((cat) => (
                          <li
                            key={cat.id}
                            className={`${stylesForm.categoryItem} ${
                              selectedLarge === cat.id ? stylesForm.active : ""
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => onLarge(cat.id)}
                            >
                              {cat.name}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {/* 중분류 */}
                    <div className={stylesForm.categoryColumn}>
                      {selectedLarge &&
                        middleCategories.map((cat) => (
                          <li
                            key={cat.id}
                            className={`${stylesForm.categoryItem} ${
                              selectedMiddle === cat.id ? stylesForm.active : ""
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => onMiddle(cat.id)}
                            >
                              {cat.name}
                            </button>
                          </li>
                        ))}
                    </div>
                    {/* 소분류 */}
                    <div className={stylesForm.categoryColumn}>
                      {selectedMiddle &&
                        smallCategories.map((cat) => (
                          <li
                            key={cat.id}
                            className={`${stylesForm.categoryItem} ${
                              selectedSmall === cat.id ? stylesForm.active : ""
                            }`}
                          >
                            <button
                              type="button"
                              onClick={() => setSelectedSmall(cat.id)}
                            >
                              {cat.name}
                            </button>
                          </li>
                        ))}
                    </div>
                  </div>
                  {categoryText && (
                    <div className={stylesForm.formHint}>
                      선택됨: {categoryText}
                    </div>
                  )}
                </div>
              </li>

              {/* 시작가 / 즉시구매가 */}
              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
                <div className={stylesLayout.formLabel}>가격</div>
                <div className={stylesLayout.formContent}>
                  <div className={stylesForm.priceRow}>
                    <input
                      type="number"
                      className={stylesForm.formInput}
                      placeholder="시작가"
                      value={startCost}
                      onChange={(e) => setStartCost(e.target.value)}
                      min="1"
                    />
                    <input
                      type="number"
                      className={stylesForm.formInput}
                      placeholder="즉시 구매가 (선택)"
                      value={buyoutCost}
                      onChange={(e) => setBuyoutCost(e.target.value)}
                    />
                  </div>
                </div>
              </li>

              {/* 경매 기간 */}
              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
                <div className={stylesLayout.formLabel}>경매 기간</div>
                <div className={stylesLayout.formContent}>
                  <input
                    type="datetime-local"
                    className={stylesForm.formInput}
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                  <input
                    type="datetime-local"
                    className={stylesForm.formInput}
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>
              </li>

              {/* 상품 설명 */}
              <li
                className={`${stylesLayout.formGroup} ${stylesLayout.formGroupInline} ${stylesLayout.labelW140}`}
              >
                <div className={stylesLayout.formLabel}>상품 설명</div>
                <div className={stylesLayout.formContent}>
                  <textarea
                    className={stylesForm.formTextarea}
                    rows={8}
                    value={auctionContent}
                    onChange={(e) => setAuctionContent(e.target.value)}
                    placeholder="경매 상품 설명을 입력해주세요. (10자 이상)"
                  />
                  <div className={stylesForm.charCounter}>
                    {auctionContent.length}/2000
                  </div>
                </div>
              </li>
            </ul>
          </section>

          <footer className={stylesLayout.registerFooter}>
            <div className={stylesLayout.inner}>
              <div className={stylesButtons.btnGroup}>
                <button type="button" className={stylesButtons.btnDraft}>
                  임시저장
                </button>
                <button
                  type="submit"
                  className={stylesButtons.btnSubmit}
                  disabled={submitting}
                >
                  {submitting ? "등록 중…" : "등록하기"}
                </button>
              </div>
            </div>
          </footer>
        </form>
      </main>
    </div>
  );
}

export default AuctionRegister;
