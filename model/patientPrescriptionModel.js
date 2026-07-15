const mongoose = require("mongoose");

const medicationSchema = mongoose.Schema(
  {
    medicine: String,
    dosage: String,
    timing: String,
    freq: String,
    duration: String,
  },
  { _id: false }
);

const patientPrescriptionSchema = mongoose.Schema(
  {
    profileNo: { type: String, required: true, index: true, unique: true },
    patientName: String,
    age: String,
    gender: String,
    consultDate: String,
    complaints: String,
    pastHistory: String,
    sysExam: String,
    diagnosis: String,
    medications: [medicationSchema],
    checkedInvestigations: [String],
    advice: String,
    nextVisit: String,
  },
  { timestamps: true }
);

patientPrescriptionSchema.method("toJSON", function () {
  const { __v, _id, ...object } = this.toObject();
  object.id = _id;
  return object;
});

const PatientPrescription = mongoose.model("patient_prescriptions", patientPrescriptionSchema);

module.exports = PatientPrescription;
