import { useState } from 'react'
import Sidebar from './components/Sidebar'
import DashboardPage from './pages/DashboardPage'
import UsersPage from './pages/UsersPage'
import RoutePage from './pages/RoutePage'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState('dashboard')

  return (
    <div className="app-shell">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />
      <main className="main-panel">
        {activeSection === 'users' ? <UsersPage /> : activeSection === 'routes' ? <RoutePage /> : <DashboardPage />}
      </main>
    </div>
  )
}

export default App
