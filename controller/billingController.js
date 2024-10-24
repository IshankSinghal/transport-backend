// controllers/billController.js

const Bill = require("../models/Billing");
const { body, validationResult } = require("express-validator");
const Client = require("../models/Client");
const Shipment = require("../models/Shipment");

// Create a new bill
const createBill = async (req, res) => {
  // Validate request body using express-validator
  await Promise.all([
    body("clientId")
      .isNumeric()
      .withMessage("Client ID must be a valid MongoDB ObjectId.")
      .run(req),
    body("shipmentId")
      .isNumeric()
      .withMessage("Shipment ID must be a valid MongoDB ObjectId.")
      .run(req),
    body("dueDate")
      .isISO8601()
      .toDate()
      .withMessage("Due date must be a valid date.")
      .run(req),
    body("amount")
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a positive number.")
      .run(req),
    body("taxAmount")
      .isFloat({ gt: 0 })
      .optional()
      .withMessage("Tax amount must be a positive number.")
      .run(req),
    body("totalAmount")
      .isFloat({ gt: 0 })
      .optional()
      .withMessage("Total amount must be a positive number.")
      .run(req),
    body("paymentMethod")
      .isIn(["card", "bank transfer", "cash"])
      .withMessage(
        "Payment method must be either 'card', 'bank transfer', or 'cash'.",
      )
      .run(req),
  ]);

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
    if (clientId) {
      const clientExist = await Client.findOne({ clientId });
      if (!clientExist) {
        return res.status(400).json({
          success: false,
          message: "Invalid Client ID. Client does not exist.",
        });
      }
    }
    if (shipmentId) {
      const shipmentExist = await Shipment.findOne({ shipmentId });
      if (!shipmentExist) {
        return res.status(400).json({
          success: false,
          message: "Invalid Shipment ID. Shipment does not exist.",
        });
      }
    }

    const bill = new Bill({
      billId: 0,
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
    const bills = await Bill.find().exec();

    const populatedBills = await Promise.all(
      bills.map(async (bill) => {
        const client = await Client.findOne({ clientId: bill.clientId });
        const clientName = client.clientName;

        const shipment = await Shipment.findOne({
          shipmentId: bill.shipmentId,
        });
        const shipmentName = shipment.shipmentName;

        return {
          ...bill.toObject(),
          clientName,
          shipmentName,
        };
      }),
    );

    return res.status(200).json(populatedBills);
  } catch (error) {
    console.error("Error retrieving bills:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};

// Get a bill by ID
const getBillById = async (req, res) => {
  const { billId } = req.params;

  try {
    const bill = await Bill.findOne({ billId: billId }).exec();
    if (!bill) {
      return res.status(404).json({ error: "Bill not found." });
    }

    const client = await Client.findOne({ clientId: bill.clientId });
    const clientName = client.clientName;

    const shipment = await Shipment.findOne({ shipmentId: bill.shipmentId });
    const shipmentName = shipment.shipmentName;
    return res.status(200).json({
      ...bill.toObject(),
      clientName,
      shipmentName,
    });
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
  await Promise.all([
    body("dueDate")
      .optional()
      .isISO8601()
      .toDate()
      .withMessage("Due date must be a valid date.")
      .run(req),
    body("amount")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Amount must be a positive number.")
      .run(req),
    body("taxAmount")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Tax amount must be a positive number.")
      .run(req),
    body("totalAmount")
      .optional()
      .isFloat({ gt: 0 })
      .withMessage("Total amount must be a positive number.")
      .run(req),
    body("paymentStatus")
      .optional()
      .isIn(["pending", "paid", "overdue"])
      .withMessage(
        "Payment status must be either 'pending', 'paid', or 'overdue'.",
      )
      .run(req),
    body("paymentMethod")
      .optional()
      .isIn(["card", "bank transfer", "cash"])
      .withMessage(
        "Payment method must be either 'card', 'bank transfer', or 'cash'.",
      )
      .run(req),
  ]);

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedBill = await Bill.findOneAndUpdate({ billId: id }, req.body, {
      new: true,
      runValidators: true,
    });
    const client = await Client.findOne({ clientId: updatedBill.clientId });
    const clientName = client.clientName;
    const shipment = await Shipment.findOne({
      shipmentId: updatedBill.shipmentId,
    });
    const shipmentName = shipment.shipmentName;

    if (!updatedBill) {
      return res.status(404).json({ error: "Bill not found." });
    }

    return res.status(200).json({
      message: "Bill updated successfully.",
      ...updatedBill.toObject(),
      clientName,
      shipmentName,
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
    const deletedBill = await Bill.findOneAndDelete({ billId: id });

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
    const overdueBills = await Bill.find({
      dueDate: { $lt: new Date() },
      paymentStatus: "pending",
    }).populate("clientId shipmentId");

    return res.status(200).json(overdueBills);
  } catch (error) {
    console.error("Error fetching overdue bills:", error);
    return res
      .status(500)
      .json({ error: "An internal server error occurred." });
  }
};
const markBillAsPaid = async (req, res) => {
  const { id } = req.params;

  try {
    const updatedBill = await Bill.findOneAndUpdate(
      { billId: id },
      { paymentStatus: "paid", paymentDate: new Date() },
      { new: true, runValidators: true }, // Ensures validations are run on the update
    ).populate("clientId shipmentId");

    // Check if the bill was found
    if (!updatedBill) {
      return res.status(404).json({ error: "Bill not found." });
    }

    // Return success response with updated bill details
    return res.status(200).json({
      message: "Bill marked as paid successfully.",
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
  getOutstandingAmountByClient,
  getBillsByPaymentStatus,
  getBillsByClient,
  getOverdueBills,
  markBillAsPaid,
};
