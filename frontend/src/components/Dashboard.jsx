import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
  FaHeart,
  FaPlus,
  FaSignOutAlt,
  FaTrophy,
  FaCheckCircle,
  FaClock,
  FaTrash,
  FaStar
} from 'react-icons/fa';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, waiting, completed

  useEffect(() => {
    fetchQuestions();
    fetchStatistics();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/questions');
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await api.get('/answers/statistics');
      setStatistics(response.data.statistics);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    try {
      await api.delete(`/questions/${questionId}`);
      fetchQuestions();
      fetchStatistics();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete question');
    }
  };

  const filteredQuestions = questions.filter(q => {
    if (filter === 'waiting') return q.status === 'waiting';
    if (filter === 'completed') return q.status === 'completed';
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-8 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-purple-700 font-bold text-xl">Loading your questions... ✨</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="card">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-black shadow-2xl animate-pulse ring-4 ring-purple-300">
                  {user?.displayName?.[0]?.toUpperCase() || user?.username?.[0]?.toUpperCase()}
                </div>
                <div className="absolute -top-1 -right-1 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                  ⭐
                </div>
              </div>
              <div>
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 flex items-center gap-2">
                  Welcome back, {user?.displayName || user?.username}! 
                  <FaStar className="text-yellow-400 animate-spin text-2xl" style={{animationDuration: '2s'}} />
                </h2>
                <p className="text-gray-700 font-semibold text-lg">Let's see how well you know each other 💕</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="btn-secondary flex items-center gap-2 text-lg"
            >
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {statistics && (
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="card-interactive text-center bg-gradient-to-br from-purple-500 via-purple-600 to-purple-700 text-white shadow-2xl shadow-purple-500/50 border-4 border-purple-400">
              <FaTrophy className="text-5xl mx-auto mb-3 animate-bounce drop-shadow-2xl" />
              <div className="text-4xl font-black mb-1">{statistics.compatibilityScore}%</div>
              <div className="text-sm font-bold opacity-90 uppercase tracking-wider">Compatibility</div>
            </div>
            <div className="card-interactive text-center bg-gradient-to-br from-pink-500 via-pink-600 to-pink-700 text-white shadow-2xl shadow-pink-500/50 border-4 border-pink-400">
              <FaHeart className="text-5xl mx-auto mb-3 animate-pulse drop-shadow-2xl" />
              <div className="text-4xl font-black mb-1">{statistics.totalQuestions}</div>
              <div className="text-sm font-bold opacity-90 uppercase tracking-wider">Total Questions</div>
            </div>
            <div className="card-interactive text-center bg-gradient-to-br from-green-500 via-green-600 to-emerald-600 text-white shadow-2xl shadow-green-500/50 border-4 border-green-400">
              <FaCheckCircle className="text-5xl mx-auto mb-3 drop-shadow-2xl" />
              <div className="text-4xl font-black mb-1">{statistics.correctAnswers}</div>
              <div className="text-sm font-bold opacity-90 uppercase tracking-wider">Correct Answers</div>
            </div>
            <div className="card-interactive text-center bg-gradient-to-br from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-2xl shadow-indigo-500/50 border-4 border-indigo-400">
              <FaPlus className="text-5xl mx-auto mb-3 animate-wiggle drop-shadow-2xl" />
              <div className="text-4xl font-black mb-1">{statistics.questionsAsked}</div>
              <div className="text-sm font-bold opacity-90 uppercase tracking-wider">Questions Asked</div>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <button
            onClick={() => navigate('/create-question')}
            className="btn-primary flex-1 flex items-center justify-center gap-3 text-2xl py-5"
          >
            <FaPlus className="text-2xl" />
            Create New Question
          </button>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="max-w-6xl mx-auto mb-6">
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => setFilter('all')}
            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-500 text-lg transform hover:scale-110 shadow-lg ${
              filter === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-purple-500/50 scale-110'
                : 'bg-white text-purple-600 hover:bg-purple-50 border-4 border-purple-300'
            }`}
          >
            All Questions
          </button>
          <button
            onClick={() => setFilter('waiting')}
            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-500 text-lg transform hover:scale-110 shadow-lg ${
              filter === 'waiting'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-yellow-500/50 scale-110'
                : 'bg-white text-yellow-600 hover:bg-yellow-50 border-4 border-yellow-300'
            }`}
          >
            <FaClock className="inline mr-2" />
            Waiting
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-6 py-3 rounded-2xl font-bold transition-all duration-500 text-lg transform hover:scale-110 shadow-lg ${
              filter === 'completed'
                ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white shadow-green-500/50 scale-110'
                : 'bg-white text-green-600 hover:bg-green-50 border-4 border-green-300'
            }`}
          >
            <FaCheckCircle className="inline mr-2" />
            Completed
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="max-w-6xl mx-auto">
        {filteredQuestions.length === 0 ? (
          <div className="card text-center py-16">
            <FaHeart className="text-8xl text-pink-300 mx-auto mb-6 animate-bounce" />
            <p className="text-gray-700 text-2xl font-bold">
              {filter === 'all' 
                ? "No questions yet. Create one to get started! 💕"
                : `No ${filter} questions. ✨`}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredQuestions.map((question, index) => (
              <div
                key={question.id}
                className="card-interactive fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(`/question/${question.id}`)}
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`badge text-lg ${
                          question.status === 'waiting' ? 'badge-waiting' : 'badge-completed'
                        }`}
                      >
                        {question.status === 'waiting' ? (
                          <>
                            <FaClock className="mr-2" /> Waiting
                          </>
                        ) : (
                          <>
                            <FaCheckCircle className="mr-2" /> Completed
                          </>
                        )}
                      </span>
                      <span className="text-sm text-gray-600 font-bold bg-purple-100 px-4 py-2 rounded-full">
                        by {question.creator.displayName || question.creator.username}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-gray-800 mb-3 hover:text-purple-600 transition-colors duration-300">
                      {question.questionText}
                    </h3>
                    <div className="flex gap-3 text-sm flex-wrap">
                      {question.userHasAnswered ? (
                        <span className="badge badge-correct text-base">✓ You answered</span>
                      ) : (
                        <span className="badge badge-waiting text-base animate-pulse">⏳ Your turn!</span>
                      )}
                      {question.allAnswered && (
                        <span className="badge bg-gradient-to-r from-purple-200 to-pink-200 text-purple-800 text-base animate-bounce">
                          🎉 All answered!
                        </span>
                      )}
                    </div>
                  </div>
                  {question.creatorId === user.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteQuestion(question.id);
                      }}
                      className="text-red-500 hover:text-red-700 hover:bg-red-100 p-3 rounded-2xl transition-all duration-300 hover:scale-125 border-2 border-transparent hover:border-red-400"
                    >
                      <FaTrash className="text-xl" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
