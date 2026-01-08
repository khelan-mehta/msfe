use rocket::serde::json::Json;
use rocket::State;
use rocket_okapi::openapi;
use mongodb::bson::{doc, DateTime};
use mongodb::options::FindOptions;
use crate::db::DbConn;
use crate::models::{CreateWorkerProfileDto, Subscription, SubscriptionPlan, UpdateWorkerProfileDto, WorkerProfile, SubscriptionType, SubscriptionStatus, NearbyWorkerQuery, GeoLocation, UpdateLocationDto};
use crate::guards::{AuthGuard, KycGuard};
use crate::utils::{ApiResponse, ApiError};
use hmac::{Hmac, Mac};
use sha2::Sha256;
use crate::services::RazorpayService;

#[openapi(tag = "Worker")]
#[post("/worker/profile", data = "<dto>")]
pub async fn create_worker_profile(
    db: &State<DbConn>,
    kyc_guard: KycGuard,
    dto: Json<CreateWorkerProfileDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let auth = kyc_guard.auth;
    
     let location = GeoLocation {
        geo_type: String::from("Point"),
        coordinates: [dto.longitude.unwrap_or_default(), dto.latitude.unwrap_or_default()] // lng, lat
    };

    // Check if worker profile already exists
    let existing = db.collection::<WorkerProfile>("worker_profiles")
        .find_one(doc! { "user_id": auth.user_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;
    
    if existing.is_some() {
        return Err(ApiError::bad_request("Worker profile already exists"));
    }
    
    // Create worker profile
    let worker = WorkerProfile {
        id: None,
        user_id: auth.user_id,
        categories: dto.categories.clone(),
        subcategories: dto.subcategories.clone(),
        experience_years: dto.experience_years,
        description: dto.description.clone(),
        hourly_rate: dto.hourly_rate,
        license_number: dto.license_number.clone(),
        service_areas: dto.service_areas.clone(),
        subscription_plan: SubscriptionPlan::None,
        subscription_expires_at: None,
        is_verified: false,
        is_available: true,
        rating: 0.0,
        total_reviews: 0,
        total_jobs_completed: 0,
        created_at: DateTime::now(),
        location,
        updated_at: DateTime::now(),
    };
    
    let result = db.collection::<WorkerProfile>("worker_profiles")
        .insert_one(&worker, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to create profile: {}", e)))?;
    
    Ok(Json(ApiResponse::success_with_message(
        "Worker profile created successfully".to_string(),
        serde_json::json!({
            "worker_id": result.inserted_id.as_object_id().unwrap().to_hex()
        })
    )))
}

#[openapi(tag = "Worker")]
#[get("/worker/profile")]
pub async fn get_worker_profile(
    db: &State<DbConn>,
    auth: AuthGuard,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let worker = db.collection::<WorkerProfile>("worker_profiles")
        .find_one(doc! { "user_id": auth.user_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?
        .ok_or_else(|| ApiError::not_found("Worker profile not found"))?;
    
    Ok(Json(ApiResponse::success(serde_json::json!(worker))))
}

#[openapi(tag = "Worker")]
#[put("/worker/profile", data = "<dto>")]
pub async fn update_worker_profile(
    db: &State<DbConn>,
    auth: AuthGuard,
    dto: Json<UpdateWorkerProfileDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    // Build update document
    let mut update_doc = doc! {
        "updated_at": DateTime::now()
    };
    
    if let Some(ref categories) = dto.categories {
        update_doc.insert("categories", categories);
    }
    if let Some(ref subcategories) = dto.subcategories {
        update_doc.insert("subcategories", subcategories);
    }
    if let Some(experience) = dto.experience_years {
        update_doc.insert("experience_years", experience);
    }
    if let Some(ref description) = dto.description {
        update_doc.insert("description", description);
    }
    if let Some(rate) = dto.hourly_rate {
        update_doc.insert("hourly_rate", rate);
    }
    if let Some(ref areas) = dto.service_areas {
        update_doc.insert("service_areas", areas);
    }
    if let Some(available) = dto.is_available {
        update_doc.insert("is_available", available);
    }
    
    let result = db.collection::<WorkerProfile>("worker_profiles")
        .update_one(
            doc! { "user_id": auth.user_id },
            doc! { "$set": update_doc },
            None
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to update profile: {}", e)))?;
    
    if result.matched_count == 0 {
        return Err(ApiError::not_found("Worker profile not found"));
    }
    
    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "Worker profile updated successfully"
    }))))
}

#[openapi(tag = "Worker")]
#[delete("/worker/profile")]
pub async fn delete_worker_profile(
    db: &State<DbConn>,
    auth: AuthGuard,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let result = db.collection::<WorkerProfile>("worker_profiles")
        .delete_one(doc! { "user_id": auth.user_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to delete profile: {}", e)))?;
    
    if result.deleted_count == 0 {
        return Err(ApiError::not_found("Worker profile not found"));
    }
    
    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "Worker profile deleted successfully"
    }))))
}

#[derive(FromForm, serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct SearchWorkersQuery {
    pub category: Option<String>,
    pub subcategory: Option<String>,
    pub city: Option<String>,
    pub min_rating: Option<f64>,
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[openapi(tag = "Worker")]
#[get("/worker/search?<query..>")]
pub async fn search_workers(
    db: &State<DbConn>,
    query: SearchWorkersQuery,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100);
    let skip = (page - 1) * limit;
    
    let mut filter = doc! {
        "is_available": true,
        "is_verified": true,
    };
    
    if let Some(category) = query.category {
        filter.insert("categories", category);
    }
    
    if let Some(subcategory) = query.subcategory {
        filter.insert("subcategories", subcategory);
    }
    
    if let Some(min_rating) = query.min_rating {
        filter.insert("rating", doc! { "$gte": min_rating });
    }
    
    // TODO: Add city filter by joining with users collection
    
    let find_options = FindOptions::builder()
        .skip(skip as u64)
        .limit(limit)
        .sort(doc! { 
            "subscription_plan": -1, // Gold > Silver > None
            "rating": -1,
            "total_reviews": -1
        })
        .build();
    
    let mut cursor = db.collection::<WorkerProfile>("worker_profiles")
        .find(filter.clone(), find_options)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;
    
    let mut workers = Vec::new();
    while cursor.advance().await.map_err(|e| ApiError::internal_error(format!("Cursor error: {}", e)))? {
        let worker = cursor.deserialize_current()
            .map_err(|e| ApiError::internal_error(format!("Deserialization error: {}", e)))?;
        workers.push(worker);
    }
    
    let total = db.collection::<WorkerProfile>("worker_profiles")
        .count_documents(filter, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Count error: {}", e)))?;
    
    Ok(Json(ApiResponse::success(serde_json::json!({
        "workers": workers,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total as f64 / limit as f64).ceil() as i64,
        }
    }))))
}

#[openapi(tag = "Worker")]
#[get("/worker/<worker_id>")]
pub async fn get_worker_by_id(
    db: &State<DbConn>,
    worker_id: String,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let object_id = mongodb::bson::oid::ObjectId::parse_str(&worker_id)
        .map_err(|_| ApiError::bad_request("Invalid worker ID"))?;
    
    let worker = db.collection::<WorkerProfile>("worker_profiles")
        .find_one(doc! { "_id": object_id }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?
        .ok_or_else(|| ApiError::not_found("Worker not found"))?;
    
    Ok(Json(ApiResponse::success(serde_json::json!(worker))))
}

#[derive(serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct UpdateSubscriptionDto {
    pub plan: String, // "silver" or "gold"
}

#[openapi(tag = "Worker")]
#[post("/worker/subscription", data = "<dto>")]
pub async fn update_subscription(
    db: &State<DbConn>,
    auth: AuthGuard,
    dto: Json<UpdateSubscriptionDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let plan = match dto.plan.as_str() {
        "silver" => SubscriptionPlan::Silver,
        "gold" => SubscriptionPlan::Gold,
        _ => return Err(ApiError::bad_request("Invalid plan. Use 'silver' or 'gold'")),
    };
    
    // Calculate expiry (1 year from now)
    let expires_at = DateTime::from_millis(
        chrono::Utc::now().timestamp_millis() + (365 * 24 * 60 * 60 * 1000)
    );
    
    let result = db.collection::<WorkerProfile>("worker_profiles")
        .update_one(
            doc! { "user_id": auth.user_id },
            doc! {
                "$set": {
                    "subscription_plan": format!("{:?}", plan).to_lowercase(),
                    "subscription_expires_at": expires_at,
                    "updated_at": DateTime::now(),
                }
            },
            None
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to update subscription: {}", e)))?;
    
    if result.matched_count == 0 {
        return Err(ApiError::not_found("Worker profile not found"));
    }
    
    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "Subscription updated successfully",
        "plan": dto.plan,
        "expires_at": expires_at,
    }))))
}

#[derive(FromForm, serde::Deserialize, rocket_okapi::okapi::schemars::JsonSchema)]
pub struct WorkerStatsQuery {
    pub page: Option<i64>,
    pub limit: Option<i64>,
}

#[openapi(tag = "Worker")]
#[get("/worker/admin/stats?<query..>")]
pub async fn get_worker_stats(
    db: &State<DbConn>,
    _auth: AuthGuard, // TODO: Add admin guard
    query: WorkerStatsQuery,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(100);
    let skip = (page - 1) * limit;
    
    let total_workers = db.collection::<WorkerProfile>("worker_profiles")
        .count_documents(doc! {}, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Count error: {}", e)))?;
    
    let verified_workers = db.collection::<WorkerProfile>("worker_profiles")
        .count_documents(doc! { "is_verified": true }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Count error: {}", e)))?;
    
    let available_workers = db.collection::<WorkerProfile>("worker_profiles")
        .count_documents(doc! { "is_available": true }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Count error: {}", e)))?;
    
    let silver_subscribers = db.collection::<WorkerProfile>("worker_profiles")
        .count_documents(doc! { "subscription_plan": "silver" }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Count error: {}", e)))?;
    
    let gold_subscribers = db.collection::<WorkerProfile>("worker_profiles")
        .count_documents(doc! { "subscription_plan": "gold" }, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Count error: {}", e)))?;
    
    // Get paginated worker list
    let find_options = FindOptions::builder()
        .skip(skip as u64)
        .limit(limit)
        .sort(doc! { "created_at": -1 })
        .build();
    
    let mut cursor = db.collection::<WorkerProfile>("worker_profiles")
        .find(doc! {}, find_options)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;
    
    let mut workers = Vec::new();
    while cursor.advance().await.map_err(|e| ApiError::internal_error(format!("Cursor error: {}", e)))? {
        let worker = cursor.deserialize_current()
            .map_err(|e| ApiError::internal_error(format!("Deserialization error: {}", e)))?;
        workers.push(worker);
    }
    
    Ok(Json(ApiResponse::success(serde_json::json!({
        "stats": {
            "total_workers": total_workers,
            "verified_workers": verified_workers,
            "available_workers": available_workers,
            "silver_subscribers": silver_subscribers,
            "gold_subscribers": gold_subscribers,
        },
        "workers": workers,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total_workers,
            "pages": (total_workers as f64 / limit as f64).ceil() as i64,
        }
    }))))
}

#[derive(serde::Deserialize)]
pub struct VerifyPaymentDto {
    pub razorpay_order_id: String,
    pub razorpay_payment_id: String,
    pub razorpay_signature: String,
}

// #[post("/worker/subscription/verify", data = "<dto>")]
// pub async fn verify_payment(
//     db: &State<DbConn>,
//     auth: AuthGuard,
//     dto: Json<VerifyPaymentDto>,
// ) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {

//     let is_valid = RazorpaySignature::verify(
//         &dto.razorpay_order_id,
//         &dto.razorpay_payment_id,
//         &dto.razorpay_signature,
//     );

//     let status = if is_valid {
//         "success"
//     } else {
//         "failed"
//     };

//     db.collection::<WorkerProfile>("worker_profiles")
//         .update_one(
//             doc! { "user_id": auth.user_id },
//             doc! {
//                 "$set": {
//                     "payment_status": status,
//                     "razorpay_payment_id": &dto.razorpay_payment_id,
//                     "razorpay_signature": &dto.razorpay_signature
//                 }
//             },
//             None
//         )
//         .await
//         .ok();

//     if !is_valid {
//         return Err(ApiError::bad_request("Payment verification failed"));
//     }

//     Ok(Json(ApiResponse::success(json!({
//         "message": "Payment verified"
//     }))))
// }

#[post("/subscription/create/<plan_name>")]
pub async fn create_subscription(
    db: &State<DbConn>,
    kyc_guard: KycGuard,
    plan_name: String,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let auth = kyc_guard.auth;

    // Example pricing (replace with DB lookup)
    let price = match plan_name.as_str() {
        "silver" => 499.0,
        "gold" => 799.0,
        _ => return Err(ApiError::bad_request("Invalid plan")),
    };

    let now = DateTime::now();
    let expires_at = DateTime::from_millis(
        chrono::Utc::now().timestamp_millis() + 365 * 24 * 60 * 60 * 1000,
    );

    // Create subscription (PENDING)
    let subscription = Subscription {
        id: None,
        user_id: auth.user_id,
        subscription_type: SubscriptionType::Worker,
        plan_name: plan_name.clone(),
        price,
        status: SubscriptionStatus::Cancelled, // pending
        starts_at: now,
        expires_at,
        auto_renew: false,
        payment_id: None,
        created_at: now,
        updated_at: now,
    };

    let sub_res = db
        .collection::<Subscription>("subscriptions")
        .insert_one(&subscription, None)
        .await
        .map_err(|e| ApiError::internal_error(e.to_string()))?;

    let order = RazorpayService::create_order(price as i64)
        .await
        .map_err(|_| ApiError::internal_error("Order creation failed"))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "subscription_id": sub_res.inserted_id,
        "order": order
    }))))
}

type HmacSha256 = Hmac<Sha256>;

fn verify_signature(body: &str, signature: &str) -> bool {
    let secret = std::env::var("RAZORPAY_WEBHOOK_SECRET").unwrap();
    let mut mac = HmacSha256::new_from_slice(secret.as_bytes()).unwrap();
    mac.update(body.as_bytes());
    let expected = hex::encode(mac.finalize().into_bytes());
    expected == signature
}

// #[post("/webhooks/razorpay", data = "<body>")]
// pub async fn razorpay_webhook(
//     db: &State<DbConn>,
//     body: String,
//     req: &Request<'_>,
// ) -> Result<(), Status> {
//     let signature = req
//         .headers()
//         .get_one("X-Razorpay-Signature")
//         .ok_or(Status::Unauthorized)?;

//     if !verify_signature(&body, signature) {
//         return Err(Status::Unauthorized);
//     }

//     let payload: serde_json::Value = serde_json::from_str(&body).unwrap();
//     let event = payload["event"].as_str().unwrap_or("");

//     if event == "payment.captured" {
//         let payment_id = payload["payload"]["payment"]["entity"]["id"]
//             .as_str()
//             .unwrap();

//         db.collection::<Subscription>("subscriptions")
//             .update_one(
//                 doc! { "payment_id": payment_id },
//                 doc! {
//                     "$set": {
//                         "status": "active",
//                         "updated_at": DateTime::now()
//                     }
//                 },
//                 None,
//             )
//             .await
//             .ok();
//     }

//     Ok(())
// }

// #[post("/subscription/retry/<subscription_id>")]
// pub async fn retry_payment(
//     db: &State<DbConn>,
//     auth: AuthGuard,
//     subscription_id: String,
// ) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
//     let sub_id = ObjectId::parse_str(&subscription_id)
//         .map_err(|_| ApiError::bad_request("Invalid subscription id"))?;

//     let sub = db
//         .collection::<Subscription>("subscriptions")
//         .find_one(doc! { "_id": sub_id, "user_id": auth.user_id }, None)
//         .await?
//         .ok_or_else(|| ApiError::not_found("Subscription not found"))?;

//     if matches!(sub.status, SubscriptionStatus::Active) {
//         return Err(ApiError::bad_request("Subscription already active"));
//     }

//     let order = RazorpayService::create_order(sub.price)
//         .await
//         .map_err(|_| ApiError::internal_error("Order creation failed"))?;

//     Ok(Json(ApiResponse::success(order)))
// }


#[openapi(tag = "Worker")]
#[get("/worker/nearby?<query..>")]
pub async fn find_nearby_workers(
    db: &State<DbConn>,
    query: NearbyWorkerQuery,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    let page = query.page.unwrap_or(1).max(1);
    let limit = query.limit.unwrap_or(20).min(50);
    let skip = (page - 1) * limit;

    let mut filter = doc! {
        "is_verified": true,
        "is_available": true,
        "location": {
            "$nearSphere": {
                "$geometry": {
                    "type": "Point",
                    "coordinates": [query.longitude, query.latitude]
                },
                "$maxDistance": 10_000 // 10 km in meters
            }
        }
    };

    if let Some(category) = query.category {
        filter.insert("categories", category);
    }

    if let Some(subcategory) = query.subcategory {
        filter.insert("subcategories", subcategory);
    }

    let find_options = FindOptions::builder()
        .skip(skip as u64)
        .limit(limit)
        .build();

    let mut cursor = db
        .collection::<WorkerProfile>("worker_profiles")
        .find(filter.clone(), find_options)
        .await
        .map_err(|e| ApiError::internal_error(e.to_string()))?;

    let mut workers = Vec::new();
    while cursor.advance().await.map_err(|e| ApiError::internal_error(e.to_string()))? {
        workers.push(
            cursor
                .deserialize_current()
                .map_err(|e| ApiError::internal_error(e.to_string()))?,
        );
    }

    let total = db
        .collection::<WorkerProfile>("worker_profiles")
        .count_documents(filter, None)
        .await
        .map_err(|e| ApiError::internal_error(e.to_string()))?;

    Ok(Json(ApiResponse::success(serde_json::json!({
        "workers": workers,
        "pagination": {
            "page": page,
            "limit": limit,
            "total": total,
            "pages": (total as f64 / limit as f64).ceil() as i64
        }
    }))))
}

#[openapi(tag = "Worker")]
#[post("/worker/location", data = "<dto>")]
pub async fn update_worker_location(
    db: &State<DbConn>,
    auth: AuthGuard,
    dto: Json<UpdateLocationDto>,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    // Basic validation
    if !(dto.latitude >= -90.0 && dto.latitude <= 90.0) {
        return Err(ApiError::bad_request("Invalid latitude"));
    }

    if !(dto.longitude >= -180.0 && dto.longitude <= 180.0) {
        return Err(ApiError::bad_request("Invalid longitude"));
    }

    let location = GeoLocation {
        geo_type: "Point".to_string(),
        coordinates: [dto.longitude, dto.latitude],
    };

    let result = db
    .collection::<mongodb::bson::Document>("worker_profiles")
    .update_one(
        doc! { "user_id": auth.user_id },
        doc! {
            "$set": {
                "location": {
                    "type": "Point",
                    "coordinates": vec![dto.longitude, dto.latitude]
                },
                "updated_at": DateTime::now()
            }
        },
        None,
    )
    .await
    .map_err(|e| ApiError::internal_error(e.to_string()))?;

    if result.matched_count == 0 {
        return Err(ApiError::not_found("Worker profile not found"));
    }

    Ok(Json(ApiResponse::success(serde_json::json!({
        "message": "Location updated successfully"
    }))))
}