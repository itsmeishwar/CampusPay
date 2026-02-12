// Admin Dashboard

import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface DashboardData {
  totalUsers: number
  totalStudents: number
  totalVendors: number
  totalTransactions: number
  totalWalletBalance: number
  recentTransactions: any[]
}

interface User {
  id: string
  email: string
  name: string
  role: string
  walletBalance: number
  createdAt: string
}

const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'transactions'>('dashboard')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardData()
    } else if (activeTab === 'users') {
      fetchUsers()
    }
  }, [activeTab])

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get('/api/admin/dashboard')
      setDashboardData(response.data)
    } catch (err) {
      setError('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/admin/users')
      setUsers(response.data)
    } catch (err) {
      setError('Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (error) return <div className="container"><p>{error}</p></div>

  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('dashboard')}
          style={{ marginRight: '10px' }}
        >
          Dashboard
        </button>
        <button 
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('users')}
          style={{ marginRight: '10px' }}
        >
          Users
        </button>
        <button 
          className={`btn ${activeTab === 'transactions' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('transactions')}
        >
          Transactions
        </button>
      </div>

      {activeTab === 'dashboard' && dashboardData && (
        <>
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-value">{dashboardData.totalUsers}</div>
              <div className="stat-label">Total Users</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData.totalStudents}</div>
              <div className="stat-label">Students</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData.totalVendors}</div>
              <div className="stat-label">Vendors</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{dashboardData.totalTransactions}</div>
              <div className="stat-label">Transactions</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">${dashboardData.totalWalletBalance.toFixed(2)}</div>
              <div className="stat-label">Total Wallet Balance</div>
            </div>
          </div>

          <div className="card">
            <h2>Recent Transactions</h2>
            {dashboardData.recentTransactions.length === 0 ? (
              <p>No transactions yet</p>
            ) : (
              dashboardData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="transaction-item">
                  <div>
                    <div><strong>{transaction.description}</strong></div>
                    <div style={{ fontSize: '12px', color: '#666' }}>
                      {new Date(transaction.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className={`transaction-amount ${transaction.type}`}>
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <div className="card">
          <h2>All Users</h2>
          {users.length === 0 ? (
            <p>No users found</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #ddd' }}>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '10px', textAlign: 'left' }}>Wallet Balance</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '10px' }}>{user.name}</td>
                    <td style={{ padding: '10px' }}>{user.email}</td>
                    <td style={{ padding: '10px' }}>{user.role}</td>
                    <td style={{ padding: '10px' }}>
                      ${user.walletBalance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeTab === 'transactions' && (
        <div className="card">
          <h2>All Transactions</h2>
          <p>Transaction list would be displayed here</p>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard