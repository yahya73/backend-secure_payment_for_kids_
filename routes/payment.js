import {payment,verifyPayment,success} from "../controllers/Payment.js";
import express from "express";

const router = express.Router();
router.route("/payment")
.post(payment)
router.route("/verifyPayment/:paymentId")
    .post(verifyPayment)
router.route("/payment/success/:amount")
    .get(success)
export default router;
