import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FaCopy, FaSignOutAlt, FaArrowRight } from 'react-icons/fa';

const Room = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [questionText, setQuestionText] = useState('');
  const [myAnswer, setMyAnswer] = useState('');
  const [myCorrectAnswer, setMyCorrectAnswer] = useState('');
  const [showInput, setShowInput] = useState(false);

  useEffect(() => {
    fetchRoomState();
    const interval = setInterval(fetchRoomState, 2000);
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
        <div className="spinner w-16 h-16"></div>
      </div>
    );
  }

  const isUser1 = room?.user1?.id === user?.id;
  const hasAnswered = currentQuestion?.answers?.some(a => a.userId === user?.id);
  const bothAnswered = currentQuestion?.answers?.length >= 2;
  const myAnswerData = currentQuestion?.answers?.find(a => a.userId === user?.id);

  return (
    <div className="min-h-screen page-shell">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-4 py-8">
        <div className="glass-panel flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-white/60">Room code</p>
            <h1 className="text-2xl font-bold title-gradient">
              Room <span className="room-code">{code}</span>
            </h1>
            <p className="text-sm text-white/70">
              {room?.status === 'waiting' ? 'Menunggu pemain ke-2...' : 'Room aktif, lanjut main'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={copyCode} className="btn-secondary text-sm flex items-center gap-2">
              <FaCopy /> Salin Kode
            </button>
            <button onClick={handleLeave} className="btn-secondary text-sm flex items-center gap-2">
              <FaSignOutAlt /> Keluar
            </button>
          </div>
        </div>

        {room?.status === 'waiting' ? (
          <div className="glass-card flex flex-col items-center justify-center gap-4 p-10 text-center">
            <div className="text-4xl">?</div>
            <p className="text-lg font-semibold">Menunggu pemain ke-2...</p>
            <p className="text-white/70">Bagikan kode: <span className="room-code">{code}</span></p>
          </div>
        ) : (
          <>
            <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)_260px]">
              <div className="glass-panel p-4 space-y-4">
                <div className="text-center space-y-2">
                  <div className="glow-ring mx-auto">
                    {room?.user1?.displayName?.[0] || room?.user1?.username?.[0]}
                  </div>
                  <p className="text-sm font-semibold text-white/90">
                    {room?.user1?.displayName || room?.user1?.username}
                  </p>
                  {isUser1 && <p className="text-xs text-fuchsia-200">(Kamu)</p>}
                </div>
                {myAnswerData && isUser1 && (
                  <div className="glass-panel px-4 py-3 text-xs space-y-2">
                    <p><span className="text-white/70">Tebakan:</span> {myAnswerData.answerText}</p>
                    <p><span className="text-white/70">Kunci:</span> {myAnswerData.correctAnswerText}</p>
                    {bothAnswered && (
                      <div className={myAnswerData.isCorrect ? 'status-correct' : 'status-wrong'}>
                        {myAnswerData.isCorrect ? 'Benar' : 'Salah'}
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="glass-card p-6 space-y-4">
                {currentQuestion ? (
                  <>
                    <div className="space-y-1">
                      <p className="text-xs text-white/60">
                        Ditanya oleh {currentQuestion.askedBy.displayName || currentQuestion.askedBy.username}
                      </p>
                      <h2 className="text-xl font-semibold">{currentQuestion.questionText}</h2>
                    </div>

                    {!hasAnswered ? (
                      <form onSubmit={handleSubmitAnswer} className="space-y-3">
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
                      <div className="space-y-3">
                        <div className="glass-panel p-4 space-y-3">
                          <p className="text-sm font-semibold">Hasil</p>
                          <div className="space-y-3 text-xs">
                            <div className="glass-panel px-3 py-2">
                              <p className="font-semibold">{room?.user1?.displayName}:</p>
                              <p>Tebakan: {currentQuestion.answers.find(a => a.userId === room.user1.id)?.answerText}</p>
                              <p>Kunci: {currentQuestion.answers.find(a => a.userId === room.user1.id)?.correctAnswerText}</p>
                              {currentQuestion.answers.find(a => a.userId === room.user1.id)?.isCorrect ? (
                                <span className="status-correct inline-block mt-2">Benar</span>
                              ) : (
                                <span className="status-wrong inline-block mt-2">Salah</span>
                              )}
                            </div>
                            <div className="glass-panel px-3 py-2">
                              <p className="font-semibold">{room?.user2?.displayName}:</p>
                              <p>Tebakan: {currentQuestion.answers.find(a => a.userId === room.user2.id)?.answerText}</p>
                              <p>Kunci: {currentQuestion.answers.find(a => a.userId === room.user2.id)?.correctAnswerText}</p>
                              {currentQuestion.answers.find(a => a.userId === room.user2.id)?.isCorrect ? (
                                <span className="status-correct inline-block mt-2">Benar</span>
                              ) : (
                                <span className="status-wrong inline-block mt-2">Salah</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <button onClick={handleNext} className="btn-next w-full text-sm flex items-center justify-center gap-2">
                          Pertanyaan Berikutnya <FaArrowRight />
                        </button>
                      </div>
                    ) : (
                      <div className="text-center text-sm waiting-pulse py-4">
                        Menunggu pemain lain menjawab...
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-white/70">Tidak ada pertanyaan aktif</p>
                    {!showInput ? (
                      <button
                        onClick={() => setShowInput(true)}
                        className="btn-primary w-full text-sm"
                      >
                        Buat Pertanyaan
                      </button>
                    ) : (
                      <form onSubmit={handleCreateQuestion} className="space-y-3">
                        <textarea
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          className="input-field resize-none"
                          rows="3"
                          placeholder="Tulis pertanyaan..."
                          required
                        ></textarea>
                        <div className="flex gap-3">
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

              <div className="glass-panel p-4 space-y-4">
                <div className="text-center space-y-2">
                  <div className="glow-ring mx-auto">
                    {room?.user2?.displayName?.[0] || room?.user2?.username?.[0]}
                  </div>
                  <p className="text-sm font-semibold text-white/90">
                    {room?.user2?.displayName || room?.user2?.username}
                  </p>
                  {!isUser1 && <p className="text-xs text-fuchsia-200">(Kamu)</p>}
                </div>
                {myAnswerData && !isUser1 && (
                  <div className="glass-panel px-4 py-3 text-xs space-y-2">
                    <p><span className="text-white/70">Tebakan:</span> {myAnswerData.answerText}</p>
                    <p><span className="text-white/70">Kunci:</span> {myAnswerData.correctAnswerText}</p>
                    {bothAnswered && (
                      <div className={myAnswerData.isCorrect ? 'status-correct' : 'status-wrong'}>
                        {myAnswerData.isCorrect ? 'Benar' : 'Salah'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {history.length > 0 && (
              <div className="glass-panel p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Riwayat Pertanyaan</h3>
                  <span className="chip">{history.length} sesi</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {history.map((q) => (
                    <div key={q.id} className="history-item text-xs space-y-1">
                      <p className="font-semibold">{q.questionText}</p>
                      <p className={q.answers.length >= 2 ? 'text-emerald-200' : 'text-white/60'}>
                        {q.answers.length >= 2 ? 'Selesai' : 'Belum selesai'}
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
