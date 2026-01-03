import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FaPlus, FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';

const Lobby = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [roomCode, setRoomCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleCreateRoom = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/rooms/create');
            const { room } = response.data;
            navigate(`/room/${room.code}`);
        } catch (err) {
            setError('Gagal membuat room');
        } finally {
            setLoading(false);
        }
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const response = await api.post('/rooms/join', { code: roomCode.toUpperCase() });
            const { room } = response.data;
            navigate(`/room/${room.code}`);
        } catch (err) {
            setError(err.response?.data?.message || 'Gagal join room');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isFika = user?.username?.toLowerCase() === 'fika';

    return (
        <div className="min-h-screen page-shell">
            <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-10">
                <div className="glass-panel flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-2">
                        <p className="text-sm text-white/60">Lobby</p>
                        <h1 className="text-3xl font-bold title-gradient">
                            Halo, {user?.displayName || user?.username}!
                        </h1>
                        <p className="text-white/70">
                            {isFika
                                ? 'Siap main tebak tebakan dengan pacar kamu?'
                                : 'Siap main tebak-tebakan dengan Fika?'}
                        </p>
                    </div>
                    <div className="grid gap-2 sm:flex sm:flex-wrap sm:items-center sm:gap-3">
                        <span className="chip sm:min-w-[120px]">Room privat</span>
                        <span className="chip sm:min-w-[120px]">2 pemain</span>
                        <span className="chip sm:min-w-[120px]">Realtime</span>
                        <span className="chip sm:min-w-[120px]">Untuk Fika</span>
                        <button
                            onClick={handleLogout}
                            className="btn-secondary flex items-center justify-center gap-2 text-sm sm:min-w-[120px]"
                        >
                            <FaSignOutAlt />
                            Keluar
                        </button>
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold">Buat Room Baru</h2>
                            <p className="mt-2 text-sm text-white/70">
                                Undang Fika lewat kode unik dan mulai pertanyaan pertama.
                            </p>
                            <button
                                onClick={handleCreateRoom}
                                disabled={loading}
                                className="btn-primary mt-6 w-full flex items-center justify-center gap-2"
                            >
                                <FaPlus />
                                Buat Room
                            </button>
                        </div>

                        <div className="glass-card p-6">
                            <h2 className="text-xl font-semibold">Gabung Room</h2>
                            <p className="mt-2 text-sm text-white/70">
                                Punya kode? Masukkan di sini untuk langsung bergabung.
                            </p>
                            <form onSubmit={handleJoinRoom} className="mt-4 space-y-3">
                                <input
                                    type="text"
                                    value={roomCode}
                                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                                    className="input-field"
                                    placeholder="Masukkan kode room"
                                    required
                                    maxLength={8}
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-secondary w-full flex items-center justify-center gap-2"
                                >
                                    <FaSignInAlt />
                                    Gabung Room
                                </button>
                            </form>
                        </div>
                    </div>

                    <div className="info-box space-y-4">
                        <div>
                            <p className="text-sm text-white/60">Cara main</p>
                            <h3 className="text-xl font-semibold">Biar makin seru</h3>
                        </div>
                        <ul className="space-y-3 text-sm text-white/70">
                            <li className="glass-panel px-4 py-3">1. Buat room atau gabung pakai kode</li>
                            <li className="glass-panel px-4 py-3">2. Tunggu sampai 2 orang (kamu & Fika)</li>
                            <li className="glass-panel px-4 py-3">3. Bebas siapa yang tanya duluan</li>
                            <li className="glass-panel px-4 py-3">4. Kasih jawaban + kunci jawaban</li>
                            <li className="glass-panel px-4 py-3">5. Lihat siapa yang paling kenal!</li>
                            <li className="glass-panel px-4 py-3">Bonus: buat Fika, biar ngobrolnya makin nyambung.</li>
                        </ul>
                    </div>
                </div>

                {error && (
                    <div className="glass-panel border border-rose-400/40 px-4 py-3 text-sm text-rose-100">
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Lobby;
