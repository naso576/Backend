const History = require('../model/patientHistoryModel'); // Adjust path as needed

// Create new patient history
exports.createHistory = async (req, res) => {
  try {
    const historyData = req.body;
    const newHistory = new History(historyData);
    await newHistory.save();
    res.status(201).json(newHistory);
  } catch (error) {
    res.status(500).json({ message: "Failed to create history", error: error.message });
  }
};

// Get all patient histories
exports.getAllHistories = async (req, res) => {
  try {
    const histories = await History.find({});
    res.status(200).json(histories);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch histories", error: error.message });
  }
};

// Get patient history by ID
exports.getHistoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const history = await History.findById(id);
    if (!history) {
      return res.status(404).json({ message: "History not found" });
    }
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history", error: error.message });
  }
};

// Update patient history by ID
exports.updateHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedHistory = await History.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedHistory) {
      return res.status(404).json({ message: "History not found" });
    }
    res.status(200).json(updatedHistory);
  } catch (error) {
    res.status(500).json({ message: "Failed to update history", error: error.message });
  }
};

// Delete patient history by ID
exports.deleteHistory = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedHistory = await History.findByIdAndDelete(id);
    if (!deletedHistory) {
      return res.status(404).json({ message: "History not found" });
    }
    res.status(200).json({ message: "History deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete history", error: error.message });
  }
};

exports.getHistoryByProfileNo = async (req, res) => {
  try {
    const { profileNo } = req.params;
    const history = await History.findOne({ profileNo });
    if (!history) {
      return res.status(404).json({ message: "History not found for the given profileNo" });
    }
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch history", error: error.message });
  }
};
exports.updateHistoryByProfileNo = async (req, res) => {
  try {
    const { profileNo } = req.params;
    const updates = req.body;

    const updatedHistory = await History.findOneAndUpdate(
      { profileNo },
      updates,
      { new: true }
    );

    if (!updatedHistory) {
      return res.status(404).json({ message: "History not found for the given profileNo" });
    }

    res.status(200).json(updatedHistory);
  } catch (error) {
    res.status(500).json({ message: "Failed to update history", error: error.message });
  }
};

exports.deleteHistoryByProfileNo = async (req, res) => {
  try {
    const { profileNo } = req.params;

    const deletedHistory = await History.findOneAndDelete({ profileNo });

    if (!deletedHistory) {
      return res.status(404).json({ message: "History not found for the given profileNo" });
    }

    res.status(200).json({ message: "History deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete history", error: error.message });
  }
};
