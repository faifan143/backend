import { adminLogin , registerAdminPhone } from "../controllers/admin_auth.js";
import { customerLogin , registerCustomerPhone} from "../controllers/customer_auth.js";
import express from "express";
import { updateCords } from "../controllers/user.js";

const router = express.Router();

router.post("/admin_login" , adminLogin ).post("/admin_phone_register",registerAdminPhone );
router.post("/customer_login" , customerLogin ).post("/customer_phone_register",registerCustomerPhone ).post("/customer_update_cords",updateCords);

export default router;


