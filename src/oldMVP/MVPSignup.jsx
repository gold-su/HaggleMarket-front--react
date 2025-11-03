import React, { useState } from "react";
import axios from "axios";

const Signup = () => {
  const [form, setForm] = useState({
    userId: "",
    userName: "",
    password: "",
    phoneNumber: "",
    nickName: "",
    email: "",
    address: "",
    imageURL: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "https://hagglemarket.onrender.com/api/users/signup",
        form
      );
      setMessage(res.data); // ex. "회원가입 성공"
    } catch (err) {
      const res = err.response;
      if (res?.data?.message) {
        setMessage(res.data.message); // IllegalArgumentException 메시지
      } else if (res?.data?.errors) {
        const errorMap = res.data.errors;
        setMessage(Object.values(errorMap).join("\n")); // 유효성 검사 메시지
      } else {
        setMessage("에러 발생");
      }
    }
  };

  return (
    <div>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="userId"
          placeholder="아이디"
          onChange={handleChange}
          required
        />
        <input
          name="userName"
          placeholder="이름"
          onChange={handleChange}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="비밀번호"
          onChange={handleChange}
          required
        />
        <input
          name="phoneNumber"
          placeholder="전화번호"
          onChange={handleChange}
          required
        />
        <input
          name="nickName"
          placeholder="닉네임"
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="이메일"
          onChange={handleChange}
          required
        />
        <input
          name="address"
          placeholder="주소"
          onChange={handleChange}
          required
        />
        <input
          name="imageURL"
          placeholder="이미지 URL"
          onChange={handleChange}
        />
        <button type="submit">회원가입</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default Signup;
