import React, { useState, useEffect } from 'react'
import axios from 'axios'

interface Wallet {
  id: string
  userId: string
  balance: number
  createdAt: string
}
// logic
const StudentDashboard: React.FC = () => {
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [addAmount, setAddAmount] = useState('')
  const [paymentAmount, setPaymentAmount] = useState('')
  const [vendorId, setVendorId] = useState('')
  const [qrCode, setQrCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWallet()
  }, [])

  const fetchWallet = async () => {
    try {
      const response = await axios.get('/api/wallet')
      setWallet(response.data)
    } catch (err) {
      setError('Failed to fetch wallet data')
    }
  }

  const handleAddMoney = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!addAmount || parseFloat(addAmount) <= 0) return

    setLoading(true)
    try {
      const response = await axios.post('/api/wallet/add-money', {
        amount: parseFloat(addAmount)
      })
      setWallet(response.data.wallet)
      setAddAmount('')
      setError('')
    } catch (err) {
      setError('Failed to add money')
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateQR = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentAmount || !vendorId || parseFloat(paymentAmount) <= 0) return

    setLoading(true)
    try {
      const response = await axios.post('/api/payments/qr', {
        amount: parseFloat(paymentAmount),
        vendorId
      })
      setQrCode(response.data.qrCode)
      setError('')
    } catch (err) {
      setError('Failed to generate QR code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>Student Dashboard</h1>
      
      {wallet && (
        <div className="card">
          <h2>Wallet Balance</h2>
          <div className="wallet-balance">
            ${wallet.balance.toFixed(2)}
          </div>
        </div>
      )}

      <div className="card">
        <h2>Add Money to Wallet</h2>
        <form onSubmit={handleAddMoney}>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-input"
              value={addAmount}
              onChange={(e) => setAddAmount(e.target.value)}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              required
            />
          </div>
          <button type="submit" className="btn btn-success" disabled={loading}>
            {loading ? 'Adding...' : 'Add Money'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Make Payment</h2>
        <form onSubmit={handleGenerateQR}>
          <div className="form-group">
            <label className="form-label">Vendor ID</label>
            <input
              type="text"
              className="form-input"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              placeholder="Enter vendor ID"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Amount</label>
            <input
              type="number"
              className="form-input"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder="Enter amount"
              step="0.01"
              min="0"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Generating...' : 'Generate QR Code'}
          </button>
        </form>
      </div>

      {qrCode && (
        <div className="card">
          <h2>Scan to Pay</h2>
          <div className="qr-code">
            <img src={qrCode} alt="Payment QR Code" />
            <p>Scan this QR code to complete the payment</p>
          </div>
        </div>
      )}

      {error && (
        <div className="card" style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
          {error}
        </div>
      )}
    </div>
  )
}

export default StudentDashboard