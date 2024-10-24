const {
  getMonthlyShipmentsAndRevenue,
} = require("../controller/dashboardController");
const express = require("express");
const router = express.Router();
router.get("/", getMonthlyShipmentsAndRevenue);
module.exports = router;
