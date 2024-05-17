import pool from "../database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows] = await pool.query(
            `SELECT a.*,ap.* FROM admins a inner join admin_phones ap on a.ad_email=ap.ad_email  WHERE a.ad_email = ?`,
            [email]
        );

        if (rows.length > 0) {
            const isMatch = await bcrypt.compare(password, rows[0].ad_password);
            if (isMatch) {
                const token = jwt.sign({ id: email }, process.env.JWT_SECRET);
                return res.status(200).json({ state: "success", token ,rows, "isAdmin":"true"});
            } else {
                console.log("Login failed: Invalid password");
                return res.status(400).json({ state: "false", msg: "Invalid password" });
            }
        } else {
            console.log("Login failed: User not found");
            return res.status(400).json({ state: "false", msg: "User not found" });
        }
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ state: "false", error: "Internal server error" });
    }
};

export const adminRegister = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        const picture = req.file;
        
        const [existingRows] = await pool.query(
            `SELECT * FROM admins WHERE ad_email = ?`,
            [email]
        );

        if (existingRows.length > 0) {
            console.log("Registration failed: Email already exists");
            return res.status(400).json({ state: "false", msg: "Email already exists" });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);

        if (!picture) {
            await pool.query(
                `INSERT INTO admins (ad_email, ad_name, ad_password) VALUES (?, ?, ?)`,
                [email, name, passwordHash ]
            );
        }
        
        else {
            await pool.query(
                `INSERT INTO admins (ad_email, ad_name, ad_password,ad_picture) VALUES (?, ?, ?,?)`,
                [email, name, passwordHash , picture.originalname]
            );
        }
        
        res.status(201).json({ state: "success" });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ state: "false", error: "Internal server error" });
    }
};


export const registerAdminPhone = async (req, res) => {
    try {
        const { email, phone } = req.body;

        const selectQuery = 'SELECT * FROM admins WHERE ad_email = ?';
        const [rows, fields] = await pool.query(selectQuery, [email]);

        if (rows.length > 0) {
            const insertQuery = 'INSERT INTO admin_phones (ad_email, ad_phone) VALUES (?, ?)';
            const [insertRows, insertFields] = await pool.query(insertQuery, [email, phone]);

            if (insertRows.affectedRows > 0) {
                return res.status(200).json({ state: 'success' });
            } else {
                return res.status(400).json({ state: 'fail', message: 'Failed adding phone number' });
            }
        } else {
            return res.status(400).json({ state: 'fail', message: 'No email found' });
        }
    } catch (error) {
        console.error('Error registering admin phone:', error);
        return res.status(500).json({ state: 'error', message: 'An error occurred while registering admin phone' });
    }
};


