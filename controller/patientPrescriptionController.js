const PatientPrescription = require("../model/patientPrescriptionModel");

const cleanMedicationRows = (rows = []) =>
  rows
    .map((row) => ({
      medicine: String(row.medicine || "").trim(),
      dosage: String(row.dosage || "").trim(),
      timing: String(row.timing || "").trim(),
      freq: String(row.freq || "").trim(),
      duration: String(row.duration || "").trim(),
    }))
    .filter((row) => Object.values(row).some(Boolean));

exports.upsertPrescription = async (req, res) => {
  try {
    const { profileNo } = req.body;

    if (!profileNo) {
      return res.status(400).json({ message: "profileNo is required" });
    }

    const payload = {
      ...req.body,
      medications: cleanMedicationRows(req.body.medications || req.body.prescriptions || []),
    };

    const prescription = await PatientPrescription.findOneAndUpdate(
      { profileNo },
      payload,
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      message: "Prescription saved successfully",
      data: prescription,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to save prescription",
      error: error.message,
    });
  }
};

exports.getPrescriptionByProfileNo = async (req, res) => {
  try {
    const { profileNo } = req.params;
    const prescription = await PatientPrescription.findOne({ profileNo });

    if (!prescription) {
      return res.status(404).json({ message: "Prescription not found for the given profileNo" });
    }

    res.status(200).json(prescription);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch prescription",
      error: error.message,
    });
  }
};
