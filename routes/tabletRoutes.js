const express = require('express')
const router = express.Router();

const tablets = require('../controller/tabletsController');

router.post('/addTablet', tablets.addTablet)

router.delete('/deleteTablet:id',tablets.deleteTablet);

router.put('/updateTablet:id',tablets.updateTablet);

router.get('/',tablets.findTabletsList);

module.exports= router;
