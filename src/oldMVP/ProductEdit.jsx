import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../ProductCSS/ProductRegisterLayout.css";
import "../ProductCSS/ProductRegisterForm.css";
import "../ProductCSS/ProductRegisterButtons.css";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [productName, setProductName] = useState("");
  const [productStatus, setProductStatus] = useState("LIKE_NEW");
  const [price, setPrice] = useState("");
  const [negotiable, setNegotiable] = useState(false);
  const [exchangeable, setExchangeable] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState("별도");
  const [description, setDescription] = useState("");

  const [existingImageUrls, setExistingImageUrls] = useState([]); // 순수 URL만 저장

  useEffect(() => {
    if (!id) return;
    axios
      .get(`/api/products/detail/${id}`)
      .then((res) => {
        const data = res.data;
        setProductName(data.title);
        setPrice(data.cost);
        setDescription(data.content);
        setProductStatus(data.productStatus);
        setNegotiable(data.negotiable);
        setExchangeable(data.swapping);
        setDeliveryFee(data.deliveryFee ? "포함" : "별도");

        // 기존 이미지 URL (순수) + 미리보기용 URL 모두 세팅
        setExistingImageUrls(data.images);
        setImagePreviews(
          data.images.map((url) => `https://hagglemarket.onrender.com${url}`)
        );
        setImages([]);
      })
      .catch((err) => console.error("게시글 로딩 실패", err));
  }, [id]);

  // 이미지 삭제 버튼 클릭 시
  const handleRemoveImage = (index) => {
    // 만약 삭제하려는 이미지가 기존 이미지라면 existingImageUrls에서도 제거
    if (index < existingImageUrls.length && images.length === 0) {
      // 기존 이미지만 있는 상태
      setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
    } else if (index < existingImageUrls.length) {
      // 기존 이미지 + 새 이미지가 섞여 있는 경우
      setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
    } else {
      // 새로 추가한 이미지
      const newIndex = index - existingImageUrls.length;
      setImages((prev) => prev.filter((_, i) => i !== newIndex));
    }

    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("jwtToken");

    // 1. 새 이미지 파일 업로드
    let uploadedImageUrls = [];
    if (images.length > 0) {
      const formData = new FormData();
      images.forEach((file) => formData.append("images", file));
      const res = await axios.post("/api/products/images", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });
      uploadedImageUrls = res.data; // 서버가 반환한 '/uploads/...' 형태
    }

    // 2. 최종 이미지 URL 리스트 (기존 + 새)
    const finalImageUrls = [...existingImageUrls, ...uploadedImageUrls];

    const updatedPost = {
      title: productName,
      cost: parseInt(price),
      content: description,
      negotiable,
      swapping: exchangeable,
      deliveryFee: deliveryFee === "포함",
      productStatus,
      imageUrls: finalImageUrls, // 반드시 '/uploads/...'
    };

    try {
      await axios.put(`/api/products/${id}`, updatedPost, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      alert("수정 완료!");
      navigate(`/products/detail/${id}`);
    } catch (err) {
      console.error("수정 실패", err);
      alert("수정에 실패했습니다.");
    }
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    // 기존 새 이미지 목록에 추가, 최대 12개
    setImages((prev) => [...prev, ...files].slice(0, 12));
    // 미리보기 URL 생성
    const newPreviews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews((prev) => [...prev, ...newPreviews].slice(0, 12));
  };
  if (!id) return null;

  return (
    <div className="product-register-page">
      <main className="register-main-content">
        <section className="register-section">
          <h1 className="register-title">상품 수정</h1>
          <ul className="form-groups">
            <li className="form-group">
              <div className="form-label">상품이미지</div>
              <div className="form-content">
                <ul className="image-upload-list">
                  <li className="image-upload-item add-image">
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
                  {imagePreviews.map((url, i) => (
                    <li
                      key={i}
                      className="image-upload-item image-preview-item"
                    >
                      <img src={url} alt={`미리보기 ${i + 1}`} />
                      <button
                        type="button"
                        className="remove-image-button"
                        onClick={() => handleRemoveImage(i)}
                      >
                        X
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </li>

            {/* 상품명, 가격, 설명 등 */}
            <li className="form-group">
              <div className="form-label">상품명</div>
              <input
                className="form-input"
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
              />
            </li>

            <li className="form-group">
              <div className="form-label">가격</div>
              <input
                className="form-input"
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </li>

            <li className="form-group">
              <div className="form-label">상품 설명</div>
              <textarea
                className="form-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </li>
          </ul>
        </section>
      </main>

      <footer className="register-footer">
        <div className="inner">
          <button className="btn-submit" onClick={handleSubmit}>
            수정하기
          </button>
        </div>
      </footer>
    </div>
  );
};

export default ProductEdit;
