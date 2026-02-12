import React from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'

const Navbar: React.FC = () => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
// navebar content fot the easy to use 
  return (
    <nav className="navbar">
      <div className="container">
        <a href="/dashboard" className="navbar-brand">
          Campus Fintech Wallet
        </a>
        <ul className="navbar-nav">
          <li>
            <a href="/dashboard" className="nav-link">Dashboard</a>
          </li>
          {user?.role === 'student' && (
            <>
              <li>
                <a href="/wallet" className="nav-link">Wallet</a>
              </li>
              <li>
                <a href="/transactions" className="nav-link">Transactions</a>
              </li>
            </>
          )}
          {user?.role === 'vendor' && (
            <li>
              <a href="/vendor/sales" className="nav-link">Sales</a>
            </li>
          )}
          {user?.role === 'admin' && (
            <>
              <li>
                <a href="/admin/users" className="nav-link">Users</a>
              </li>
              <li>
                <a href="/admin/transactions" className="nav-link">Transactions</a>
              </li>
            </>
          )}
          <li>
            <span className="nav-link">Welcome, {user?.name}</span>
          </li>
          <li>
            <button onClick={handleLogout} className="btn btn-secondary">
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  )
}
// reusable navbar comp
export default Navbar