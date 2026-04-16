
const serviceModel = require("../models/service.model");

const getServicesController = async (req, res) => {
  try {
    console.log(`[Service] Fetching services. Category: ${req.query.category}, Search: ${req.query.search}`);
    const services = await serviceModel.getServices(req.query.category, req.query.search);
    console.log(`[Service] Found ${services.length} services.`);
    res.status(200).json({ success: true, services: services });
  } catch (error) { 
    console.error('[Service Error]', error.message);
    res.status(500).json({ success: false, message: error.message }); 
  }
};

const getServiceByIdController = async (req, res) => {
  try {
    const service = await serviceModel.getServiceById(req.params.id);
    if (!service) return res.status(404).json({ success: false, message: 'Not found' });
    res.status(200).json({ success: true, service: service });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const createServiceController = async (req, res) => {
  try {
    const { title, category, original_price, discount_price, discount_tag, description, image } = req.body;
    const service = await serviceModel.createService(title, category, original_price, discount_price, discount_tag, description, image);
    res.status(201).json({ success: true, data: service });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

const deleteServiceController = async (req, res) => {
  try {
    await serviceModel.deleteService(req.params.id);
    res.status(200).json({ success: true, message: 'Deleted' });
  } catch (error) { res.status(500).json({ success: false, message: error.message }); }
};

module.exports = { getServicesController, getServiceByIdController, createServiceController, deleteServiceController };
