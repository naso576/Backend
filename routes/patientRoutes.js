
    const patients = require("../controller/patientController");
    const patientHistory = require("../controller/patientHistoryController");
    
  
    var router = require("express").Router();
  
    // Create a new Tutorial
    router.post("/createPatientProfile", patients.create);

  
    // Retrieve all Tutorials
    router.get("/findAll", patients.findAll);
  
    // Retrieve all published Tutorials
    router.get("/published", patients.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", patients.findPatient);
  
    // Update a Tutorial with id
    router.put("/:id", patients.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", patients.delete);
  
    // Create a new Tutorial
    router.delete("/", patients.deleteAll);

    router.post('/createPatientHistory', patientHistory.createHistory);

    router.get('/patientHistory/:profileNo', patientHistory.getHistoryByProfileNo);
    router.put('/patientHistory/:profileNo', patientHistory.updateHistoryByProfileNo);
    router.delete('/patientHistory/:profileNo', patientHistory.deleteHistoryByProfileNo);


    module.exports = router;    
