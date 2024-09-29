const Client = require("../models/client"); // Adjust the path as needed

// Create a new client
exports.createClient = async (req, res) => {
  const { clientName } = req.body;
  // Basic validation
  if (!clientName) {
    return res.status(400).json({ message: "Client name is required" });
  }
  try {
    const newClient = new Client({ clientId: 0, clientName });
    await newClient.save(); // This will trigger the pre-save hook

    res.status(201).json({
      message: "Client created successfully",
      client: {
        clientId: newClient.clientId,
        clientName: newClient.clientName,
      },
    });
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
