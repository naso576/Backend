

const Patient = require("../model/patientModel")

// Create and Save a new patient profile
// controllers/patient.controller.js

exports.create = async (req, res) => {
  try {
    // Validate at least firstName (extend this as needed)
    if (!req.body.firstName) {
      return res.status(400).json({ message: "First name is required!" });
    }

    // Generate date values
    const today = new Date();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    const day = today.getDate();

    // Utility to generate random number in range
    const randomNumberInRange = (min, max) => {
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };

    // Create unique Profile No
    const num = randomNumberInRange(1, 500);
    const profileNoGenerated = `${year}${month}${day}${num}`;
    const consultDateFormatted = `${day}-${month}-${year}`;

    // Optional: Duration if included in payload
    const duration = req.body.duration && req.body.durationTime
      ? `${req.body.duration} ${req.body.durationTime}`
      : null;

    // Create Patient object — use auto-generated profileNo
    const patient = new Patient({
      profileNo: req.body.profileNo || profileNoGenerated,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      gender: req.body.gender,
      age: req.body.age,
      occupation: req.body.occupation,
      contact: req.body.contact,
      address1: req.body.address1,
      address2: req.body.address2,
      consultDate: consultDateFormatted
    });

    // Save to DB
    const savedPatient = await patient.save();

    // Respond with profileNo for reference
    res.status(201).json({
      message: "Patient profile created successfully",
      profileNo: savedPatient.profileNo,
      data: savedPatient
    });

    console.log("New patient profileNo:", savedPatient.profileNo);

  } catch (err) {
    console.error("Error creating patient:", err);
    res.status(500).json({
      message: err.message || "Some error occurred while creating the patient profile."
    });
  }
};

// Retrieve all Tutorials from the database.
exports.findAll = (req, res) => {
  const lastName = req.query.lastName;
  //var condition = lastName ? { lastName: { $regex: new RegExp(lastName), $options: "i" } } : {};

  Patient.find({})
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};

// Find a single Tutorial with an id
exports.findPatient = (req, res,next) => {

  
  const id = req.params.id;

  console.log('calling'+id)

  Patient.find({profileNo:id})
    .then(data => {
      if (!data)
        res.status(404).send({ message: "Not found Tutorial with id " + id });
      else res.send(data);
      // console.log(data);
    })
    .catch(err => {
      res
        .status(500)
        .send({ message: "Error retrieving Tutorial with id=" + id });
    });
};

// Update a Tutorial by the id in the request
exports.update = (req, res) => {
  // Validate empty body
  if (!req.body || Object.keys(req.body).length === 0) {
    return res.status(400).json({
      message: "Data to update can not be empty!"
    });
  }

  const id = req.params.id; // This is profileNo in your case

  Patient.findOneAndUpdate(
    { profileNo: id },    // filter
    req.body,             // update data
    { new: true }         // return updated document
  )
    .then(data => {
      if (!data) {
        return res.status(404).json({
          message: `Cannot update Patient with profileNo=${id}. Maybe Patient was not found!`
        });
      }

      // Send success response with updated patient
      return res.status(200).json({
        message: "Patient profile was updated successfully",
        profileNo: data.profileNo,
        data: data
      });
    })
    .catch(err => {
      console.error("Error updating patient:", err);
      res.status(500).json({
        message: "Error updating Patient with profileNo=" + id,
        error: err.message || err
      });
    });
};


// Delete a Patient with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Patient.findOneAndDelete(id, { useFindAndModify: false })
    .then(data => {
      if (!data) {
        res.status(404).send({
          message: `Cannot delete Patient with id=${id}. Maybe Patient was not found!`
        });
      } else {
        res.send({
          message: "Patient was deleted successfully!"
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Patient with id=" + id, err
      });
    });
};

// Delete all Patients from the database.
exports.deleteAll = (req, res) => {
    Patient.deleteMany({})
    .then(data => {
      res.send({
        message: `${data.deletedCount} Patient were deleted successfully!`
      });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all Patients."
      });
    });
};

// Find all published Tutorials
exports.findAllPublished = (req, res) => {
    Patient.find({ published: true })
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
};