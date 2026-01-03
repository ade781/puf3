import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaHeart, FaUser, FaLock } from 'react-icons/fa';

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
            navigate('/lobby');
        } catch (err) {
            setError(err.response?.data?.message || 'Login gagal');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen page-shell">
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center gap-10 px-4 py-10 lg:flex-row lg:gap-12">
                <div className="w-full max-w-lg space-y-6 text-center lg:text-left">
                    <div className="flex items-center justify-center gap-3 lg:justify-start">
                        <div className="glow-ring">
                            <FaHeart className="text-2xl" />
                        </div>
                        <span className="chip">Romantic Quiz</span>
                    </div>
                    <h1 className="text-4xl font-bold title-gradient lg:text-5xl">
                        Tebak-tebakan untuk Fika
                    </h1>
                    <p className="text-lg text-white/70">
                        Login dulu, lalu mulai sesi ringan bareng Fika yang tetap hangat.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                        <span className="chip">Room privat</span>
                        <span className="chip">Real-time</span>
                        <span className="chip">Tema ungu</span>
                    </div>
                </div>

                <div className="w-full max-w-md glass-card p-6 md:p-8">
                    <div className="mb-6 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white/60">Welcome back</p>
                            <h2 className="text-2xl font-semibold">Masuk</h2>
                        </div>
                        <FaUser className="text-white/40" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Username</label>
                            <div className="relative">
                                <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="Masukkan username"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80">Password</label>
                            <div className="relative">
                                <FaLock className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-field pl-10"
                                    placeholder="Masukkan password"
                                    required
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="glass-panel border border-rose-400/40 px-4 py-3 text-sm text-rose-100">
                                {error}
                            </div>
                        )}

                        <button type="submit" disabled={loading} className="btn-primary w-full">
                            {loading ? 'Loading...' : 'Masuk Sekarang'}
                        </button>
                    </form>

                    <div className="mt-5 text-center text-sm text-white/70">
                        Belum punya akun?{' '}
                        <Link to="/register" className="font-semibold text-fuchsia-200 hover:text-white">
                            Daftar di sini
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
