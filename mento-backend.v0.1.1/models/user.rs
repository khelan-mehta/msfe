use mongodb::bson::{oid::ObjectId, DateTime};
use serde::{Deserialize, Serialize};
use rocket_okapi::okapi::schemars;
use rocket_okapi::okapi::schemars::JsonSchema;

#[derive(Debug, Serialize, Deserialize, Clone, JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum KycStatus {
    Pending,
    Submitted,
    Approved,
    Rejected,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FcmToken {
    pub android: Option<String>,
    pub ios: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WorkerSubscriptionInfo {
    pub subscription_id: Option<ObjectId>,
    pub plan_name: Option<String>,
    pub expires_at: Option<DateTime>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct User {
    #[serde(rename = "_id", skip_serializing_if = "Option::is_none")]
    pub id: Option<ObjectId>,

    pub mobile: String,
    pub email: Option<String>,
    pub name: Option<String>,
    pub profile_photo: Option<String>,
    pub city: Option<String>,
    pub pincode: Option<String>,

    pub kyc_status: KycStatus,
    pub is_active: bool,
    pub fcm_token: Option<FcmToken>,

    /* ---------------- WORKER SUBSCRIPTION (FLAT, OPTIONAL) ---------------- */
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub subscription_id: Option<ObjectId>,

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub subscription_plan: Option<String>, // "silver" | "gold"

    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub subscription_expires_at: Option<DateTime>,

    /* ---------------------------------------------------------------------- */

    pub last_login_at: DateTime,
    pub created_at: DateTime,
    pub updated_at: DateTime,
}

#[derive(Debug, Deserialize, JsonSchema)]
pub struct UpdateProfileDto {
    pub name: Option<String>,
    pub email: Option<String>,
    pub city: Option<String>,
    pub pincode: Option<String>,
    pub profile_photo: Option<String>,
}

#[derive(Debug, Serialize, JsonSchema)]
pub struct UserResponse {
    pub id: String,
    pub mobile: String,
    pub email: Option<String>,
    pub name: Option<String>,
    pub profile_photo: Option<String>,
    pub city: Option<String>,
    pub pincode: Option<String>,
    pub kyc_status: String,
}

impl From<User> for UserResponse {
    fn from(user: User) -> Self {
        UserResponse {
            id: user.id.unwrap().to_hex(),
            mobile: user.mobile,
            email: user.email,
            name: user.name,
            profile_photo: user.profile_photo,
            city: user.city,
            pincode: user.pincode,
            kyc_status: format!("{:?}", user.kyc_status).to_lowercase(),
        }
    }
}