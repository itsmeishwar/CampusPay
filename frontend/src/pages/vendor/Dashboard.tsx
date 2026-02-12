import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface Vendor {
  id: string
  name: string
  email: string
  totalSales: number
  createdAt: string
}

interface Transaction {
  id: string
  userId: string
  vendorId: string
  type: 'debit' | 'credit'
  amount: number
  description: string
  timestamp: string
}

const VendorDashboard: React.FC = () => {
  const [vendorData, setVendorData] = useState<{ vendor: Vendor; transactions: Transaction[]; totalSales: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchVendorData()
  }, [])

  const fetchVendorData = async () => {
    try {
      const response = await axios.get('/api/vendor/sales')
      setVendorData(response.data)
    } catch (err) {
      setError('Failed to fetch vendor data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (error) return <div className="container"><p>{error}</p></div>
  if (!vendorData) return <div className="container"><p>No vendor data available</p></div>

  return (
    <div className="container">
      <h1>Vendor Dashboard</h1>
      
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-value">${vendorData.totalSales.toFixed(2)}</div>
          <div className="stat-label">Total Sales</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{vendorData.transactions.length}</div>
          <div className="stat-label">Total Transactions</div>
        </div>
      </div>

      <div className="card">
        <h2>Recent Transactions</h2>
        {vendorData.transactions.length === 0 ? (
          <p>No transactions yet</p>
        ) : (
          vendorData.transactions.map((transaction) => (
            <div key={transaction.id} className="transaction-item">
              <div>
                <div><strong>${transaction.amount.toFixed(2)}</strong></div>
                <div style={{ fontSize: '12px', color: '#666' }}>
                  {new Date(transaction.timestamp).toLocaleString()}
                </div>
              </div>
              <div className="transaction-amount credit">
                +${transaction.amount.toFixed(2)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default VendorDashboard