use rocket::serde::json::Json;
use rocket::State;
use mongodb::bson::{doc, DateTime, oid::ObjectId};

use crate::db::DbConn;
use crate::models::{
    SendOtpDto, VerifyOtpDto, User, KycStatus, UserResponse,
};
use crate::services::{JwtService, msg91::Msg91Service};
use crate::utils::{validate_mobile, validate_email, ApiResponse, ApiError};

/// Send OTP (MSG91)
#[post("/auth/send-otp", data = "<dto>")]
pub async fn send_otp(
    _db: &State<DbConn>, // kept for symmetry
    dto: Json<SendOtpDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    if !validate_mobile(&dto.mobile) {
        return Err(ApiError::bad_request("Invalid mobile number"));
    }

    if !validate_email(&dto.email) {
        return Err(ApiError::bad_request("Invalid email address"));
    }

    Msg91Service::send_otp(&dto.mobile)
        .await
        .map_err(|_| ApiError::internal_error("Failed to send OTP"))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "OTP sent successfully"
    }))))
}

/// Verify OTP (MSG91)
#[post("/auth/verify-otp", data = "<dto>")]
pub async fn verify_otp(
    db: &State<DbConn>,
    dto: Json<VerifyOtpDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    Msg91Service::verify_otp(&dto.mobile, &dto.otp)
        .await
        .map_err(|_| ApiError::unauthorized("Invalid OTP"))?;

    // Find or create user
    let user = db
        .collection::<User>("users")
        .find_one(doc! { "mobile": &dto.mobile }, None)
        .await
        .map_err(|e| ApiError::internal_error(e.to_string()))?;

    let (user, is_new_user) = match user {
        Some(mut u) => {
            u.last_login_at = DateTime::now();
            db.collection::<User>("users")
                .update_one(
                    doc! { "_id": u.id },
                    doc! { "$set": { "last_login_at": DateTime::now() } },
                    None,
                )
                .await
                .ok();
            (u, false)
        }
        None => {
            let user = User {
                id: None,
                mobile: dto.mobile.clone(),
                email: None,
                name: None,
                profile_photo: None,
                city: None,
                pincode: None,
                kyc_status: KycStatus::Pending,
                is_active: true,
                fcm_token: None,
                last_login_at: DateTime::now(),
                created_at: DateTime::now(),
                updated_at: DateTime::now(),
            };

            let result = db
                .collection::<User>("users")
                .insert_one(&user, None)
                .await
                .map_err(|e| ApiError::internal_error(e.to_string()))?;

            let mut u = user;
            u.id = Some(result.inserted_id.as_object_id().unwrap());
            (u, true)
        }
    };

    let user_id = user.id.as_ref().unwrap();

    let access_token = JwtService::generate_access_token(user_id, &user.mobile)
        .map_err(|e| ApiError::internal_error(e.to_string()))?;

    let refresh_token = JwtService::generate_refresh_token(user_id, &user.mobile)
        .map_err(|e| ApiError::internal_error(e.to_string()))?;

    let response = serde_json::json!({
        "message": if is_new_user { "Registration successful" } else { "Login successful" },
        "isNewUser": is_new_user,
        "user": UserResponse::from(user),
        "accessToken": access_token,
        "refreshToken": refresh_token,
    });

    Ok(Json(ApiResponse::success(response)))
}
