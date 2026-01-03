import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api';
import {
    FaArrowLeft,
    FaHeart,
    FaCheckCircle,
    FaTimesCircle,
    FaKey,
    FaStar
} from 'react-icons/fa';

const QuestionDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [question, setQuestion] = useState(null);
    const [answer, setAnswer] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchQuestion();
    }, [id]);

    const fetchQuestion = async () => {
        try {
            const response = await api.get(`/questions/${id}`);
            setQuestion(response.data.question);
        } catch (error) {
            console.error('Error fetching question:', error);
            setError('Failed to load question');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitAnswer = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);

        try {
            await api.post('/answers', {
                questionId: parseInt(id),
                answerText: answer
            });
            fetchQuestion(); // Refresh to show results
            setAnswer('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to submit answer');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-purple-600 font-semibold">Loading question...</p>
                </div>
            </div>
        );
    }

    if (!question) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 font-semibold">Question not found</p>
                    <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const userAnswer = question.answers.find(a => a.userId === user.id);
    const otherAnswers = question.answers.filter(a => a.userId !== user.id);
    const allAnswered = question.answers.length >= 2;
    const isCreator = question.creatorId === user.id;

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary mb-6 flex items-center gap-2"
                >
                    <FaArrowLeft />
                    Back to Dashboard
                </button>

                {/* Question Card */}
                <div className="card mb-6">
                    <div className="text-center mb-6">
                        <FaHeart className="text-5xl text-pink-500 mx-auto mb-4 animate-pulse" />
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <span className={`badge ${question.status === 'waiting' ? 'badge-waiting' : 'badge-completed'}`}>
                                {question.status === 'waiting' ? 'Waiting for answers' : 'Completed'}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Asked by {question.creator.displayName || question.creator.username}
                        </p>
                        <h1 className="text-3xl font-bold text-gray-800">
                            {question.questionText}
                        </h1>
                    </div>

                    {/* Answer Form (if not answered yet) */}
                    {!userAnswer && (
                        <form onSubmit={handleSubmitAnswer} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Your Answer
                                </label>
                                <input
                                    type="text"
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    className="input-field"
                                    placeholder={isCreator ? "What do you think the answer is?" : "Try to guess!"}
                                    required
                                    maxLength={200}
                                />
                            </div>

                            {error && (
                                <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={submitting}
                                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {submitting ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Submitting...
                                    </span>
                                ) : (
                                    'Submit Answer 💜'
                                )}
                            </button>
                        </form>
                    )}
                </div>

                {/* Results Section */}
                {allAnswered && (
                    <div className="space-y-4">
                        <div className="text-center mb-6">
                            <FaStar className="text-5xl text-yellow-400 mx-auto mb-2 animate-bounce" />
                            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                                Results Are In!
                            </h2>
                        </div>

                        {/* Correct Answer */}
                        <div className="card bg-gradient-to-br from-purple-500 to-pink-500 text-white">
                            <div className="flex items-center gap-3 mb-2">
                                <FaKey className="text-2xl" />
                                <h3 className="text-xl font-bold">Correct Answer</h3>
                            </div>
                            <p className="text-2xl font-semibold">{question.creatorAnswer}</p>
                        </div>

                        {/* All Answers */}
                        {question.answers.map((ans) => (
                            <div
                                key={ans.id}
                                className={`card ${ans.isCorrect
                                        ? 'bg-green-50 border-2 border-green-300'
                                        : 'bg-rose-50 border-2 border-rose-300'
                                    }`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                                                {ans.user.displayName?.[0]?.toUpperCase() || ans.user.username?.[0]?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-gray-800">
                                                    {ans.user.displayName || ans.user.username}
                                                </p>
                                                <p className="text-sm text-gray-600">answered:</p>
                                            </div>
                                        </div>
                                        <p className="text-xl font-semibold text-gray-800 ml-12">
                                            "{ans.answerText}"
                                        </p>
                                    </div>
                                    <div>
                                        {ans.isCorrect ? (
                                            <div className="flex flex-col items-center">
                                                <FaCheckCircle className="text-4xl text-green-600 animate-bounce" />
                                                <span className="badge badge-correct mt-2">Correct! 🎉</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center">
                                                <FaTimesCircle className="text-4xl text-rose-600" />
                                                <span className="badge badge-incorrect mt-2">Not quite 💔</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Waiting for other answers */}
                {userAnswer && !allAnswered && (
                    <div className="card text-center bg-yellow-50 border-2 border-yellow-200">
                        <FaHeart className="text-4xl text-yellow-500 mx-auto mb-3 animate-pulse" />
                        <h3 className="text-xl font-bold text-gray-800 mb-2">
                            You've answered!
                        </h3>
                        <p className="text-gray-600">
                            Waiting for others to answer. Check back later to see the results! 💜
                        </p>
                        <div className="mt-4 p-4 bg-white rounded-xl">
                            <p className="text-sm text-gray-600 mb-1">Your answer:</p>
                            <p className="text-lg font-semibold text-purple-600">"{userAnswer.answerText}"</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuestionDetail;
