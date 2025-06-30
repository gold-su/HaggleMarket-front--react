//로그인 페이지 구현
import './Login.css';
import React, {useState} from 'react';
import {login} from '/src/api/auth.jsx';
import {useNavigate} from 'react-router-dom';

function LoginPage(){

    const navigate = useNavigate();
    //값을 저장할 변수들을 지정함
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await login(userId, password);
            localStorage.setItem("jwtToken", token);
            localStorage.setItem("userId",userId);
            alert("로그인 성공");
            navigate('/');
        } catch (error) {
            alert("로그인 실패: 아이디나 비밀번호를 확인하세요");
            console.log(error);
        }
    };

    return (
        //사용자가 값을 넘기면 실행될 함수
        <form onSubmit={handleSubmit}>
            {/*입력창을 구현하고 사용자가 입력할때마다 값을 저장함*/}
            <input
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="아이디"
                required
            />
            {/*마찬가지*/}
            <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호"
                required
            />
            {/*버튼을 누르면 값을 넘김*/}
            <button type="submit">로그인</button>
        </form>
    );
}

export default LoginPage;