"use client";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const auth = localStorage.getItem('isAdminAuthenticated');
        if (auth) {
            console.log('Login successful, redirecting...');
            router.push('/admindash');
        }
    }, [router]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:8000/api/authenticate_admin/', {
                username,
                password
            });
            if (response.status === 200) {
                localStorage.setItem('isAdminAuthenticated', 'true');
                localStorage.setItem('username', username);  // Store username
                router.push('/admindash');
            } else {
                setError('Invalid username or password');
            }
        } catch (err) {
            setError('Invalid username or password');
        }
    };

    return (
        <div className="login-container">
            <style jsx>{`
                .login-container {
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    background: linear-gradient(135deg, #1e293b, #3b4371);
                    color: #e2e8f0;
                }
                .login-box {
                    background: rgba(45, 55, 72, 0.9);
                    padding: 40px;
                    border-radius: 12px;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                    text-align: center;
                }
                .login-box img {
                    max-width: 100px;
                    max-height: 100px;
                    margin-bottom: 20px;
                }
                .login-box h2 {
                    color: #e2e8f0;
                    margin-bottom: 20px;
                }
                .login-box input {
                    display: block;
                    width: 100%;
                    padding: 12px;
                    margin-bottom: 16px;
                    border-radius: 6px;
                    border: 1px solid #cbd5e0;
                    background: rgba(255, 255, 255, 0.1);
                    color: #e2e8f0;
                }
                .login-box input::placeholder {
                    color: #cbd5e0;
                }
                .login-box button {
                    padding: 12px 24px;
                    background: linear-gradient(90deg, #4a90e2, #1453c6);
                    color: #ffffff;
                    border: none;
                    border-radius: 6px;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.75);
                }
                .login-box button:hover {
                    background: linear-gradient(90deg, #1453c6, #4a90e2);
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 123, 255, 0.85);
                }
                .login-box button:active {
                    transform: translateY(0);
                    box-shadow: 0 4px 15px rgba(0, 123, 255, 0.75);
                }
                .login-box p {
                    color: #ff6b6b;
                    margin-top: 10px;
                }
                .footer {
                    margin-top: 20px;
                    font-size: 14px;
                    color: #cbd5e0;
                    display: flex;
                    align-items: center;
                }
                .footer img {
                    margin-left: 8px;
                    max-height: 20px;
                }
            `}</style>
            <div className="login-box">
                <img src="/mansoor.png" alt="Logo" />
                <h2>Admin Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Login</button>
                </form>
                {error && <p>{error}</p>}
            </div>
            <div className="footer">
                Mansoor, All rights reserved
                <img src="/mansoor.png" alt="Mansoor Logo" />
            </div>
        </div>
    );
}
