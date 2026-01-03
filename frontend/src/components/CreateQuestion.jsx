import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { FaArrowLeft, FaHeart, FaQuestionCircle, FaKey } from 'react-icons/fa';

const CreateQuestion = () => {
    const navigate = useNavigate();
    const [questionText, setQuestionText] = useState('');
    const [creatorAnswer, setCreatorAnswer] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await api.post('/questions', {
                questionText,
                creatorAnswer
            });
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create question');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-4 md:p-8">
            <div className="max-w-2xl mx-auto">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-secondary mb-6 flex items-center gap-2"
                >
                    <FaArrowLeft />
                    Back to Dashboard
                </button>

                <div className="card">
                    <div className="text-center mb-8">
                        <FaHeart className="text-5xl text-pink-500 mx-auto mb-4 animate-pulse" />
                        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600 mb-2">
                            Create a Question
                        </h1>
                        <p className="text-gray-600">
                            Ask something fun and let your partner guess!
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaQuestionCircle className="text-purple-500" />
                                Your Question
                            </label>
                            <textarea
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                className="input-field resize-none"
                                rows="4"
                                placeholder="Example: What's my favorite color? What food do I hate? Where do I want to travel?"
                                required
                                maxLength={500}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {questionText.length}/500 characters
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaKey className="text-purple-500" />
                                Your Answer (The Correct Answer)
                            </label>
                            <input
                                type="text"
                                value={creatorAnswer}
                                onChange={(e) => setCreatorAnswer(e.target.value)}
                                className="input-field"
                                placeholder="The answer to your question"
                                required
                                maxLength={200}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                This will be used to check if your partner got it right!
                            </p>
                        </div>

                        {error && (
                            <div className="bg-red-50 border-2 border-red-200 text-red-600 px-4 py-3 rounded-xl">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/dashboard')}
                                className="btn-secondary flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Creating...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        <FaHeart />
                                        Create Question
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Fun examples */}
                    <div className="mt-8 p-4 bg-purple-50 rounded-xl">
                        <h3 className="font-semibold text-purple-800 mb-2">💡 Fun Ideas:</h3>
                        <ul className="text-sm text-purple-700 space-y-1">
                            <li>• What's my favorite song right now?</li>
                            <li>• What's my biggest pet peeve?</li>
                            <li>• What's my dream vacation destination?</li>
                            <li>• What's my favorite memory with you?</li>
                            <li>• What do I order most at restaurants?</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateQuestion;
