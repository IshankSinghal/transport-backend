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
const { authMiddleware } = require("../middleware/authMiddleware");

router.post("/", authMiddleware, createBill);

router.get("/", authMiddleware, getAllBills);

router.get("/:billId", authMiddleware, getBillById);

router.put("/:id", authMiddleware, updateBill);

router.delete("/:id", authMiddleware, deleteBill);

router.patch("/:id/payment-status", authMiddleware, updatePaymentStatus);

router.get(
  "/outstanding/:clientId",
  authMiddleware,
  getOutstandingAmountByClient,
);

router.get("/status/:status", authMiddleware, getBillsByPaymentStatus);

router.get("/client/:clientId", authMiddleware, getBillsByClient);

router.get("/overdue", authMiddleware, getOverdueBills);

router.patch("/:id/mark-paid", authMiddleware, markBillAsPaid);

module.exports = router;
