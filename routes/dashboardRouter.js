const {
  getMonthlyShipmentsAndRevenue,
} = require("../controller/dashboardController");
const express = require("express");
const { adminMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();
router.get("/", adminMiddleware, getMonthlyShipmentsAndRevenue);
module.exports = router;
