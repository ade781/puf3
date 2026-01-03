import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaUser, FaLock, FaStar } from 'react-icons/fa';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(username, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
            {/* Floating hearts background */}
            <div className="hearts-bg">
                {[...Array(20)].map((_, i) => (
                    <div
                        key={i}
                        className="heart"
                        style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 5}s`,
                            fontSize: `${20 + Math.random() * 30}px`
                        }}
                    >
                        {['💜', '💖', '💗', '💕', '✨', '⭐'][Math.floor(Math.random() * 6)]}
                    </div>
                ))}
            </div>

            <div className="w-full max-w-md relative z-10">
                <div className="text-center mb-8">
                    <div className="relative inline-block">
                        <FaHeart className="text-7xl text-pink-500 mx-auto mb-4 animate-bounce drop-shadow-2xl" />
                        <div className="absolute inset-0 blur-2xl bg-pink-500 opacity-50 animate-pulse"></div>
                    </div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 mb-3 glow-text">
                        Romantic Quiz
                    </h1>
                    <p className="text-purple-700 font-bold text-lg flex items-center justify-center gap-3">
                        <FaStar className="text-yellow-400 animate-spin text-2xl" style={{ animationDuration: '3s' }} />
                        How well do you know each other?
                        <FaStar className="text-yellow-400 animate-spin text-2xl" style={{ animationDuration: '3s' }} />
                    </p>
                </div>

                <div className="card fade-in">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 text-lg">
                                Username
                            </label>
                            <div className="relative">
                                <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 text-xl" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-field pl-14"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-3 text-lg">
                                Password
                            </label>
                            <div className="relative">
                                <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-500 text-xl" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-14"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-gradient-to-r from-red-100 to-pink-100 border-4 border-red-300 text-red-700 px-6 py-4 rounded-2xl font-bold shadow-lg animate-pulse">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed text-xl"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Logging in...
                                </span>
                            ) : (
                                'Login 💜✨'
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-gray-700 font-semibold text-lg">
                            Don't have an account?{' '}
                            <Link
                                to="/register"
                                className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 font-black hover:from-pink-600 hover:to-purple-600 transition-all duration-500 text-xl hover:scale-110 inline-block"
                            >
                                Register here 🎉
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
