const Template = require("../model/templatesModel");

// CREATE a new Template
exports.createTemplate = async (req, res) => {
  try {
    // Destructure relevant fields from request body
    const {
      templateId,
      templateName,
      templateDesc,
      medicineusage // this should match your medicineUsage schema
    } = req.body;

    // Log request body (for debug)
    console.log('Request Body:', req.body);

    // Create new Template instance
    const template = new Template({
      templateID: templateId,
      templateName,
      prescriptionName: templateDesc,
      medicineUsage: medicineusage, // expects an array of medicine usage objects
    });

    // Save to DB
    await template.save();

    // Respond success
    res.status(201).json({ message: 'Template created successfully' });
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while creating the template.",
    });
  }
};

// VIEW all Templates
exports.viewTemplates = async (req, res) => {
  try {
    const templates = await Template.find({});
    res.json(templates);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving Templates.",
    });
  }
};

// COUNT Templates (returns all templates, you can tweak to return just count)
exports.cntTemplates = async (req, res) => {
  try {
    // If you want only the count:
    // const count = await Template.countDocuments();
    // return res.json({ count });

    const templates = await Template.find({});
    res.json(templates);
  } catch (err) {
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving Templates.",
    });
  }
};
