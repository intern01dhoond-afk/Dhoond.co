
const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');

router.get('/', serviceController.getServicesController);
router.get('/:id', serviceController.getServiceByIdController);
router.post('/', serviceController.createServiceController);
router.delete('/:id', serviceController.deleteServiceController);

module.exports = router;
