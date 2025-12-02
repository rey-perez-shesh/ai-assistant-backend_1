const Departments = require("../models/departmentscollection");

// CREATE Department
exports.createDepartment = async (req, res) => {
    try {
        const { name, intentsHandled } = req.body;

        const newDept = await Departments.create({
            name,
            intentsHandled
        });

        return res.status(201).json({
            success: true,
            message: "Department created successfully.",
            data: newDept
        });
    } catch (error) {
        console.error("Error creating department:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while creating department."
        });
    }
};

// GET All Departments
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Departments.find();

        return res.status(200).json({
            success: true,
            data: departments
        });
    } catch (error) {
        console.error("Error fetching departments:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while retrieving departments."
        });
    }
};

// GET Single Department by ID
exports.getDepartmentById = async (req, res) => {
    try {
        const dept = await Departments.findById(req.params.id);

        if (!dept) {
            return res.status(404).json({
                success: false,
                message: "Department not found."
            });
        }

        return res.status(200).json({
            success: true,
            data: dept
        });
    } catch (error) {
        console.error("Error retrieving department:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while retrieving department."
        });
    }
};

// UPDATE Department
exports.updateDepartment = async (req, res) => {
    try {
        const { name, intentsHandled } = req.body;

        const updatedDept = await Departments.findByIdAndUpdate(
            req.params.id,
            { name, intentsHandled },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: "Department updated successfully.",
            data: updatedDept
        });
    } catch (error) {
        console.error("Error updating department:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while updating department."
        });
    }
};

// DELETE Department
exports.deleteDepartment = async (req, res) => {
    try {
        await Departments.findByIdAndDelete(req.params.id);

        return res.status(200).json({
            success: true,
            message: "Department deleted successfully."
        });
    } catch (error) {
        console.error("Error deleting department:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while deleting department."
        });
    }
};