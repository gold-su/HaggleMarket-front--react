import axios from 'axios';

export async function login(username, password) {
    try {
        const response = await axios.post('http://localhost:8080/api/users/login', {
            userId: username,
            password: password,
        });

        // ✅ token과 nickname 모두 반환
        return {
            token: response.data.token,
            nickname: response.data.nickname,
        };
    } catch (error) {
        throw new Error(error.response?.data?.message || '로그인 실패');
    }
}
