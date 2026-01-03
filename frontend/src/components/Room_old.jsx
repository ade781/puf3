import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FaCopy, FaSignOutAlt, FaArrowRight, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const Room = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [room, setRoom] = useState(null);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    // Input states
    const [questionText, setQuestionText] = useState('');
    const [myAnswer, setMyAnswer] = useState('');
    const [myCorrectAnswer, setMyCorrectAnswer] = useState('');
    const [showInput, setShowInput] = useState(false);

    useEffect(() => {
        fetchRoomState();
        const interval = setInterval(fetchRoomState, 2000); // Poll every 2 seconds
        return () => clearInterval(interval);
    }, [code]);

    const fetchRoomState = async () => {
        try {
            const [roomRes, questionRes, historyRes] = await Promise.all([
                api.get(`/rooms/${code}`),
                api.get(`/game/${code}/current`),
                api.get(`/game/${code}/history`)
            ]);

            setRoom(roomRes.data.room);
            setCurrentQuestion(questionRes.data.question);
            setHistory(historyRes.data.questions || []);
            setLoading(false);
        } catch (error) {
            console.error(error);
            if (error.response?.status === 404) {
                navigate('/lobby');
            }
        }
    };

    const handleCreateQuestion = async (e) => {
        e.preventDefault();
        try {
            await api.post('/game/question', {
                roomCode: code,
                questionText
            });
            setQuestionText('');
            setShowInput(false);
            fetchRoomState();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal membuat pertanyaan');
        }
    };

    const handleSubmitAnswer = async (e) => {
        e.preventDefault();
        try {
            await api.post('/game/answer', {
                questionId: currentQuestion.id,
                answerText: myAnswer,
                correctAnswerText: myCorrectAnswer
            });
            setMyAnswer('');
            setMyCorrectAnswer('');
            fetchRoomState();
        } catch (error) {
            alert(error.response?.data?.message || 'Gagal submit jawaban');
        }
    };

    const handleNext = async () => {
        try {
            await api.post(`/game/${code}/next`);
            fetchRoomState();
        } catch (error) {
            alert('Gagal next');
        }
    };

    const handleLeave = async () => {
        try {
            await api.post(`/rooms/${code}/leave`);
            navigate('/lobby');
        } catch (error) {
            navigate('/lobby');
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(code);
        alert('Kode room disalin!');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-gray-600">Loading room...</p>
            </div>
        );
    }

    const isUser1 = room?.user1?.id === user?.id;
    const hasAnswered = currentQuestion?.answers?.some(a => a.userId === user?.id);
    const bothAnswered = currentQuestion?.answers?.length >= 2;
    const myAnswerData = currentQuestion?.answers?.find(a => a.userId === user?.id);
    const otherAnswerData = currentQuestion?.answers?.find(a => a.userId !== user?.id);

    return (
        <div className="min-h-screen p-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
        <div className="flex justify-between items-center mb-4 card-glow p-4">
          <div>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 hover:scale-105 transition-transform inline-block">
              🎮 Room: <span className="room-code">{code}</span>
            </h1>
            <p className="text-sm text-gray-600 mt-1 hover:text-purple-600 transition-colors">
              {room?.status === 'waiting' ? '⏳ Menunggu pemain ke-2...' : '🎯 Bermain'}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={copyCode} className="btn-secondary text-sm flex items-center gap-1 group">
              <FaCopy className="group-hover:scale-125 transition-transform" /> Salin Kode
            </button>
            <button onClick={handleLeave} className="btn-secondary text-sm flex items-center gap-1 group hover:bg-red-100 hover:text-red-600">
              <FaSignOutAlt className="group-hover:scale-125 transition-transform" /> Keluar
                    </div>
                </div>

                {room?.status === 'waiting' ? (
                    <div className="card text-center py-8">
                        <p className="text-gray-700 mb-2">Menunggu pemain ke-2...</p>
                        <p className="text-sm text-gray-500">Bagikan kode: <span className="font-bold text-purple-600">{code}</span></p>
                    </div>
                ) : (
                    <>
                        {/* 3 Column Layout */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            {/* User 1 Column */}
                            <div className="card">
                                <div className="text-center mb-3">
                                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
                                        {room?.user1?.displayName?.[0] || room?.user1?.username?.[0]}
                                    </div>
                                    <p className="font-semibold text-sm">{room?.user1?.displayName || room?.user1?.username}</p>
                                    {isUser1 && <p className="text-xs text-purple-600">(Kamu)</p>}
                                </div>
                                {myAnswerData && isUser1 && (
                                    <div className="text-xs space-y-1">
                                        <p><strong>Tebakanmu:</strong> {myAnswerData.answerText}</p>
                                        <p><strong>Kunci:</strong> {myAnswerData.correctAnswerText}</p>
                                        {bothAnswered && (
                                            <div className={`mt-2 px-2 py-1 rounded ${myAnswerData.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {myAnswerData.isCorrect ? '✓ Benar!' : '✗ Salah'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Question Column (Center) */}
              <div className="question-card">
                {currentQuestion ? (
                  <div>
                    <p className="text-xs text-purple-600 mb-2 font-semibold hover:scale-105 transition-transform inline-block">
                      💬 Ditanya oleh: {currentQuestion.askedBy.displayName || currentQuestion.askedBy.username}
                    </p>
                    <p className="font-bold text-gray-800 mb-4 text-lg hover:text-purple-700 transition-colors">{currentQuestion.questionText}</p>
                                        {!hasAnswered ? (
                                            <form onSubmit={handleSubmitAnswer} className="space-y-2">
                                                <input
                                                    type="text"
                                                    value={myAnswer}
                                                    onChange={(e) => setMyAnswer(e.target.value)}
                                                    className="input-field"
                                                    placeholder="Tebakanmu..."
                                                    required
                                                />
                                                <input
                                                    type="text"
                                                    value={myCorrectAnswer}
                                                    onChange={(e) => setMyCorrectAnswer(e.target.value)}
                                                    className="input-field"
                                                    placeholder="Kunci jawabanmu..."
                                                    required
                                                />
                                                <button type="submit" className="btn-primary w-full text-sm">
                                                    Kirim Jawaban
                                                </button>
                                            </form>
                                        ) : bothAnswered ? (
                                            <div>
                                                <div className="bg-purple-50 p-3 rounded-lg mb-3">
                                                    <p className="text-sm font-semibold text-purple-800">Hasil:</p>
                                                    <div className="text-xs mt-2 space-y-2">
                                                        <div>
                                                            <p className="font-semibold">{room?.user1?.displayName}:</p>
                                                            <p>Tebakan: {currentQuestion.answers.find(a => a.userId === room.user1.id)?.answerText}</p>
                                                            <p>Kunci: {currentQuestion.answers.find(a => a.userId === room.user1.id)?.correctAnswerText}</p>
                                                            {currentQuestion.answers.find(a => a.userId === room.user1.id)?.isCorrect ? (
                                                                <span className="text-green-600">✓ Benar</span>
                                                            ) : (
                                                                <span className="text-red-600">✗ Salah</span>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-semibold">{room?.user2?.displayName}:</p>
                                                            <p>Tebakan: {currentQuestion.answers.find(a => a.userId === room.user2.id)?.answerText}</p>
                                                            <p>Kunci: {currentQuestion.answers.find(a => a.userId === room.user2.id)?.correctAnswerText}</p>
                                                            {currentQuestion.answers.find(a => a.userId === room.user2.id)?.isCorrect ? (
                                                                <span className="text-green-600">✓ Benar</span>
                                                            ) : (
                                                                <span className="text-red-600">✗ Salah</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                                <button onClick={handleNext} className="btn-primary w-full text-sm flex items-center justify-center gap-2">
                                                    Pertanyaan Berikutnya <FaArrowRight />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="text-center text-sm text-gray-600">
                                                Menunggu pemain lain menjawab...
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-center text-gray-600 text-sm mb-3">
                                            Tidak ada pertanyaan aktif
                                        </p>
                                        {!showInput ? (
                                            <button
                                                onClick={() => setShowInput(true)}
                                                className="btn-primary w-full text-sm"
                                            >
                                                Buat Pertanyaan
                                            </button>
                                        ) : (
                                            <form onSubmit={handleCreateQuestion} className="space-y-2">
                                                <textarea
                                                    value={questionText}
                                                    onChange={(e) => setQuestionText(e.target.value)}
                                                    className="input-field resize-none"
                                                    rows="3"
                                                    placeholder="Tulis pertanyaan..."
                                                    required
                                                />
                                                <div className="flex gap-2">
                                                    <button type="button" onClick={() => setShowInput(false)} className="btn-secondary flex-1 text-sm">
                                                        Batal
                                                    </button>
                                                    <button type="submit" className="btn-primary flex-1 text-sm">
                                                        Kirim
                                                    </button>
                                                </div>
                                            </form>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* User 2 Column */}
                            <div className="card">
                                <div className="text-center mb-3">
                                    <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-2">
                                        {room?.user2?.displayName?.[0] || room?.user2?.username?.[0]}
                                    </div>
                                    <p className="font-semibold text-sm">{room?.user2?.displayName || room?.user2?.username}</p>
                                    {!isUser1 && <p className="text-xs text-pink-600">(Kamu)</p>}
                                </div>
                                {myAnswerData && !isUser1 && (
                                    <div className="text-xs space-y-1">
                                        <p><strong>Tebakanmu:</strong> {myAnswerData.answerText}</p>
                                        <p><strong>Kunci:</strong> {myAnswerData.correctAnswerText}</p>
                                        {bothAnswered && (
                                            <div className={`mt-2 px-2 py-1 rounded ${myAnswerData.isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {myAnswerData.isCorrect ? '✓ Benar!' : '✗ Salah'}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* History */}
                        {history.length > 0 && (
                            <div className="card">
                                <h3 className="font-bold text-gray-800 mb-3 text-sm">Riwayat Pertanyaan:</h3>
                                <div className="space-y-2 max-h-40 overflow-y-auto">
                                    {history.map((q) => (
                                        <div key={q.id} className="text-xs border-b pb-2">
                                            <p className="font-semibold">{q.questionText}</p>
                                            <p className="text-gray-500">
                                                {q.answers.length >= 2 ? '✓ Selesai' : '⏳ Belum selesai'}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Room;
