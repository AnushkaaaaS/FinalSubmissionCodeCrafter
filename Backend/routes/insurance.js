const express = require('express');
const router = express.Router();
const axios = require('axios');

// Dummy data for insurance products
const insuranceData = [
  {
    id: 'li1',
    name: 'Term Life Insurance - 20 Year',
    type: 'life',
    coverageAmount: 500000,
    monthlyPremium: 45,
    term: 20,
    provider: 'Guardian Life',
    rating: 'A++',
    features: ['Guaranteed level premium', 'Convertible to permanent life', 'Death benefit']
  },
  {
    id: 'li2',
    name: 'Whole Life Insurance',
    type: 'life',
    coverageAmount: 1000000,
    monthlyPremium: 150,
    term: 'Lifetime',
    provider: 'Northwestern Mutual',
    rating: 'A++',
    features: ['Lifetime coverage', 'Cash value accumulation', 'Fixed premiums']
  },
  {
    id: 'hi1',
    name: 'Premium Health Insurance',
    type: 'health',
    coverageAmount: 2000000,
    monthlyPremium: 400,
    term: 1,
    provider: 'Blue Cross',
    rating: 'A+',
    features: ['Low deductible', 'Prescription coverage', 'Worldwide coverage']
  },
  {
    id: 'hi2',
    name: 'Family Health Plan',
    type: 'health',
    coverageAmount: 5000000,
    monthlyPremium: 800,
    term: 1,
    provider: 'Aetna',
    rating: 'A',
    features: ['Family coverage', 'Dental & Vision', 'Mental health support']
  },
  {
    id: 'pi1',
    name: 'Property Insurance - Standard',
    type: 'property',
    coverageAmount: 300000,
    monthlyPremium: 100,
    term: 1,
    provider: 'State Farm',
    rating: 'A+',
    features: ['Property damage', 'Theft coverage', 'Natural disasters']
  },
  {
    id: 'pi2',
    name: 'Premium Property Protection',
    type: 'property',
    coverageAmount: 750000,
    monthlyPremium: 200,
    term: 1,
    provider: 'Allstate',
    rating: 'A+',
    features: ['Extended coverage', 'Personal liability', 'Additional living expenses']
  }
];

// Store user insurance portfolios (in-memory for demo)
const userInsurance = new Map();

// Get all insurance products
router.get('/', (req, res) => {
  res.json(insuranceData);
});

// Get insurance by type
router.get('/type/:type', (req, res) => {
  const products = insuranceData.filter(i => i.type === req.params.type);
  res.json(products);
});

// Get user's insurance portfolio
router.get('/portfolio/:email', (req, res) => {
  const email = req.params.email;
  const portfolio = userInsurance.get(email) || [];
  res.json(portfolio);
});

// Buy insurance
router.post('/buy', async (req, res) => {
  const { email, insuranceId } = req.body;

  // Validate input
  if (!email || !insuranceId) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  // Find the insurance product
  const insurance = insuranceData.find(i => i.id === insuranceId);
  if (!insurance) {
    return res.status(404).json({ message: 'Insurance product not found' });
  }

  try {
    // Get user's current credits
    const userStatsResponse = await axios.get(`http://localhost:8000/api/stocks/user-stats/${email}`);
    const userCredits = userStatsResponse.data.currentCredits;

    // Check if user has enough credits for first month's premium
    if (insurance.monthlyPremium > userCredits) {
      return res.status(400).json({
        message: 'Insufficient credits for first month\'s premium',
        required: insurance.monthlyPremium,
        available: userCredits
      });
    }

    // Update user's credits (deduct first month's premium)
    await axios.post('http://localhost:8000/api/users/update-credits', {
      email,
      credits: userCredits - insurance.monthlyPremium
    });

    // Add insurance to user's portfolio
    const userPortfolio = userInsurance.get(email) || [];
    userPortfolio.push({
      ...insurance,
      purchaseDate: new Date().toISOString(),
      nextPaymentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'Active'
    });
    userInsurance.set(email, userPortfolio);

    // Return success response
    res.json({
      message: 'Insurance purchased successfully',
      remainingCredits: userCredits - insurance.monthlyPremium
    });
  } catch (err) {
    console.error('Error buying insurance:', err);
    res.status(500).json({ message: 'Error processing insurance purchase' });
  }
});

// Get insurance by ID
router.get('/:id', (req, res) => {
  const insurance = insuranceData.find(i => i.id === req.params.id);
  if (!insurance) {
    return res.status(404).json({ message: 'Insurance product not found' });
  }
  res.json(insurance);
});

module.exports = router; 