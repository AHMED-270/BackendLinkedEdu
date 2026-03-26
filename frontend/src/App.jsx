import './App.css'
import { useState } from 'react'
import axios from 'axios'
import AuthHero from './components/AuthHero'
import DirecteurDashboard from './components/DirecteurDashboard'
import LoginCard from './components/LoginCard'

function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState(null)

  const handleLogout = async () => {
    const apiBaseUrl = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000'
    const logoutPath = authenticatedUser?.role === 'admin' ? '/api/admin/logout' : '/api/directeur/logout'

    try {
      await axios.post(
        `${apiBaseUrl}${logoutPath}`,
        {},
        {
          withCredentials: true,
          withXSRFToken: true,
          headers: {
            Accept: 'application/json',
            ...(authenticatedUser?.token
              ? { Authorization: `Bearer ${authenticatedUser.token}` }
              : {}),
          },
        }
      )
    } catch (error) {
      // Silent logout fallback for expired sessions.
    } finally {
      setAuthenticatedUser(null)
    }
  }

  if (authenticatedUser?.role === 'directeur') {
    return <DirecteurDashboard user={authenticatedUser} onLogout={handleLogout} />
  }

  return (
    <main className="auth-page">
      <AuthHero />
      <LoginCard onLoginSuccess={setAuthenticatedUser} />
    </main>
  )
}

export default App
