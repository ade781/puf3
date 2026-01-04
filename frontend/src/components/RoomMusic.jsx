import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import { FaArrowLeft } from 'react-icons/fa';

const RoomMusic = () => {
  const { code } = useParams();
  const { user } = useAuth();
  const [round, setRound] = useState(null);
  const [guessText, setGuessText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    fetchCurrentRound();
    const interval = setInterval(fetchCurrentRound, 2000);
    return () => clearInterval(interval);
  }, [code]);

  useEffect(() => {
    if (cooldown <= 0) {
      return;
    }
    const timer = setInterval(() => {
      setCooldown((prev) => Math.max(prev - 1, 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const fetchCurrentRound = async () => {
    try {
      const response = await api.get(`/music/${code}/current`);
      setRound(response.data.round);
    } catch (err) {
      console.error(err);
    }
  };

  const startRandomRound = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/music/random', { roomCode: code });
      fetchCurrentRound();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memulai ronde');
    } finally {
      setLoading(false);
    }
  };

  const submitGuess = async (e) => {
    e.preventDefault();
    if (!guessText.trim()) {
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/music/guess', {
        roundId: round.id,
        guessText: guessText.trim()
      });
      setGuessText('');
      fetchCurrentRound();
    } catch (err) {
      const retryAfter = err.response?.data?.retryAfter;
      if (retryAfter) {
        setCooldown(retryAfter);
      }
      setError(err.response?.data?.message || 'Gagal kirim tebakan');
    } finally {
      setLoading(false);
    }
  };

  const surrenderRound = async () => {
    setLoading(true);
    setError('');
    try {
      await api.post('/music/surrender', { roundId: round.id });
      fetchCurrentRound();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyerah');
    } finally {
      setLoading(false);
    }
  };

  const revealReady = round && round.status === 'completed';
  const correctGuess = useMemo(() => {
    if (!round?.guesses?.length) {
      return null;
    }
    return round.guesses.find((guess) => guess.isCorrect);
  }, [round]);

  const hasSurrendered = useMemo(() => {
    if (!round || !user) {
      return false;
    }
    if (round.room?.user1Id === user.id) {
      return round.surrenderedByUser1;
    }
    if (round.room?.user2Id === user.id) {
      return round.surrenderedByUser2;
    }
    return false;
  }, [round, user]);

  return (
    <div className="min-h-screen page-shell">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-8">
        <div className="glass-panel flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-white/60">Mode Tebak Lagu</p>
            <h1 className="text-2xl font-bold title-gradient">Room {code}</h1>
            <p className="text-sm text-white/70">Lagu dipilih otomatis oleh sistem, kalian berdua menebak judulnya.</p>
          </div>
          <Link to={`/room/${code}`} className="btn-secondary inline-flex items-center gap-2 text-sm">
            <FaArrowLeft /> Kembali ke Room
          </Link>
        </div>

        {round ? (
          <div className="glass-card p-6 space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-white/60">Ronde aktif</p>
                <p className="text-lg font-semibold">
                  {revealReady ? `${round.title} - ${round.artist}` : 'Lagu rahasia sedang diputar'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                {round.previewUrl && <audio src={round.previewUrl} controls />}
              </div>
            </div>

            {!revealReady && (
              <form onSubmit={submitGuess} className="space-y-3">
                <input
                  type="text"
                  value={guessText}
                  onChange={(e) => setGuessText(e.target.value)}
                  className="input-field"
                  placeholder="Tebak judul lagu..."
                  disabled={loading || cooldown > 0}
                  required
                />
                <div className="flex flex-col gap-3 sm:flex-row">
                  <button type="submit" disabled={loading || cooldown > 0} className="btn-primary flex-1 text-sm">
                    {cooldown > 0 ? `Coba lagi dalam ${cooldown}s` : 'Kirim Tebakan'}
                  </button>
                  <button
                    type="button"
                    onClick={surrenderRound}
                    disabled={loading || hasSurrendered}
                    className="btn-secondary flex-1 text-sm"
                  >
                    {hasSurrendered ? 'Menunggu lawan menyerah' : 'Menyerah'}
                  </button>
                </div>
              </form>
            )}

            {revealReady && (
              <div className="glass-panel p-4 space-y-3 text-sm">
                <p className="font-semibold">Reveal Lagu</p>
                <p className="text-white/80">{round.title} - {round.artist}</p>
                {correctGuess ? (
                  <p className="text-emerald-200">Ditebak benar oleh {correctGuess.user?.displayName || correctGuess.user?.username}.</p>
                ) : (
                  <p className="text-white/70">Kalian berdua memilih menyerah.</p>
                )}
                <div className="space-y-2">
                  {round.guesses?.map((guess) => (
                    <div key={guess.id} className="glass-panel px-3 py-2">
                      <p className="font-semibold">{guess.user?.displayName || guess.user?.username}</p>
                      <p className="text-white/70">Tebakan: {guess.guessText}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {revealReady && (
              <div className="flex justify-end">
                <button onClick={startRandomRound} className="btn-primary text-sm">
                  Putar Lagu Berikutnya
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="glass-card p-6 space-y-4">
            <div>
              <h2 className="text-xl font-semibold">Mulai ronde baru</h2>
              <p className="text-sm text-white/70">Klik untuk memutar lagu acak dari Deezer.</p>
            </div>
            <button onClick={startRandomRound} disabled={loading} className="btn-primary">
              {loading ? 'Memulai...' : 'Mulai Lagu Random'}
            </button>
            {error && (
              <div className="glass-panel border border-rose-400/40 px-4 py-3 text-sm text-rose-100">
                {error}
              </div>
            )}
          </div>
        )}

        {error && round && (
          <div className="glass-panel border border-rose-400/40 px-4 py-3 text-sm text-rose-100">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default RoomMusic;
