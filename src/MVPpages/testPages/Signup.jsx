// src/components/Signup.js
import React from 'react';

function Signup() {
  const handleSubmit = (e) => {
    e.preventDefault();
    alert('회원가입 시도 (실제 회원가입 로직은 여기에 구현)');
  };

  return (
    <div className="signup-container">
      <h1>회원가입</h1>
      <div className="info-text">
        가입을 시작합니다!<br />
      </div>
      <form onSubmit={handleSubmit}>
        <input type="email" placeholder="이메일" required />
        <input type="password" placeholder="비밀번호" required />
        <button type="submit">다음</button>
      </form>
    </div>
  );
}

export default Signup;
