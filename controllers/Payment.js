import axios from "axios";

export async function payment(req, res) {
    const url = "https://developers.flouci.com/api/generate_payment";
    const payload = {
        "app_token": process.env.FLOUCT_PUBLIC,
        "app_secret": process.env.FLOUCT_SECRET,
        "accept_card":"true",
        "amount":req.body.amount,
        "success_link": `http://127.0.0.1:9090/api/payment/success/${req.body.amount}`,
        "fail_link": "https://example.website.com/fail",
        "session_timeout_secs": 1200,
        "developer_tracking_id": "814ff20b-114b-4ff3-bd25-0f968e6ef2fc"
    };

    try {
        const result = await axios.post(url, payload);
        res.send(result.data);
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred while processing payment.");
    }
}
export async function success(req, res) {
    console.log("iheebb");
    // Extracting 'amount' parameter from request URL
    const amount = req.params.amount;

    // Logging the value of 'amount' to the console
    console.log(amount);

    // Sending a response back to the client
    res.status(200).send('Success'); // Sending a simple success message
}

export async function verifyPayment(req, res) {
    const paymentId = req.params.id;
    try {
        const response = await axios.get(`https://developers.flouci.com/api/verify_payment/${paymentId}`, {
            headers: {
                'Content-Type': 'application/json',
                'apppublic': process.env.FLOUCT_PUBLIC,
                'appsecret': process.env.FLOUCI_SECRET
            }
        });
        res.send(response.data);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("An error occurred while verifying payment.");
    }
}
