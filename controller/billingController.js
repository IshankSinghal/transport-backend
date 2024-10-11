// controllers/billController.js

const Bill = require("../models/Billing");
const { body, validationResult } = require("express-validator");

// Create a new bill
const createBill = async (req, res) => {
  // Validate request body using express-validator
  await body("clientId")
    .isMongoId()
    .withMessage("Client ID must be a valid MongoDB ObjectId.")
    .run(req);
  await body("shipmentId")
    .isMongoId()
    .withMessage("Shipment ID must be a valid MongoDB ObjectId.")
    .run(req);
  await body("dueDate")
    .isISO8601()
    .toDate()
    .withMessage("Due date must be a valid date.")
    .run(req);
  await body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number.")
    .run(req);
  await body("taxAmount")
    .isFloat({ gt: 0 })
    .withMessage("Tax amount must be a positive number.")
    .run(req);
  await body("totalAmount")
    .isFloat({ gt: 0 })
    .withMessage("Total amount must be a positive number.")
    .run(req);
  await body("paymentMethod")
    .isIn(["card", "bank transfer", "cash"])
    .withMessage(
      "Payment method must be either 'card', 'bank transfer', or 'cash'.",
    )
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const {
    clientId,
    shipmentId,
    dueDate,
    amount,
    taxAmount,
    totalAmount,
    paymentMethod,
    paymentStatus = "pending", // Default to 'pending'
    paymentDate,
    GSTIN,
    specialInstructions,
    fuelCost,
  } = req.body;

  try {
    const bill = new Bill({
      clientId,
      shipmentId,
      dueDate,
      amount,
      taxAmount,
      totalAmount,
      paymentMethod,
      paymentStatus,
      paymentDate,
      GSTIN,
      specialInstructions,
      fuelCost,
    });

    await bill.save();

    return res.status(201).json({
      message: "Bill created successfully.",
      bill,
    });
  } catch (error) {
    console.error("Error creating bill:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Get all bills
const getAllBills = async (req, res) => {
  try {
    const bills = await Bill.find().populate("clientId shipmentId").exec();
    return res.status(200).json(bills);
  } catch (error) {
    console.error("Error retrieving bills:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Get a bill by ID
const getBillById = async (req, res) => {
  const { id } = req.params;

  try {
    const bill = await Bill.findById(id).populate("clientId shipmentId").exec();
    if (!bill) {
      return res.status(404).json({ error: "Bill not found." });
    }
    return res.status(200).json(bill);
  } catch (error) {
    console.error("Error retrieving bill:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Update a bill
const updateBill = async (req, res) => {
  const { id } = req.params;

  // Validate request body
  await body("dueDate")
    .optional()
    .isISO8601()
    .toDate()
    .withMessage("Due date must be a valid date.")
    .run(req);
  await body("amount")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Amount must be a positive number.")
    .run(req);
  await body("taxAmount")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Tax amount must be a positive number.")
    .run(req);
  await body("totalAmount")
    .optional()
    .isFloat({ gt: 0 })
    .withMessage("Total amount must be a positive number.")
    .run(req);
  await body("paymentMethod")
    .optional()
    .isIn(["card", "bank transfer", "cash"])
    .withMessage(
      "Payment method must be either 'card', 'bank transfer', or 'cash'.",
    )
    .run(req);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedBill = await Bill.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    }).populate("clientId shipmentId");

    if (!updatedBill) {
      return res.status(404).json({ error: "Bill not found." });
    }

    return res.status(200).json({
      message: "Bill updated successfully.",
      bill: updatedBill,
    });
  } catch (error) {
    console.error("Error updating bill:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Delete a bill
const deleteBill = async (req, res) => {
  const { id } = req.params;

  try {
    const deletedBill = await Bill.findByIdAndDelete(id);

    if (!deletedBill) {
      return res.status(404).json({ error: "Bill not found." });
    }

    return res.status(200).json({
      message: "Bill deleted successfully.",
      bill: deletedBill,
    });
  } catch (error) {
    console.error("Error deleting bill:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Update payment status of a bill
const updatePaymentStatus = async (req, res) => {
  const { id } = req.params;
  const { paymentStatus, paymentDate } = req.body;

  // Validate payment status
  if (!["pending", "paid", "overdue"].includes(paymentStatus)) {
    return res.status(400).json({
      error:
        "Invalid payment status. Must be either 'pending', 'paid', or 'overdue'.",
    });
  }

  try {
    const updatedBill = await Bill.findByIdAndUpdate(
      id,
      {
        paymentStatus,
        paymentDate:
          paymentStatus === "paid" ? paymentDate || new Date() : null, // If status is 'paid', set paymentDate
      },
      { new: true },
    ).populate("clientId shipmentId");

    if (!updatedBill) {
      return res.status(404).json({ error: "Bill not found." });
    }

    return res.status(200).json({
      message: "Payment status updated successfully.",
      bill: updatedBill,
    });
  } catch (error) {
    console.error("Error updating payment status:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};
// Calculate total outstanding amount for a client
const getOutstandingAmountByClient = async (req, res) => {
  const { clientId } = req.params;

  try {
    const outstandingBills = await Bill.find({
      clientId,
      paymentStatus: "pending",
    });

    const totalOutstanding = outstandingBills.reduce(
      (acc, bill) => acc + bill.totalAmount,
      0,
    );

    return res.status(200).json({
      clientId,
      totalOutstanding,
      bills: outstandingBills,
    });
  } catch (error) {
    console.error("Error calculating outstanding amount:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};
// Get bills by payment status
const getBillsByPaymentStatus = async (req, res) => {
  const { status } = req.params;

  // Validate payment status
  if (!["pending", "paid", "overdue"].includes(status)) {
    return res.status(400).json({
      error:
        "Invalid payment status. Must be either 'pending', 'paid', or 'overdue'.",
    });
  }

  try {
    const bills = await Bill.find({ paymentStatus: status }).populate(
      "clientId shipmentId",
    );

    return res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching bills by status:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};
// Get bills by client
const getBillsByClient = async (req, res) => {
  const { clientId } = req.params;

  try {
    const bills = await Bill.find({ clientId }).populate("clientId shipmentId");

    if (bills.length === 0) {
      return res.status(404).json({ error: "No bills found for this client." });
    }

    return res.status(200).json(bills);
  } catch (error) {
    console.error("Error fetching bills by client:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};
// Get overdue bills
const getOverdueBills = async (req, res) => {
  try {
    const today = new Date();
    const overdueBills = await Bill.find({
      dueDate: { $lt: today },
      paymentStatus: { $ne: "paid" },
    }).populate("clientId shipmentId");

    return res.status(200).json(overdueBills);
  } catch (error) {
    console.error("Error fetching overdue bills:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Mark a bill as paid
const markBillAsPaid = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedBill = await Bill.findByIdAndUpdate(
      id,
      { paymentStatus: "paid", paymentDate: new Date() },
      { new: true },
    ).populate("clientId shipmentId");

    if (!updatedBill) {
      return res.status(404).json({ error: "Bill not found." });
    }

    return res.status(200).json({
      message: "Bill marked as paid.",
      bill: updatedBill,
    });
  } catch (error) {
    console.error("Error marking bill as paid:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Export all controller functions
module.exports = {
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
};
