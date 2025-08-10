
    const patients = require("../controller/patientController");
    
  
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


    module.exports = router;    
