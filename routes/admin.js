import express from "express";
import {verifyToken} from "../middleware/auth.js"
import { addMainCat , addSubcat, deleteMainCategory, deleteOffer, deleteShop, deleteSubcategory, updateMainCategory, updateOffer, updateShop, updateSubcategory } from "../controllers/admin.js";


const router = express.Router();

router.post("/add_main_category",verifyToken,addMainCat)
        .post("/add_subcategory",verifyToken,addSubcat)
        .post("/update_main_category",verifyToken,updateMainCategory)
        .post("/update_subcategory",verifyToken,updateSubcategory)
        .post("/update_shop",verifyToken,updateShop)
        .post("/update_offer",verifyToken,updateOffer)
        .delete("/delete_main",verifyToken,deleteMainCategory)
        .delete("/delete_sub",verifyToken,deleteSubcategory)
        .delete("/delete_shop",verifyToken,deleteShop)
        .delete("/delete_offer",verifyToken,deleteOffer);

export default router;