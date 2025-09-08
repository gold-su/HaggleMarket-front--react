import { useState } from "react";
import axios from "axios";
import "./auth-ui.css";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [done, setDone] = useState(false);
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post("/api/auth/password-reset/request", { email });
        } finally {
            setDone(true);
            setLoading(false);
        }
    };

    return (
        <div className="auth-scope auth-scope--main">
            <div className="auth-wrap">
                <div className="auth-card">
                    <h1 className="auth-title">비밀번호 재설정</h1>
                    <p className="auth-sub">가입한 이메일로 재설정 링크를 보내드립니다.</p>

                    {done ? (
                        <div className="alert alert--success" role="status" aria-live="polite">
                            전송되었습니다. 메일함(스팸 포함)을 확인하세요.
                        </div>
                    ) : (
                        <form onSubmit={submit} className="auth-form">
                            <label className="auth-label" htmlFor="email">이메일</label>
                            <input
                                id="email"
                                type="email"
                                className="input"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                            <button
                                className="btn"
                                type="submit"
                                disabled={!email || loading}
                                aria-busy={loading}
                            >
                                {loading ? "전송 중..." : "재설정 링크 보내기"}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
