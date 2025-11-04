// src/components/TopBar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import "../componentCSS/TopBar.css"; // CSS 파일 경로 유지
import "../editPage/EditProfile";

function TopBar() {
  const isLoggedIn = !!localStorage.getItem("jwtToken");

  // ✅ 알림 상태 관리
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      text: "상품 “디올 가방”에 새로운 댓글이 달렸습니다.",
      time: "2분 전",
      read: false,
    },
    {
      id: 2,
      text: "입찰하신 “맥북 M3” 경매가 종료되었습니다.",
      time: "1시간 전",
      read: true,
    },
  ]);

  const dropdownRef = useRef(null);

  // ✅ 바깥 클릭 시 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // ✅ 안 읽은 알림 수 계산
  const unreadCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="top-bar-wrapper">
      <div className="top-bar">
        {isLoggedIn ? (
          <div className="top-bar-links">
            <span>{localStorage.getItem("nickName")}님 환영합니다.</span>
            <Link to="/editprofile">내 정보 수정</Link>

            {/* ✅ 알림 드롭다운 */}
            <div className="alert-dropdown" ref={dropdownRef}>
              <button
                className="alert-button"
                onClick={() => setIsOpen(!isOpen)}
              >
                🔔 알림
                {unreadCount > 0 && (
                  <span className="alert-badge">{unreadCount}</span>
                )}
                <span className={`caret ${isOpen ? "open" : ""}`}>▾</span>
              </button>

              {isOpen && (
                <div className="alert-panel">
                  {alerts.length === 0 ? (
                    <div className="alert-empty">최근 알림이 없습니다.</div>
                  ) : (
                    <ul className="alert-list">
                      {alerts.map((a) => (
                        <li
                          key={a.id}
                          className={`alert-item ${a.read ? "" : "unread"}`}
                        >
                          <div className="alert-text">{a.text}</div>
                          <div className="alert-time">{a.time}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="alert-footer">
                    <button
                      onClick={() => setAlerts([])}
                      className="alert-clear-btn"
                    >
                      모든 알림 지우기
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                localStorage.clear();
                window.dispatchEvent(new Event("auth:changed"));
                window.location.href = "/login";
              }}
            >
              로그아웃
            </button>
          </div>
        ) : (
          <div className="top-bar-links">
            <Link to="/login">로그인</Link>
            <Link to="/signup">회원가입</Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default TopBar;
