import React, { useState } from "react";
import axios from "axios";
import "../pagesCSS/signup.css";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  //로딩 상태
  const [loading, setLoading] = useState(false);
  //모달 / 성공 메시지
  const [showSuccessModal, setShowSuccessModal] = useState(false);


  const [form, setForm] = useState({
    userId: "",
    userName: "",
    password: "",
    phoneNumber: "",
    nickName: "",
    email: "",
    address: "",
    imageURL: ""
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value.trimStart() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // 시작 시 로딩 true

    try {
      const res = await axios.post("http://localhost:8080/api/users/signup", form);
      setShowSuccessModal(true);
      setMessage("회원가입 성공!");
      setTimeout(() => {
         setShowSuccessModal(false);
         navigate("/login");
        }, 2000); // 회원가입 성공 시 로그인 페이지로 이동 / 2초 뒤
    }   catch (err) {
        const res = err.response;
        const errorMap = res?.data?.message;
        if (errorMap && typeof errorMap === "object") {
            setErrors(errorMap);
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
      <h1 className="haggle-title">HAGGLE</h1>

      <form onSubmit={handleSubmit} className="signup-form">
        <div className="signup-container">
          <h2 className="signup-title">회원 정보 입력</h2>

          {/* 이메일 */}
          <div className="form-group">
            <label htmlFor="email">이메일<span className="required">*</span></label>
            <div className="input-with-hint">
              <input name="email" type="email" id="email" onChange={handleChange} required placeholder="올바른 이메일 형식이어야 합니다."/>
              <p className={`error-msg ${errors.email ? "" : "invisible"}`}>
                {errors.email || "‎"}
              </p>
            </div>
          </div>

          {/* 아이디 */}
          <div className="form-group">
            <label htmlFor="userId">아이디<span className="required">*</span></label>
            <div className="input-with-hint">
              <input name="userId" id="userId" onChange={handleChange} required placeholder="아이디는 영문자와 숫자 조합의 5~20자여야 합니다."/>
              <p className={`error-msg ${errors.userId ? "" : "invisible"}`}>
                {errors.userId || "‎"}
              </p>
            </div>
          </div>

          {/* 비밀번호 */}
          <div className="form-group">
            <label htmlFor="password">비밀번호<span className="required">*</span></label>
            <div className="input-with-hint">
              <input name="password" type="password" id="password" onChange={handleChange} required placeholder="비밀번호는 영문, 숫자, 특수문자를 포함한 8~20자여야 합니다."/>
              <p className="password-hint">
                비밀번호에는 특수문자 <strong>! @ # $ % & * ?</strong> 를 사용할 수 있습니다.
              </p>
              <p className={`error-msg ${errors.password ? "" : "invisible"}`}>
                {errors.password || "‎"}
              </p>
            </div>
          </div>

          {/* 닉네임 */}
          <div className="form-group">
            <label htmlFor="nickName">닉네임<span className="required">*</span></label>
            <div className="input-with-hint">
              <input name="nickName" id="nickName" onChange={handleChange} required placeholder="닉네임은 특수문자를 제외한 2~15자여야 합니다." />
              <p className={`error-msg ${errors.nickName ? "" : "invisible"}`}>
                {errors.nickName || "‎"}
              </p>
            </div>
          </div>

          {/* 이름 */}
          <div className="form-group">
            <label htmlFor="userName">이름<span className="required">*</span></label>
            <div className="input-with-hint">
              <input name="userName" id="userName" onChange={handleChange} required placeholder="이름은 한글 2~10자여야 합니다." />
              <p className={`error-msg ${errors.userName ? "" : "invisible"}`}>
                {errors.userName || "‎"}
              </p>
            </div>
          </div>

          {/* 전화번호 */}
          <div className="form-group">
            <label htmlFor="phoneNumber">전화번호<span className="required">*</span></label>
            <div className="input-with-hint">
              <input name="phoneNumber" id="phoneNumber" onChange={handleChange} required placeholder="전화번호는 '-' 없이 숫자 11자여야 합니다."/>
              <p className={`error-msg ${errors.phoneNumber ? "" : "invisible"}`}>
                {errors.phoneNumber || "‎"}
              </p>
            </div>
          </div>

          {/* 주소 */}
          <div className="form-group">
            <label htmlFor="address">주소<span className="required">*</span></label>
            <div className="input-with-hint">
              <input name="address" id="address" onChange={handleChange} required placeholder="정확한 주소를 입력하세요."/>
              <p className={`error-msg ${errors.address ? "" : "invisible"}`}>
                {errors.address || "‎"}
              </p>
            </div>
          </div>

          {/* 이미지 URL */}
          <div className="form-group">
            <label htmlFor="imageURL">이미지 URL</label>
            <div className="input-with-hint">
              <input name="imageURL" id="imageURL" onChange={handleChange} />
              <p className="error-msg invisible">‎</p> {/* 일관된 정렬을 위해 빈 공간 유지 */}
            </div>
          </div>

          {/* 버튼 */}
          <button type="submit" disabled={loading}>{loading ? "로딩 중..." : "회원가입"}</button>
        </div>
      </form>
      {showSuccessModal && (
  <div className="modal-overlay">
    <div className="modal-content">
      <p>회원가입에 성공했습니다!</p>
    </div>
  </div>
)}
    </div>
  );

};

export default Signup;
