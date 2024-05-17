import express from "express";
import {verifyToken} from "../middleware/auth.js"
import { addFavorite, addFollow, doSearch, evaluateShop, fetchFavorites, fetchFollowings, getCategories, getEvaluates, getShopOffers, getShops, updateCords  } from "../controllers/user.js";


const router = express.Router();

/* READ */
router.post("/update_cords", verifyToken , updateCords )
        .get("/get_categories",verifyToken,getCategories)
        .get("/get_shops",verifyToken,getShops)
        .post("/get_offers",verifyToken,getShopOffers)
        .post("/add_follow",verifyToken,addFollow)
        .post("/add_favorite",verifyToken,addFavorite)
        .post("/get_following",verifyToken,fetchFollowings)
        .post("/get_favorites",verifyToken,fetchFavorites)
        .post("/evaluate_shop",verifyToken,evaluateShop)
        .post("/get_evaluations",verifyToken,getEvaluates)
        .post("/search",verifyToken,doSearch);
export default router;