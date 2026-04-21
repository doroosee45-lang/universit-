// backend/routes/staffRoutes.js
const express = require('express');
const router = express.Router();
const Staff = require('../models/Staff'); // Si vous avez un modèle Staff
// ou utilisez User avec role staff

// GET /api/staff - Récupérer tout le personnel
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip = (page - 1) * limit;
    
    let query = {};
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    // Si vous utilisez le modèle User avec role staff
    query.role = 'staff';
    
    const staff = await Staff.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const total = await Staff.countDocuments(query);
    
    res.json({
      success: true,
      data: staff,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/staff/:id
router.get('/:id', async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Personnel non trouvé' });
    }
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/staff
router.post('/', async (req, res) => {
  try {
    const { email } = req.body;
    const existing = await Staff.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email déjà utilisé' });
    }
    
    const staff = new Staff({ ...req.body, role: 'staff' });
    await staff.save();
    
    const staffData = staff.toObject();
    delete staffData.password;
    
    res.status(201).json({ success: true, data: staffData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/staff/:id
router.put('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!staff) {
      return res.status(404).json({ message: 'Personnel non trouvé' });
    }
    
    const staffData = staff.toObject();
    delete staffData.password;
    
    res.json({ success: true, data: staffData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE /api/staff/:id
router.delete('/:id', async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Personnel non trouvé' });
    }
    res.json({ success: true, message: 'Personnel supprimé' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;