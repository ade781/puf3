import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login_new';
import Register from './components/Register_new';
import Lobby from './components/Lobby';
import Room from './components/Room';
import './index.css';

function App() {
    return (
        <AuthProvider>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route
                        path="/lobby"
                        element={
                            <ProtectedRoute>
                                <Lobby />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/room/:code"
                        element={
                            <ProtectedRoute>
                                <Room />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="/" element={<Navigate to="/lobby" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

export default App;
