import React from 'react';
import axios from 'axios';

function WithdrawPage(){
    const handleDelete = async () => {
        const token = localStorage.getItem("jwtToken");
        console.log("토큰 값:", token);
        const userId = localStorage.getItem("userId");

        if (window.confirm("정말로 회원탈퇴 하시겠습니까?")){
            try{
                await axios.delete(`/api/users/${userId}`,{
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                alert("회원탈퇴가 완료되었습니다.");
                localStorage.removeItem("jwtToken");
                localStorage.removeItem("userId");
                window.location.href = "/";
            } catch(error){
                console.error("회원탈퇴 실패:", error);
                alert("회원탈퇴 중 오류가 발생했습니다.");
            }
        }
    };

    return (
        <div className="withdraw-container">
            <h2 className="title">회원탈퇴</h2>
            <button className="delete-button" onClick={handleDelete}>회원탈퇴</button>
        </div>
    );
};

export default WithdrawPage;