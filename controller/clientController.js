const Client = require("../models/Client"); // Adjust the path as needed

// Create a new client
exports.createClient = async (req, res) => {
  const {
    clientName,
    email,
    phoneNumber,
    companyName,
    industry,
    note,
    status,
  } = req.body;

  // Basic validation
  if (
    !clientName ||
    !email ||
    !phoneNumber ||
    !companyName ||
    !industry ||
    !status
  ) {
    return res
      .status(400)
      .json({ message: "All required fields must be provided" });
  }

  try {
    const newClient = new Client({
      clientId: 0,
      clientName,
      email,
      phoneNumber,
      companyName,
      industry,
      status,
      note,
    });

    await newClient.save(); // This will trigger the pre-save hook

    res.status(201).json({
      message: "Client created successfully",
      client: {
        clientId: newClient.clientId,
        clientName: newClient.clientName,
        email: newClient.email,
        phoneNumber: newClient.phoneNumber,
        companyName: newClient.companyName,
        industry: newClient.industry,
        status: newClient.status,
        note: newClient.note,
      },
    });
  } catch (error) {
    console.error("Error creating client:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get all clients
exports.getClients = async (req, res) => {
  try {
    const clients = await Client.find();
    res.status(200).json(clients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Get a client by ID
exports.getClientById = async (req, res) => {
  try {
    const client = await Client.findById(req.params.id);

    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json(client);
  } catch (error) {
    console.error("Error fetching client by ID:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Update a client by ID
exports.updateClient = async (req, res) => {
  const { clientName, email, phoneNumber, companyName, industry, note } =
    req.body;

  try {
    const updatedClient = await Client.findByIdAndUpdate(
      req.params.id,
      { clientName, email, phoneNumber, companyName, industry, note },
      { new: true, runValidators: true },
    );

    if (!updatedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({
      message: "Client updated successfully",
      client: updatedClient,
    });
  } catch (error) {
    console.error("Error updating client:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// Delete a client by ID
exports.deleteClient = async (req, res) => {
  try {
    const deletedClient = await Client.findByIdAndDelete(req.params.id);

    if (!deletedClient) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(200).json({ message: "Client deleted successfully" });
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({ message: "Server error", error });
  }
};
