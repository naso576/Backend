const templates = require("../controller/templatesController");
const express = require('express');

const router = express.Router();


router.post("/createTemplate", templates.createTemplate);


router.get("/viewTemplates", templates.viewTemplates);

// router.put("/updateTemplate",templates.updateTemplate);


router.get("/cntTemplates",templates.cntTemplates);

module.exports = router;    
