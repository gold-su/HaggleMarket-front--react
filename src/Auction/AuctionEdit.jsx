import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

import layout from "../AuctionCSS/AuctionEditLayout.module.css";
import form from "../AuctionCSS/AuctionEditForm.module.css";
import buttons from "../AuctionCSS/AuctionEditButtons.module.css";

export default function AuctionEdit() {
  const { id } = useParams();
  const [existingUrls, setExistingUrls] = useState([]);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`/api/auction/${id}`);
        const data = res.data || {};
        setExistingUrls(Array.isArray(data.imageUrls) ? data.imageUrls : []);
      } catch (e) {
        console.error(e);
      }
    })();
  }, [id]);

  const handleImageChange = (e) => {
    const picked = Array.from(e.target.files || []);
    const remain = Math.max(0, 12 - (existingUrls.length + previews.length));
    const slice = picked.slice(0, remain);
    const urls = slice.map((f) => URL.createObjectURL(f));

    setFiles((prev) => [...prev, ...slice]);
    setPreviews((prev) => [...prev, ...urls]);
  };

  const removeImage = (idx) => {
    if (idx < existingUrls.length) {
      setExistingUrls((prev) => prev.filter((_, i) => i !== idx));
    } else {
      const pIdx = idx - existingUrls.length;
      const url = previews[pIdx];
      if (url?.startsWith("blob:")) {
        try { URL.revokeObjectURL(url); } catch {}
      }
      setPreviews((prev) => prev.filter((_, i) => i !== pIdx));
      setFiles((prev) => prev.filter((_, i) => i !== pIdx));
    }
  };

  useEffect(() => {
    return () => {
      previews.forEach((u) => {
        if (typeof u === "string" && u.startsWith("blob:")) {
          try { URL.revokeObjectURL(u); } catch {}
        }
      });
    };
  }, [previews]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let uploaded = [];
      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append("images", f));
        const res = await axios.post("/api/auction/images", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        uploaded = res.data || [];
      }

      const dto = {
        title: e.target.title?.value || "",
        imageUrls: [...existingUrls, ...uploaded],
      };

      await axios.put(`/api/auction/${id}`, dto, {
        headers: { "Content-Type": "application/json" },
      });
      alert("수정 완료!");
    } catch (err) {
      console.error(err);
      alert("수정 실패");
    }
  };

  return (
    <div className={layout.page}>
      <main className={layout.main}>
        <form onSubmit={handleSubmit}>
          <section className={layout.section}>
            <h1 className={layout.title}>경매 상품 수정</h1>

            {/* 이미지 업로드 */}
            <ul className={`${layout.formGroup} ${layout.inline} ${layout.labelW140}`}>
              <div className={layout.label}>
                상품 이미지 ({existingUrls.length + previews.length}/12)
              </div>
              <div className={layout.content}>
                <ul className={form.imageUploadList}>
                  <li
                    className={`${form.imageUploadItem} ${form.addImage} ${
                      existingUrls.length + previews.length >= 12 ? form.disabled : ""
                    }`}
                  >
                    <label htmlFor="auction-edit-input">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                        <circle cx="12" cy="13" r="4"></circle>
                      </svg>
                      <span>이미지 등록</span>
                    </label>
                    <input
                      id="auction-edit-input"
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageChange}
                      disabled={existingUrls.length + previews.length >= 12}
                      style={{ display: "none" }}
                    />
                  </li>

                  {existingUrls.map((url, idx) => (
                    <li
                      key={`${url}-${idx}`}
                      className={`${form.imageUploadItem} ${form.imagePreviewItem}`}
                    >
                      <img
                        src={url.startsWith("http") ? url : `http://localhost:8080${url}`}
                        alt={`기존 이미지 ${idx + 1}`}
                      />
                      <button
                        type="button"
                        className={form.removeImageButton}
                        onClick={() => removeImage(idx)}
                        aria-label="이미지 삭제"
                        title="이미지 삭제"
                      >
                        ×
                      </button>
                    </li>
                  ))}

                  {previews.map((src, pIdx) => {
                    const globalIdx = existingUrls.length + pIdx;
                    return (
                      <li
                        key={src}
                        className={`${form.imageUploadItem} ${form.imagePreviewItem}`}
                      >
                        <img src={src} alt={`새 이미지 ${pIdx + 1}`} />
                        <button
                          type="button"
                          className={form.removeImageButton}
                          onClick={() => removeImage(globalIdx)}
                          aria-label="이미지 삭제"
                          title="이미지 삭제"
                        >
                          ×
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </ul>
          </section>

          <footer className={layout.footer}>
            <div className={layout.inner}>
              <div className={buttons.btnGroup}>
                <button type="button" className={buttons.btnDraft}>임시저장</button>
                <button type="submit" className={buttons.btnSubmit}>수정하기</button>
              </div>
            </div>
          </footer>
        </form>
      </main>
    </div>
  );
}
