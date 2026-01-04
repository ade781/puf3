import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FaCopy, FaSignOutAlt, FaArrowRight, FaPlus, FaTrash } from 'react-icons/fa';

const Room = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [room, setRoom] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [questionText, setQuestionText] = useState('');
  const [showInput, setShowInput] = useState(false);

  const [options, setOptions] = useState([
    { text: '', isCorrect: true },
    { text: '', isCorrect: false }
  ]);
  const [selectedOptionId, setSelectedOptionId] = useState(null);

  useEffect(() => {
    fetchRoomState();
    const interval = setInterval(fetchRoomState, 2000);
    return () => clearInterval(interval);
  }, [code]);

  useEffect(() => {
    if (currentQuestion?.id) {
      setOptions([
        { text: '', isCorrect: true },
        { text: '', isCorrect: false }
      ]);
      setSelectedOptionId(null);
    }
  }, [currentQuestion?.id]);

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

  const handleOptionTextChange = (index, value) => {
    setOptions((prev) => prev.map((option, i) => {
      if (i === index) {
        return { ...option, text: value };
      }
      return option;
    }));
  };

  const handleSetCorrect = (index) => {
    setOptions((prev) => prev.map((option, i) => ({
      ...option,
      isCorrect: i === index
    })));
  };

  const handleAddOption = () => {
    setOptions((prev) => [...prev, { text: '', isCorrect: false }]);
  };

  const handleRemoveOption = (index) => {
    setOptions((prev) => {
      if (prev.length <= 2) {
        return prev;
      }
      const nextOptions = prev.filter((_, i) => i !== index);
      if (!nextOptions.some((option) => option.isCorrect)) {
        nextOptions[0].isCorrect = true;
      }
      return nextOptions;
    });
  };

  const submitOptions = async (e) => {
    e.preventDefault();
    const payload = options
      .map((option) => ({
        optionText: option.text.trim(),
        isCorrect: option.isCorrect
      }))
      .filter((option) => option.optionText.length > 0);

    if (payload.length < 2) {
      alert('Minimal 2 opsi harus diisi.');
      return;
    }

    if (payload.filter((option) => option.isCorrect).length !== 1) {
      alert('Pilih tepat 1 jawaban benar.');
      return;
    }

    try {
      await api.post('/game/options', {
        questionId: currentQuestion.id,
        options: payload
      });
      fetchRoomState();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengirim opsi');
    }
  };

  const submitSelection = async (e) => {
    e.preventDefault();
    if (!selectedOptionId) {
      alert('Pilih salah satu opsi.');
      return;
    }

    try {
      await api.post('/game/selection', {
        questionId: currentQuestion.id,
        selectedOptionId
      });
      fetchRoomState();
    } catch (error) {
      alert(error.response?.data?.message || 'Gagal mengirim pilihan');
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
  const questionOptions = currentQuestion?.options || [];
  const myOptions = questionOptions.filter((option) => option.userId === user?.id);
  const otherOptions = questionOptions.filter((option) => option.userId !== user?.id);
  const uniqueOptionOwners = new Set(questionOptions.map((option) => option.userId));
  const bothOptionsReady = uniqueOptionOwners.size >= 2;

  const selections = currentQuestion?.selections || [];
  const mySelection = selections.find((selection) => selection.userId === user?.id);
  const otherSelection = selections.find((selection) => selection.userId !== user?.id);
  const bothSelectionsReady = selections.length >= 2;

  const myCorrectOption = myOptions.find((option) => option.isCorrect);
  const otherCorrectOption = otherOptions.find((option) => option.isCorrect);

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
            <p className="text-xs text-white/60">
              Buat Fika, biar sesi ini jadi obrolan yang lebih dekat.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to={`/room/${code}/music`} className="btn-secondary text-sm">
              Mode Tebak Lagu
            </Link>
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
                {isUser1 && myCorrectOption && (
                  <div className="glass-panel px-4 py-3 text-xs space-y-2">
                    <p><span className="text-white/70">Kunci kamu:</span> {myCorrectOption.optionText}</p>
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

                    {!myOptions.length ? (
                      <form onSubmit={submitOptions} className="space-y-3">
                        <p className="text-sm text-white/70">
                          Isi opsi jawaban kamu, lalu pilih satu kunci yang benar.
                        </p>
                        <div className="space-y-3">
                          {options.map((option, index) => (
                            <div key={index} className="glass-panel px-3 py-2 flex items-center gap-3">
                              <input
                                type="radio"
                                name="correctOption"
                                checked={option.isCorrect}
                                onChange={() => handleSetCorrect(index)}
                              />
                              <input
                                type="text"
                                value={option.text}
                                onChange={(e) => handleOptionTextChange(index, e.target.value)}
                                className="input-field flex-1"
                                placeholder={`Opsi ${index + 1}`}
                              />
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(index)}
                                className="btn-secondary text-xs"
                                disabled={options.length <= 2}
                              >
                                <FaTrash />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-3">
                          <button type="button" onClick={handleAddOption} className="btn-secondary text-sm">
                            <FaPlus /> Tambah opsi
                          </button>
                          <button type="submit" className="btn-primary flex-1 text-sm">
                            Kirim Opsi
                          </button>
                        </div>
                      </form>
                    ) : !bothOptionsReady ? (
                      <div className="text-center text-sm waiting-pulse py-4">
                        Menunggu lawan selesai membuat opsi...
                      </div>
                    ) : !mySelection ? (
                      <form onSubmit={submitSelection} className="space-y-3">
                        <p className="text-sm text-white/70">
                          Pilih jawaban yang menurutmu benar untuk lawanmu.
                        </p>
                        <div className="space-y-2">
                          {otherOptions.map((option) => (
                            <label key={option.id} className="glass-panel px-3 py-2 flex items-center gap-3">
                              <input
                                type="radio"
                                name="selectedOption"
                                value={option.id}
                                checked={selectedOptionId === option.id}
                                onChange={() => setSelectedOptionId(option.id)}
                              />
                              <span>{option.optionText}</span>
                            </label>
                          ))}
                        </div>
                        <button type="submit" className="btn-primary w-full text-sm">
                          Kirim Pilihan
                        </button>
                      </form>
                    ) : !bothSelectionsReady ? (
                      <div className="text-center text-sm waiting-pulse py-4">
                        Menunggu lawan memilih jawaban...
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="glass-panel p-4 space-y-3">
                          <p className="text-sm font-semibold">Hasil Tebakan</p>
                          <div className="space-y-3 text-xs">
                            <div className="glass-panel px-3 py-2">
                              <p className="font-semibold">{room?.user1?.displayName}:</p>
                              <p>Kunci: {questionOptions.find((option) => option.userId === room.user1.id && option.isCorrect)?.optionText}</p>
                              {selections.find((selection) => selection.userId === room.user2.id) && (
                                <p>
                                  Tebakan {room?.user2?.displayName}: {selections.find((selection) => selection.userId === room.user2.id)?.selectedOption?.optionText}
                                  {' '}({selections.find((selection) => selection.userId === room.user2.id)?.isCorrect ? 'Benar' : 'Salah'})
                                </p>
                              )}
                            </div>
                            <div className="glass-panel px-3 py-2">
                              <p className="font-semibold">{room?.user2?.displayName}:</p>
                              <p>Kunci: {questionOptions.find((option) => option.userId === room.user2.id && option.isCorrect)?.optionText}</p>
                              {selections.find((selection) => selection.userId === room.user1.id) && (
                                <p>
                                  Tebakan {room?.user1?.displayName}: {selections.find((selection) => selection.userId === room.user1.id)?.selectedOption?.optionText}
                                  {' '}({selections.find((selection) => selection.userId === room.user1.id)?.isCorrect ? 'Benar' : 'Salah'})
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                        <button onClick={handleNext} className="btn-next w-full text-sm flex items-center justify-center gap-2">
                          Pertanyaan Berikutnya <FaArrowRight />
                        </button>
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
                {!isUser1 && myCorrectOption && (
                  <div className="glass-panel px-4 py-3 text-xs space-y-2">
                    <p><span className="text-white/70">Kunci kamu:</span> {myCorrectOption.optionText}</p>
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
                      <p className={q.selections?.length >= 2 ? 'text-emerald-200' : 'text-white/60'}>
                        {q.selections?.length >= 2 ? 'Selesai' : 'Belum selesai'}
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
