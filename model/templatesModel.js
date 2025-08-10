const mongoose = require('mongoose');

  const medicineUsageSchema = new mongoose.Schema({
    medicine: String,
    dosage: String,
    timing: String,
    freq: String,
    duration: String,
  });

  const templateSchema = new mongoose.Schema(
    {
      templateId: String,
      templateName: String,
      prescriptionName: String,
      medicineUsage: [medicineUsageSchema],
    },
    { timestamps: true }
  );

  templateSchema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  // Uncomment and tweak if you use auto-increment functionality
  // autoIncrement.initialize(mongoose.connection);
  // templateSchema.plugin(autoIncrement.plugin, {
  //   model: "prescription_templates",
  //   field: "_id",
  //   startAt: 1,
  //   incrementBy: 1,
  // });

  const templates= mongoose.model("prescription_templates", templateSchema);

  module.exports= templates;
  module.exports.templateSchema=templateSchema;
