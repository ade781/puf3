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

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-purple-600">
                            Halo, {user?.displayName || user?.username}! 👋
                        </h1>
                        <p className="text-gray-600 text-sm">Siap main tebak-tebakan dengan Fika?</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="btn-secondary flex items-center gap-2 text-sm"
                    >
                        <FaSignOutAlt />
                        Keluar
                    </button>
                </div>

                {/* Main Content */}
                <div className="grid md:grid-cols-2 gap-4">
                    {/* Create Room */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-800 mb-3">Buat Room Baru</h2>
                        <p className="text-gray-600 text-sm mb-4">
                            Buat room dan bagikan kode ke Fika
                        </p>
                        <button
                            onClick={handleCreateRoom}
                            disabled={loading}
                            className="btn-primary w-full flex items-center justify-center gap-2"
                        >
                            <FaPlus />
                            Buat Room
                        </button>
                    </div>

                    {/* Join Room */}
                    <div className="card">
                        <h2 className="text-lg font-bold text-gray-800 mb-3">Gabung Room</h2>
                        <form onSubmit={handleJoinRoom} className="space-y-3">
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

                {error && (
                    <div className="mt-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Info */}
                <div className="mt-6 card bg-purple-50">
                    <h3 className="font-bold text-purple-800 mb-2">💡 Cara Main:</h3>
                    <ul className="text-sm text-purple-700 space-y-1">
                        <li>1. Buat room atau gabung pakai kode</li>
                        <li>2. Tunggu sampai 2 orang (kamu & Fika)</li>
                        <li>3. Bebas siapa yang tanya duluan</li>
                        <li>4. Kasih jawaban + kunci jawaban</li>
                        <li>5. Lihat siapa yang paling kenal!</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Lobby;
