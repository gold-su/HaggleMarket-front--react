// src/api/auth.jsx
import axios from "axios";
export async function login(username, password) {
  try {
    const response = await axios.post(
      "https://hagglemarket.onrender.com/api/users/login",
      {
        userId: username,
        password: password,
      }
    );

    // ✅ token과 nickname 모두 반환
    return {
      token: response.data.token,
      nickname: response.data.nickname,
    };
  } catch (error) {
    throw new Error(error.response?.data?.message || "로그인 실패");
  }
}
