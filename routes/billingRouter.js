// routes/billRoutes.js

const express = require("express");
const router = express.Router();
const {
  createBill,
  getAllBills,
  getBillById,
  updateBill,
  deleteBill,
  updatePaymentStatus,
  getOverdueBills,
  getBillsByClient,
  getBillsByPaymentStatus,
  getOutstandingAmountByClient,
  markBillAsPaid,
} = require("../controller/billingController");

router.post("/", createBill);

router.get("/", getAllBills);

router.get("/:id", getBillById);

router.put("/:id", updateBill);

router.delete("/:id", deleteBill);

router.patch("/:id/payment-status", updatePaymentStatus);

router.get("/outstanding/:clientId", getOutstandingAmountByClient);

router.get("/status/:status", getBillsByPaymentStatus);

router.get("/client/:clientId", getBillsByClient);

router.get("/overdue", getOverdueBills);

router.patch("/:id/mark-paid", markBillAsPaid);

module.exports = router;
