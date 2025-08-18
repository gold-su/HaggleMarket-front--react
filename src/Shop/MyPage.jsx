// src/Shop/MyPage.jsx
import React, { useState } from 'react';
import '../ShopCSS/MyPage.css'; // MyPage 전용 CSS 파일 임포트

function MyPage() {
  // 초기 사용자 정보 (실제 서비스에서는 API로 받아와야 합니다)
  const [profile, setProfile] = useState({
    profileImage: 'https://via.placeholder.com/80', // 프로필 사진 URL
    email: 'user@example.com',
    userId: 'user123',
    password: '', // 비밀번호는 보통 빈 값으로 시작하거나, 변경할 때만 입력받습니다.
    name: '홍길동',
    nickname: '길동이',
    phone: '010-1234-5678',
    address: '서울특별시 강남구 테헤란로 123',
  });

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 폼 제출 핸들러 (예: 서버에 업데이트 요청)
  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: API 호출로 개인정보 업데이트 처리 로직 추가
    alert('개인정보가 성공적으로 저장되었습니다!');
    console.log('저장할 프로필 정보:', profile);
  };

  return (
    <section className="mypage-container">
      <h1 className="mypage-title">마이페이지</h1>

      <form className="mypage-form" onSubmit={handleSubmit}>

        <label className="mypage-label">
          이메일
          <input
            type="email"
            name="email"
            value={profile.email}
            onChange={handleChange}
            required
          />
        </label>

        <label className="mypage-label">
          아이디
          <input
            type="text"
            name="userId"
            value={profile.userId}
            onChange={handleChange}
            required
            disabled /* 아이디는 보통 변경 불가 */
          />
        </label>

        <label className="mypage-label">
          비밀번호
          <input
            type="password"
            name="password"
            value={profile.password}
            onChange={handleChange}
            placeholder="변경할 비밀번호를 입력하세요"
          />
        </label>

        <label className="mypage-label">
          이름
          <input
            type="text"
            name="name"
            value={profile.name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="mypage-label">
          닉네임
          <input
            type="text"
            name="nickname"
            value={profile.nickname}
            onChange={handleChange}
            required
          />
        </label>

        <label className="mypage-label">
          전화번호
          <input
            type="tel"
            name="phone"
            value={profile.phone}
            onChange={handleChange}
            required
          />
        </label>

        <label className="mypage-label">
          주소
          <input
            type="text"
            name="address"
            value={profile.address}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit" className="save-button">저장</button>
      </form>
    </section>
  );
}

export default MyPage;