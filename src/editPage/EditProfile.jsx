import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import "../editPage/editProfile.css";

const EditProfile = () => {
  const navigate = useNavigate();

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [form, setForm] = useState({
    userId: "",
    userName: "",
    phoneNumber: "",
    nickName: "",
    email: "",
    address: "",
    imageURL: "",
  });

  const [isPasswordVerified, setIsPasswordVerified] = useState(false);
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(true);

  // ✅ 내 정보 불러오기
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    const fetchUserData = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setForm(res.data);
      } catch (err) {
        console.error("유저 정보 불러오기 실패", err);
        if (err.response?.status === 401) {
          alert("로그인 세션이 만료되었습니다. 다시 로그인하세요.");
          localStorage.removeItem("jwtToken");
          navigate("/login");
        } else {
          alert("유저 정보를 불러오지 못했습니다.");
        }
      }
    };

    fetchUserData();
  }, [navigate]);

  // ✅ 입력값 처리
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value.trimStart() });
  };

  // ✅ 비밀번호 확인
  const handlePasswordCheck = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/users/check-password",
        { password },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );
      setIsPasswordVerified(true);
      setShowPasswordModal(false);
    } catch (err) {
      alert("비밀번호가 틀렸습니다.");
      setPassword("");
    }
  };

  // ✅ 수정 요청
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { password, ...updateData } = form;

      const res = await axios.put(
        "http://localhost:8080/api/users/update",
        updateData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("jwtToken")}`,
          },
        }
      );

      const { token, nickname } = res.data;
      localStorage.setItem("jwtToken", token);
      localStorage.setItem("nickName", nickname);

      setShowSuccessModal(true);
      setMessage("내 정보 수정 완료!");
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate("/");
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error("수정 실패", err);
      if (err.response?.status === 403) {
        alert("권한이 없습니다. 다시 로그인 해주세요.");
        localStorage.removeItem("jwtToken");
        navigate("/login");
      } else {
        setMessage("수정 실패");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-page-wrapper">
      <header className="edit-header">
        <h1 className="edit-title">
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            HAGGLE
          </Link>
        </h1>
      </header>

      <main className="edit-main">
        <form onSubmit={handleSubmit} className="edit-form">
          <div className="edit-container">
            <h2 className="edit-subtitle">내 정보 수정</h2>

            {/* 이메일 */}
            <div className="edit-form-group">
              <label htmlFor="email">
                이메일<span className="required">*</span>
              </label>
              <div className="input-with-hint">
                <input
                  name="email"
                  type="email"
                  id="email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={!isPasswordVerified}
                  required
                />
              </div>
            </div>

            {/* 아이디 */}
            <div className="edit-form-group">
              <label htmlFor="userId">
                아이디<span className="required">*</span>
              </label>
              <div className="input-with-hint">
                <input name="userId" id="userId" value={form.userId} disabled />
              </div>
            </div>

            {/* 이름 */}
            <div className="edit-form-group">
              <label htmlFor="userName">
                이름<span className="required">*</span>
              </label>
              <div className="input-with-hint">
                <input
                  name="userName"
                  id="userName"
                  value={form.userName}
                  onChange={handleChange}
                  disabled={!isPasswordVerified}
                  required
                />
              </div>
            </div>

            {/* 닉네임 */}
            <div className="edit-form-group">
              <label htmlFor="nickName">
                닉네임<span className="required">*</span>
              </label>
              <div className="input-with-hint">
                <input
                  name="nickName"
                  id="nickName"
                  value={form.nickName}
                  onChange={handleChange}
                  disabled={!isPasswordVerified}
                  required
                />
              </div>
            </div>

            {/* 주소 */}
            <div className="edit-form-group">
              <label htmlFor="address">
                주소<span className="required">*</span>
              </label>
              <div className="input-with-hint">
                <input
                  name="address"
                  id="address"
                  value={form.address}
                  onChange={handleChange}
                  disabled={!isPasswordVerified}
                  required
                />
              </div>
            </div>

            {/* 버튼 */}
            <button
              type="submit"
              disabled={loading || !isPasswordVerified}
              className="edit-submit-button"
            >
              {loading ? "로딩 중..." : "수정 완료"}
            </button>
          </div>
        </form>
      </main>

      {/* 비밀번호 확인 모달 */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>비밀번호 확인</h3>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호 입력"
              />
            </div>
            <button onClick={handlePasswordCheck}>확인</button>
          </div>
        </div>
      )}

      {/* 수정 성공 모달 */}
      {showSuccessModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <p>{message}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProfile;
