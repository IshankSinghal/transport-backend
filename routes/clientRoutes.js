const express = require("express");
const {
  createClient,
  getClientById,
  updateClient,
  getClients,
} = require("../controller/clientController"); // Adjust the path as needed
const {
  adminMiddleware,
  authMiddleware,
} = require("../middleware/authMiddleware");
const clientRouter = express.Router();

// Route to create a new client
clientRouter.get("/", authMiddleware, getClients);

clientRouter.post("/", authMiddleware, createClient);

clientRouter.get("/:clientId", authMiddleware, getClientById);

clientRouter.put("/:clientId", authMiddleware, updateClient);

module.exports = clientRouter;
