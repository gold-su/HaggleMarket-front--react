// src/pages/Signup.jsx
import React, { useState } from "react";
import axios from "axios";
import "../pagesCSS/signup.css";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Signup = () => {
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  //로딩 상태
  const [loading, setLoading] = useState(false);
  //모달 / 성공 메시지
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [profileImage, setProfileImage] = useState(null); // 프로필 이미지 상태
  const [previewUrl, setPreviewUrl] = useState(null); // 미리보기 이미지 상태
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    userName: "",
    password: "",
    phoneNumber: "",
    nickName: "",
    email: "",
    address: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value.trimStart() });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file)); // 파일 선택 시 미리보기 URL 설정
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 시작 시 로딩 true

    try {
      // 프로필 이미지가 선택된 경우 FormData로 전송
      const formData = new FormData();
      formData.append(
        "user",
        new Blob(
          [
            JSON.stringify({
              ...form,
              address: `${form.address} ${form.addressDetail || ""}`.trim(),
            }),
          ],
          { type: "application/json" }
        )
      );
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const res = await axios.post(
        "http://localhost:8080/api/users/signup",
        formData
      );

      //회원가입 성공하면 기존 에러 초기화
      setErrors({});
      setShowSuccessModal(true);
      setMessage("회원가입 성공!");
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/login");
      }, 2000); // 회원가입 성공 시 로그인 페이지로 이동 / 2초 뒤
    } catch (err) {
      console.log("🔥 [에러 응답 전체]", err); // ✅ 전체 에러 출력
      console.log("🔥 [에러 응답 데이터]", err.response?.data); // ✅ 응답 데이터 출력
      console.log("🔥 [에러 메시지 객체]", err.response?.data?.message); // ✅ 메시지 맵 확인

      const res = err.response;
      const errorMap = res?.data; //data 바로 사용
      if (errorMap && typeof errorMap === "object") {
        setErrors(errorMap); //에러 상태 세팅
        setMessage(""); // 전역 메시지는 이제 따로 처리 안 함
      } else {
        setMessage("에러 발생");
        setErrors({});
      }
    } finally {
      setLoading(false); // 요청 완료 후 로딩 false
    }
  };

  return (
    <div className="page-wrapper">
      <h1 className="haggle-title">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          HAGGLE
        </Link>
      </h1>

      <form onSubmit={handleSubmit} className="signup-form">
        <div className="signup-container">
          <h2 className="signup-title">회원 정보 입력</h2>

          <div className="form-group">
            <label htmlFor="profileImage" className="profile-label">
              이미지 업로드
            </label>

            {/* ✅ 업로드 박스와 input을 하나로 감싼 구조 */}
            <div className="profile-upload-wrapper">
              <div className="image-upload-box-signup">
                {previewUrl ? (
                  <img src={previewUrl} alt="미리보기" />
                ) : (
                  <span>+ 이미지 선택</span>
                )}
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden-file-input"
                />
              </div>
            </div>
          </div>

          {/* 이메일 */}
          <div className="form-group">
            <label htmlFor="email">
              이메일<span className="required">*</span>
            </label>
            <div className="input-with-hint">
              <input
                name="email"
                type="email"
                id="email"
                onChange={handleChange}
                required
                placeholder="올바른 이메일 형식이어야 합니다."
              />
              <p
                className={`error-msg ${errors.email ? "visible" : "invisible"
                  }`}
              >
                {errors.email || "‎"}
              </p>
            </div>
          </div>

          {/* 아이디 */}
          <div className="form-group">
            <label htmlFor="userId">
              아이디<span className="required">*</span>
            </label>
            <div className="input-with-hint">
              <input
                name="userId"
                id="userId"
                onChange={handleChange}
                required
                placeholder="아이디는 영문자와 숫자 조합의 5~20자여야 합니다."
              />
              <p
                className={`error-msg ${errors.userId ? "visible" : "invisible"
                  }`}
              >
                {errors.userId || "‎"}
              </p>
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="form-group">
            <label htmlFor="password">
              비밀번호<span className="required">*</span>
            </label>
            <div className="input-with-hint eye-wrapper">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                id="password"
                onChange={handleChange}
                required
                placeholder="비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자여야 합니다."
              />
              {showPassword ? (
                <FaEyeSlash
                  className="eye-icon"
                  onClick={() => setShowPassword(false)}
                  title="비밀번호 숨기기"
                />
              ) : (
                <FaEye
                  className="eye-icon"
                  onClick={() => setShowPassword(true)}
                  title="비밀번호 보기"
                />
              )}
              <p className="password-hint">
                비밀번호에는 특수문자 <strong>! @ # $ % & * ?</strong> 를 사용할
                수 있습니다.
              </p>
              <p
                className={`error-msg ${errors.password ? "visible" : "invisible"
                  }`}
              >
                {errors.password || "‎"}
              </p>
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className="form-group">
            <label htmlFor="confirmPassword">
              비밀번호 확인<span className="required">*</span>
            </label>
            <div className="input-with-hint eye-wrapper">
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setPasswordMatch(e.target.value === form.password);
                }}
                required
                placeholder="비밀번호를 한 번 더 입력하세요."
              />
              {showConfirmPassword ? (
                <FaEyeSlash
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword(false)}
                  title="비밀번호 숨기기"
                />
              ) : (
                <FaEye
                  className="eye-icon"
                  onClick={() => setShowConfirmPassword(true)}
                  title="비밀번호 보기"
                />
              )}
              <p
                className={`error-msg ${!passwordMatch ? "visible" : "invisible"
                  }`}
                style={{ color: !passwordMatch ? "red" : "transparent" }}
              >
                {!passwordMatch ? "비밀번호가 일치하지 않습니다." : "‎"}
              </p>
            </div>
          </div>

          {/* 닉네임 */}
          <div className="form-group">
            <label htmlFor="nickName">
              닉네임<span className="required">*</span>
            </label>
            <div className="input-with-hint">
              <input
                name="nickName"
                id="nickName"
                onChange={handleChange}
                required
                placeholder="닉네임은 특수문자를 제외한 2~15자여야 합니다."
              />
              <p
                className={`error-msg ${errors.nickName ? "visible" : "invisible"
                  }`}
              >
                {errors.nickName || "‎"}
              </p>
            </div>
          </div>

          {/* 이름 */}
          <div className="form-group">
            <label htmlFor="userName">
              이름<span className="required">*</span>
            </label>
            <div className="input-with-hint">
              <input
                name="userName"
                id="userName"
                onChange={handleChange}
                required
                placeholder="이름은 한글 2~10자여야 합니다."
              />
              <p
                className={`error-msg ${errors.userName ? "visible" : "invisible"
                  }`}
              >
                {errors.userName || "‎"}
              </p>
            </div>
          </div>

          {/* 전화번호 */}
          <div className="form-group">
            <label htmlFor="phoneNumber">
              전화번호<span className="required">*</span>
            </label>
            <div className="input-with-hint">
              <input
                name="phoneNumber"
                id="phoneNumber"
                onChange={handleChange}
                required
                placeholder="전화번호는 '-' 없이 숫자 11자여야 합니다."
              />
              <p
                className={`error-msg ${errors.phoneNumber ? "visible" : "invisible"
                  }`}
              >
                {errors.phoneNumber || "‎"}
              </p>
            </div>
          </div>

          {/* 주소 */}
          <div className="form-group">
            <label htmlFor="address">
              주소<span className="required">*</span>
            </label>

            {/* [변경] 기존 address-wrapper 최상위 → 공통 레이아웃(.input-with-hint)로 감싸 비율/간격을 다른 필드와 통일 */}
            <div className="input-with-hint">
              {/* [변경] address-row 내부 구성은 유지하되, 버튼과 인풋 높이를 40px로 고정해 비율 통일 */}
              <div className="address-row">
                {/* [유지] 메인 주소 입력 */}
                <input
                  name="address"
                  id="address"
                  value={form.address}
                  onChange={handleChange}
                  required
                  placeholder="정확한 주소를 입력하거나 검색하세요."
                />

                {/* [유지] 주소검색 버튼 */}
                <button
                  type="button"
                  className="address-btn"
                  onClick={async () => {
                    // [주의] window.daum 스크립트 로드는 기존 로직 유지(또는 별도 ensure 함수 사용 가능)
                    new window.daum.Postcode({
                      oncomplete: (data) => {
                        setForm((prev) => ({
                          ...prev,
                          address: data.address,
                        }));
                      },
                    }).open();
                  }}
                >
                  주소검색
                </button>
              </div>

              {/* [유지] 상세 주소 입력 */}
              <input
                name="addressDetail"
                id="addressDetail"
                value={form.addressDetail || ""}
                onChange={(e) => setForm({ ...form, addressDetail: e.target.value })}
                placeholder="상세 주소를 입력하세요 (예: 101동 202호)"
                className="address-detail"
              />

              {/* [유지] 에러 메시지: 다른 필드와 동일한 위치/간격으로 표시 */}
              <p className={`error-msg ${errors.address ? "visible" : "invisible"}`}>
                {errors.address || "‎"}
              </p>
            </div>
          </div>

          {/* 버튼 */}
          <button type="submit" disabled={loading || !passwordMatch}>
            {loading ? "로딩 중..." : "회원가입"}
          </button>
        </div>
      </form>
      {showSuccessModal && (
        <div className="modal-overlay-signup">
          <div className="modal-content-signup">
            <p>회원가입에 성공했습니다!</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Signup;
