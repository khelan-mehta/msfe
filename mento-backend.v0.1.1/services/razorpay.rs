use reqwest::Client;
use serde_json::json;

pub struct RazorpayService;

impl RazorpayService {
    fn key_id() -> String {
        std::env::var("RAZORPAY_KEY_ID").unwrap()
    }

    fn key_secret() -> String {
        std::env::var("RAZORPAY_KEY_SECRET").unwrap()
    }

    pub async fn create_order(amount: f64) -> Result<serde_json::Value, String> {
        let client = Client::new();

        // Convert rupees (possibly fractional) to paise and round to nearest integer
        let amount_paise = (amount * 100.0).round() as i64;

        let res = client
            .post("https://api.razorpay.com/v1/orders")
            .basic_auth(Self::key_id(), Some(Self::key_secret()))
            .json(&json!({
                "amount": amount_paise,
                "currency": "INR",
                "payment_capture": 1
            }))
            .send()
            .await
            .map_err(|e| e.to_string())?;

        Ok(res.json().await.map_err(|e| e.to_string())?)
    }
}
