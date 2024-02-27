import {payment,verifyPayment} from "../controllers/Payment.js";
import express from "express";

const router = express.Router();
router.route("/payment")
.post(payment)
router.route("/verifyPayment/:paymentId")
    .post(verifyPayment)
export default router;
