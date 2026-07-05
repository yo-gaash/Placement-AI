import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ResumePage from './pages/ResumePage'
import SkillsPage from './pages/SkillsPage'
import InterviewPage from './pages/InterviewPage'
import CodingPage from './pages/CodingPage'
import RoadmapPage from './pages/RoadmapPage'
import ChatPage from './pages/ChatPage'
import CommunicationPage from './pages/CommunicationPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="/resume" element={
          <ProtectedRoute>
            <Layout>
              <ResumePage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/skills" element={
          <ProtectedRoute>
            <Layout>
              <SkillsPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/interview" element={
          <ProtectedRoute>
            <Layout>
              <InterviewPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/coding" element={
          <ProtectedRoute>
            <Layout>
              <CodingPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/roadmap" element={
          <ProtectedRoute>
            <Layout>
              <RoadmapPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/chat" element={
          <ProtectedRoute>
            <Layout>
              <ChatPage />
            </Layout>
          </ProtectedRoute>
        } />

        <Route path="/communication" element={
          <ProtectedRoute>
            <Layout>
              <CommunicationPage />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}
