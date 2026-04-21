const Staff = require('../models/Staff');

// Récupérer tous les staffs avec pagination et recherche
exports.getAllStaff = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    
    const skip = (page - 1) * limit;
    
    // Construire la requête de recherche
    let query = {};
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ]
      };
    }
    
    const [staff, total] = await Promise.all([
      Staff.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Staff.countDocuments(query)
    ]);
    
    res.json({
      success: true,
      data: staff,
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Erreur getAllStaff:', error);
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Récupérer un staff par ID
exports.getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Personnel non trouvé' });
    }
    res.json({ success: true, data: staff });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error: error.message });
  }
};

// Créer un nouveau staff
exports.createStaff = async (req, res) => {
  try {
    const { email } = req.body;
    
    // Vérifier si l'email existe déjà
    const existingStaff = await Staff.findOne({ email });
    if (existingStaff) {
      return res.status(400).json({ message: 'Cet email est déjà utilisé' });
    }
    
    const staff = new Staff(req.body);
    await staff.save();
    
    // Ne pas renvoyer le mot de passe
    const staffData = staff.toObject();
    delete staffData.password;
    
    res.status(201).json({ success: true, data: staffData });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la création', error: error.message });
  }
};

// Mettre à jour un staff
exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Si le mot de passe est fourni, il sera hashé automatiquement par le pre-save
    const staff = await Staff.findById(id);
    if (!staff) {
      return res.status(404).json({ message: 'Personnel non trouvé' });
    }
    
    // Mettre à jour les champs
    Object.keys(updates).forEach(key => {
      if (key !== '_id' && key !== '__v') {
        staff[key] = updates[key];
      }
    });
    
    await staff.save();
    
    const staffData = staff.toObject();
    delete staffData.password;
    
    res.json({ success: true, data: staffData });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la mise à jour', error: error.message });
  }
};

// Supprimer un staff
exports.deleteStaff = async (req, res) => {
  try {
    const staff = await Staff.findByIdAndDelete(req.params.id);
    if (!staff) {
      return res.status(404).json({ message: 'Personnel non trouvé' });
    }
    res.json({ success: true, message: 'Personnel supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la suppression', error: error.message });
  }
};