const partnerModel = require("../models/partner.model");

const createPartnerController = async (req, res) => {
  try {
    const partner = await partnerModel.createPartner(req.body);
    res.status(201).json(partner);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getPartnersController = async (req, res) => {
  try {
    const partners = await partnerModel.getPartners();
    res.json(partners);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePartnerController = async (req, res) => {
  try {
    await partnerModel.deletePartner(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createPartnerController,
  getPartnersController,
  deletePartnerController
};