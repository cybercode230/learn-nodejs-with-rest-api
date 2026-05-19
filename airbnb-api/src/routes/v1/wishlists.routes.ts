import { Router } from "express";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { toggleWishlist, getWishlists } from "../../controllers/wishlists.controller.js";

const router = Router();

router.get("/", authenticate, getWishlists);
router.post("/toggle", authenticate, toggleWishlist);

export default router;
