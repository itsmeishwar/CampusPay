const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const QRCode = require('qrcode');

const app = express();
const PORT = process.env.PORT || 5001;
const JWT_SECRET = 'campus-fintech-secret-key';

app.use(cors());
app.use(express.json());

// In-memory database
let users = [];
let wallets = [];
let transactions = [];
let vendors = [];

// Middleware to verify JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, role = 'student' } = req.body;

    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: uuidv4(),
      email,
      name,
      role,
      password: hashedPassword,
      createdAt: new Date()
    };

    users.push(user);

    // Create wallet for student
    if (role === 'student') {
      const wallet = {
        id: uuidv4(),
        userId: user.id,
        balance: 0,
        createdAt: new Date()
      };
      wallets.push(wallet);
    }

    // Create vendor record if role is vendor
    if (role === 'vendor') {
      const vendor = {
        id: user.id,
        name: name,
        email: email,
        totalSales: 0,
        createdAt: new Date()
      };
      vendors.push(vendor);
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Wallet routes
app.get('/api/wallet', authenticateToken, (req, res) => {
  const wallet = wallets.find(w => w.userId === req.user.id);
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }
  res.json(wallet);
});

app.post('/api/wallet/add-money', authenticateToken, (req, res) => {
  const { amount } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  const wallet = wallets.find(w => w.userId === req.user.id);
  if (!wallet) {
    return res.status(404).json({ error: 'Wallet not found' });
  }

  wallet.balance += parseFloat(amount);

  // Record transaction
  const transaction = {
    id: uuidv4(),
    userId: req.user.id,
    type: 'credit',
    amount: parseFloat(amount),
    description: 'Wallet top-up',
    timestamp: new Date()
  };
  transactions.push(transaction);

  res.json({
    message: 'Money added successfully',
    balance: wallet.balance,
    transaction
  });
});

// Transaction routes
app.get('/api/transactions', authenticateToken, (req, res) => {
  const userTransactions = transactions.filter(t => t.userId === req.user.id);
  res.json(userTransactions.reverse());
});

// Payment routes
app.post('/api/payments/qr', authenticateToken, async (req, res) => {
  try {
    const { amount, vendorId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }

    const wallet = wallets.find(w => w.userId === req.user.id);
    if (!wallet) {
      return res.status(404).json({ error: 'Wallet not found' });
    }

    if (wallet.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Generate payment QR code
    const paymentData = {
      paymentId: uuidv4(),
      userId: req.user.id,
      vendorId,
      amount: parseFloat(amount),
      timestamp: new Date()
    };

    const qrCodeData = JSON.stringify(paymentData);
    const qrCodeUrl = await QRCode.toDataURL(qrCodeData);

    res.json({
      paymentId: paymentData.paymentId,
      qrCode: qrCodeUrl,
      amount: parseFloat(amount)
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

app.post('/api/payments/process', async (req, res) => {
  try {
    const { paymentId } = req.body;

    // Find the payment data (in real app, this would be stored temporarily)
    // For demo, we'll process the payment directly
    
    const { amount, userId, vendorId } = req.body;

    // Deduct from student wallet
    const studentWallet = wallets.find(w => w.userId === userId);
    if (!studentWallet || studentWallet.balance < amount) {
      return res.status(400).json({ error: 'Payment failed - insufficient balance' });
    }

    studentWallet.balance -= parseFloat(amount);

    // Record transaction for student
    const studentTransaction = {
      id: uuidv4(),
      userId,
      vendorId,
      type: 'debit',
      amount: parseFloat(amount),
      description: `Payment to vendor`,
      timestamp: new Date()
    };
    transactions.push(studentTransaction);

    // Update vendor sales
    const vendor = vendors.find(v => v.id === vendorId);
    if (vendor) {
      vendor.totalSales += parseFloat(amount);
    }

    res.json({
      message: 'Payment processed successfully',
      transaction: studentTransaction,
      newBalance: studentWallet.balance
    });
  } catch (error) {
    res.status(500).json({ error: 'Payment processing failed' });
  }
});

// Vendor routes
app.get('/api/vendor/sales', authenticateToken, (req, res) => {
  if (req.user.role !== 'vendor') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const vendor = vendors.find(v => v.id === req.user.id);
  if (!vendor) {
    return res.status(404).json({ error: 'Vendor not found' });
  }

  const vendorTransactions = transactions.filter(t => t.vendorId === req.user.id);
  
  res.json({
    vendor,
    transactions: vendorTransactions.reverse(),
    totalSales: vendor.totalSales
  });
});

// Admin routes
app.get('/api/admin/dashboard', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const dashboard = {
    totalUsers: users.length,
    totalStudents: users.filter(u => u.role === 'student').length,
    totalVendors: users.filter(u => u.role === 'vendor').length,
    totalTransactions: transactions.length,
    totalWalletBalance: wallets.reduce((sum, w) => sum + w.balance, 0),
    recentTransactions: transactions.slice(-10).reverse()
  };

  res.json(dashboard);
});

app.get('/api/admin/users', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  const usersWithWallets = users.map(user => {
    const wallet = wallets.find(w => w.userId === user.id);
    return {
      ...user,
      password: undefined,
      walletBalance: wallet ? wallet.balance : 0
    };
  });

  res.json(usersWithWallets);
});

app.get('/api/admin/transactions', authenticateToken, (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied' });
  }

  res.json(transactions.reverse());
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});