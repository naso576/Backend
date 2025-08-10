const mongoose = require('mongoose');
    const schema = mongoose.Schema(
      {
        profileNo : String,
        firstName: String,
        lastName: String,
        gender : String,
        age : Number,
        occupation: String,
        contact:Number,
        address1 : String,
        address2: String,
        consultDate : String
      },
      { timestamps: true }
    );
  
    schema.method("toJSON", function() {
      const { __v, _id, ...object } = this.toObject();
      object.id = _id;
      return object;
    });
  
    const patients = mongoose.model("patient_profiles", schema);
    module.exports=patients;
    module.exports.schema=schema;
  