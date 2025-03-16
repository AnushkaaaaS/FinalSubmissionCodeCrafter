const express = require('express');
const router = express.Router();
const axios = require('axios');

// Dummy data for bonds
const bondsData = [
  {
    id: 'gb1',
    name: 'US Treasury Bond 2025',
    type: 'government',
    interestRate: 3.5,
    duration: 2,
    minimumInvestment: 1000,
    issuer: 'U.S. Department of the Treasury',
    rating: 'AAA',
    yieldToMaturity: 3.6
  },
  {
    id: 'gb2',
    name: 'US Treasury Bond 2030',
    type: 'government',
    interestRate: 4.2,
    duration: 7,
    minimumInvestment: 1000,
    issuer: 'U.S. Department of the Treasury',
    rating: 'AAA',
    yieldToMaturity: 4.3
  },
  {
    id: 'cb1',
    name: 'Apple Inc. Corporate Bond',
    type: 'corporate',
    interestRate: 4.8,
    duration: 5,
    minimumInvestment: 5000,
    issuer: 'Apple Inc.',
    rating: 'AA+',
    yieldToMaturity: 5.0
  },
  {
    id: 'cb2',
    name: 'Microsoft Corporate Bond',
    type: 'corporate',
    interestRate: 4.9,
    duration: 6,
    minimumInvestment: 5000,
    issuer: 'Microsoft Corporation',
    rating: 'AAA',
    yieldToMaturity: 5.1
  },
  {
    id: 'mb1',
    name: 'NYC Municipal Bond 2026',
    type: 'municipal',
    interestRate: 3.8,
    duration: 3,
    minimumInvestment: 2500,
    issuer: 'City of New York',
    rating: 'AA',
    yieldToMaturity: 3.9
  },
  {
    id: 'mb2',
    name: 'California State Bond 2028',
    type: 'municipal',
    interestRate: 4.0,
    duration: 5,
    minimumInvestment: 2500,
    issuer: 'State of California',
    rating: 'AA-',
    yieldToMaturity: 4.1
  }
];

// Store user bond portfolios (in-memory for demo)
const userBonds = new Map();

// Get all bonds
router.get('/', (req, res) => {
  res.json(bondsData);
});

// Get bonds by type
router.get('/type/:type', (req, res) => {
  const bonds = bondsData.filter(b => b.type === req.params.type);
  res.json(bonds);
});

// Get user's bond portfolio
router.get('/portfolio/:email', (req, res) => {
  const email = req.params.email;
  const portfolio = userBonds.get(email) || [];
  res.json(portfolio);
});

// Buy a bond
router.post('/buy', async (req, res) => {
  const { email, bondId, investment } = req.body;

  // Validate input
  if (!email || !bondId || !investment) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Find the bond
  const bond = bondsData.find(b => b.id === bondId);
  if (!bond) {
    return res.status(404).json({ message: 'Bond not found' });
  }

  // Validate minimum investment
  if (investment < bond.minimumInvestment) {
    return res.status(400).json({ 
      message: `Minimum investment required is $${bond.minimumInvestment}` 
    });
  }

  try {
    // Get user's current credits
    const userStatsResponse = await axios.get(`http://localhost:8000/api/stocks/user-stats/${email}`);
    const userCredits = userStatsResponse.data.currentCredits;

    // Check if user has enough credits
    if (investment > userCredits) {
      return res.status(400).json({
        message: 'Insufficient credits',
        required: investment,
        available: userCredits
      });
    }

    // Update user's credits
    await axios.post('http://localhost:8000/api/users/update-credits', {
      email,
      credits: userCredits - investment
    });

    // Add bond to user's portfolio
    const userPortfolio = userBonds.get(email) || [];
    userPortfolio.push({
      ...bond,
      investmentValue: investment,
      purchaseDate: new Date().toISOString()
    });
    userBonds.set(email, userPortfolio);

    // Return success response
    res.json({
      message: 'Bond purchased successfully',
      remainingCredits: userCredits - investment
    });
  } catch (err) {
    console.error('Error buying bond:', err);
    res.status(500).json({ message: 'Error processing bond purchase' });
  }
});

// Get bond by ID - This route must come after other specific routes
router.get('/:id', (req, res) => {
  const bond = bondsData.find(b => b.id === req.params.id);
  if (!bond) {
    return res.status(404).json({ message: 'Bond not found' });
  }
  res.json(bond);
});

module.exports = router; 