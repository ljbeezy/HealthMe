const Insurance = require('../models/Insurance');
const providerData = require('../utils/providerData');

exports.getProvidersByState = (req, res) => {
    const { state } = req.query;

    // Validate state input
    if (!state) {
        return res.status(400).json({ message: "State parameter is required" });
    }
    const providers = providerData[state.toUpperCase()] || providerData['OTHER'];
    
    res.json(providers);
};
exports.addInsurance = async (req, res) => {
  const { policyNumber, provider, coverageDetails } = req.body;

  if (!policyNumber || !provider) {
    return res.status(400).json({ message: 'Policy number and provider are required.' });
  }

  try {
    const newInsurance = new Insurance({
      patient: req.user.id, // Matches the 'patient' field in the model
      policyNumber,
      provider,
      coverageDetails
    });

    await newInsurance.save();
    res.status(201).json({ message: 'Insurance added successfully.', insurance: newInsurance });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};

exports.getInsurance = async (req, res) => {
  try {
    const insurance = await Insurance.find({ patient: req.user.id }).sort({ createdAt: -1 });
    res.json(insurance);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
};