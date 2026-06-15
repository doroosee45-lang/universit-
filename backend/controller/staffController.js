const Staff = require('../models/Staff');

// GET /api/staff
exports.getAllStaff = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)  || 1;
    const limit  = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const skip   = (page - 1) * limit;

    const query = {};
    if (search) {
      query.$or = [
        { firstName:  { $regex: search, $options: 'i' } },
        { lastName:   { $regex: search, $options: 'i' } },
        { email:      { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const [staff, total] = await Promise.all([
      Staff.find(query).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit),
      Staff.countDocuments(query),
    ]);

    res.json({
      success: true,
      data:    staff,
      total,
      page,
      pages:   Math.ceil(total / limit),
    });
  } catch (err) {
    console.error('[getAllStaff]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/staff/:id
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id).select('-password');
    if (!staff) return res.status(404).json({ success: false, message: 'Personnel non trouvé' });
    res.json({ success: true, data: staff });
  } catch (err) {
    console.error('[getStaffById]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/staff
exports.createStaff = async (req, res) => {
  try {
    const { email } = req.body;

    const exists = await Staff.findOne({ email: email?.toLowerCase() });
    if (exists) return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé' });

    const staff = await Staff.create({
      ...req.body,
      role:     'staff',
      password: req.body.password || 'Staff@123',
    });

    const staffData = staff.toObject();
    delete staffData.password;

    res.status(201).json({ success: true, data: staffData, message: 'Personnel créé avec succès' });
  } catch (err) {
    console.error('[createStaff]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/staff/:id
exports.updateStaff = async (req, res) => {
  try {
    // Ne jamais modifier le mot de passe via cette route (sécurité)
    delete req.body.password;
    delete req.body._id;
    delete req.body.__v;

    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Personnel non trouvé' });

    Object.assign(staff, req.body);
    await staff.save();

    const staffData = staff.toObject();
    delete staffData.password;

    res.json({ success: true, data: staffData, message: 'Personnel mis à jour' });
  } catch (err) {
    console.error('[updateStaff]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/staff/:id
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) return res.status(404).json({ success: false, message: 'Personnel non trouvé' });
    res.json({ success: true, message: 'Personnel supprimé avec succès' });
  } catch (err) {
    console.error('[deleteStaff]', err);
    res.status(500).json({ success: false, message: err.message });
  }
};