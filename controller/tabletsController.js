const TabletsList = require('../model/tabletsModel');

// ADD tablet


exports.addTablet = async (req, res) => {
  try {
    const { tabletName, Composition } = req.body;

    if (!tabletName || !Composition) {
      return res.status(400).json({ message: "tabletName and Composition are required" });
    }

    // Create a new tablet document
    const tablet = new TabletsList({
      tabletName: tabletName.trim(),
      Composition: Composition.trim()
    });

    const savedTablet = await tablet.save();

    // Send success response
    return res.status(201).json({
      message: "Tablet added successfully",
      data: savedTablet
    });
  } catch (err) {
    console.error("Error adding tablet:", err);
    return res.status(500).json({
      message: err.message || "Some error occurred while adding tablet"
    });
  }
};



exports.updateTablet = async (req, res) => {
  try {
    const { id } = req.params;
    const { tabletName, Composition } = req.body;

    // Validation
    if (!tabletName || !Composition) {
      return res.status(400).json({ message: "tabletName and Composition are required" });
    }

    // Find & update tablet
    const updatedTablet = await TabletsList.findByIdAndUpdate(
      id,
      {
        tabletName: tabletName.trim(),
        Composition: Composition.trim()
      },
      { new: true, runValidators: true } // return updated doc & run schema validations
    );

    if (!updatedTablet) {
      return res.status(404).json({ message: "Tablet not found" });
    }

    return res.status(200).json({
      message: "Tablet updated successfully",
      data: updatedTablet
    });
  } catch (err) {
    console.error("Error updating tablet:", err);
    return res.status(500).json({
      message: err.message || "Some error occurred while updating tablet"
    });
  }
};


exports.findTabletsList = async (req, res) => {
  try {
    console.log('calling');
    const data = await TabletsList.find();
    res.status(200).json(data);  // return with a 200 status and JSON
  } catch (err) {
    console.error('Error retrieving tablets:', err);
    res.status(500).json({
      message: err.message || "Some error occurred while retrieving DATA."
    });
  }
};


// tablet.controller.js

exports.deleteTablet = async (req, res) => {
  try {
    const { id } = req.params;

    // Try to find and delete tablet by ID
    const deleted = await TabletsList.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ message: 'Tablet not found' });
    }

    return res.status(200).json({
      message: 'Tablet deleted successfully',
      data: deleted
    });
  } catch (err) {
    console.error('Error deleting tablet:', err);
    return res.status(500).json({
      message: err.message || 'Some error occurred while deleting tablet'
    });
  }
};
