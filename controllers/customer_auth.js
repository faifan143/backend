import pool from "../database.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const customerLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        const [rows,fields] = await pool.query(
            `SELECT c.* , cp.cust_phone FROM customers c inner join customer_phones cp on c.cust_email = cp.cust_email  WHERE c.cust_email = ?`,
            [email]
        );

        if (rows.length > 0) {
            const isMatch = await bcrypt.compare(password, rows[0].cust_password);
            if (isMatch) {
                const token = jwt.sign({ id: email }, process.env.JWT_SECRET);
                return res.status(200).json({ state: "success", token , rows , "isAdmin":"false"});
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


export const customerRegister = async (req, res) => {
    try {
        const { email, name, password , address,latitude,longitude } = req.body;
        const picture = req.file;
        
        const [existingRows] = await pool.query(
            `SELECT * FROM customers WHERE cust_email = ?`,
            [email]
        );

        if (existingRows.length > 0) {
            console.log("Registration failed: Email alrecusty exists");
            return res.status(400).json({ state: "false", msg: "Email alrecusty exists" });
        }

        const saltRounds = 10;
        const salt = await bcrypt.genSalt(saltRounds);
        const passwordHash = await bcrypt.hash(password, salt);

        if (!picture) {
            await pool.query(
                `INSERT INTO customers (cust_email, cust_name, cust_password , cust_address , cust_latitude , cust_longitude) VALUES (?, ?, ?,?,?,?)`,
                [email, name, passwordHash ,address,latitude,longitude]
            );
        }
        
        else {
            await pool.query(
                `INSERT INTO customers (cust_email, cust_name, cust_password,cust_picture, cust_address , cust_latitude , cust_longitude) VALUES (?, ?, ?,?,?,?,?)`,
                [email, name, passwordHash , picture.originalname, address,latitude,longitude]
            );
        }
        
        res.status(201).json({ state: "success" });
    } catch (err) {
        console.error("Registration error:", err);
        res.status(500).json({ state: "false", error: "Internal server error" });
    }
};


export const registerCustomerPhone = async (req, res) => {
    try {
        const { email, phone } = req.body;

        const selectQuery = 'SELECT * FROM customers WHERE cust_email = ?';
        const [rows, fields] = await pool.query(selectQuery, [email]);

        if (rows.length > 0) {
            const insertQuery = 'INSERT INTO customer_phones (cust_email, cust_phone) VALUES (?, ?)';
            const [insertRows, insertFields] = await pool.query(insertQuery, [email, phone]);

            if (insertRows.affectedRows > 0) {
                return res.status(200).json({ state: 'success' });
            } else {
                return res.status(400).json({ state: 'fail', message: 'Failed custding phone number' });
            }
        } else {
            return res.status(400).json({ state: 'fail', message: 'No email found' });
        }
    } catch (error) {
        console.error('Error registering customer phone:', error);
        return res.status(500).json({ state: 'error', message: 'An error occurred while registering customer phone' });
    }
};

