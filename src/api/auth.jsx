import axios from 'axios';

export async function login(username, password) {
    try {
        const response = await axios.post('http://localhost:8080/api/users/login', {
            userId: username,
            password: password,
        });

        // 응답 예시: { token: 'JWT토큰', userId: '사용자ID' }
        return response.data.token;
    } catch (error) {
        // 에러가 발생하면 예외 던짐
        throw new Error(error.response?.data?.message || '로그인 실패');
    }
}

