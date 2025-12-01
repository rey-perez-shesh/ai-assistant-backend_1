const express = require("express");
const router = express.Router();

const {
    createDepartment,
    getDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment
} = require("../controllers/departmentscontroller");

// CREATE department
router.post("/", createDepartment);

// GET all departments
router.get("/", getDepartments);

// GET single department
router.get("/:id", getDepartmentById);

// UPDATE department
router.put("/:id", updateDepartment);

// DELETE department
router.delete("/:id", deleteDepartment);

module.exports = router;