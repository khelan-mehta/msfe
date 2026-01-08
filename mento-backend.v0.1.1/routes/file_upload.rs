use rocket::serde::json::Json;
use rocket::fs::TempFile;
use rocket::Data;
use rocket_okapi::openapi;
use std::path::Path;
use tokio::fs;
use uuid::Uuid;
use crate::guards::AuthGuard;
use crate::utils::{ApiResponse, ApiError};

#[openapi(tag = "File Upload")]
#[post("/upload/image", data = "<file>")]
pub async fn upload_image(
    mut file: TempFile<'_>,
    _auth: AuthGuard,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    // Validate file type
    let content_type = file.content_type();
    let is_image = content_type
        .map(|ct| ct.is_jpeg() || ct.is_png() || ct.is_webp())
        .unwrap_or(false);
    
    if !is_image {
        return Err(ApiError::bad_request("Only image files (JPEG, PNG, WebP) are allowed"));
    }
    
    // Create uploads directory
    let upload_dir = "uploads/images";
    fs::create_dir_all(upload_dir)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to create directory: {}", e)))?;
    
    // Generate unique filename
    let extension = content_type
        .and_then(|ct| ct.extension())
        .map(|e| e.as_str())
        .unwrap_or("jpg");
    
    let filename = format!("{}_{}.{}", Uuid::new_v4(), chrono::Utc::now().timestamp(), extension);
    let filepath = format!("{}/{}", upload_dir, filename);
    
    // Save file
    file.persist_to(&filepath)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to save file: {}", e)))?;
    
    let file_url = format!("/{}", filepath);
    
    Ok(Json(ApiResponse::success(serde_json::json!({
        "url": file_url,
        "filename": filename,
        "message": "Image uploaded successfully"
    }))))
}

#[openapi(tag = "File Upload")]
#[post("/upload/document", data = "<file>")]
pub async fn upload_document(
    mut file: TempFile<'_>,
    _auth: AuthGuard,
) -> Result<Json<ApiResponse<serde_json::Value>>, ApiError> {
    // Validate file type (PDF, images for KYC)
    let content_type = file.content_type();
    let is_valid = content_type
        .map(|ct| ct.is_pdf() || ct.is_jpeg() || ct.is_png())
        .unwrap_or(false);
    
    if !is_valid {
        return Err(ApiError::bad_request("Only PDF, JPEG, and PNG files are allowed"));
    }
    
    // Create uploads directory
    let upload_dir = "uploads/documents";
    fs::create_dir_all(upload_dir)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to create directory: {}", e)))?;
    
    // Generate unique filename
    let extension = content_type
        .and_then(|ct| ct.extension())
        .map(|e| e.as_str())
        .unwrap_or("pdf");
    
    let filename = format!("{}_{}.{}", Uuid::new_v4(), chrono::Utc::now().timestamp(), extension);
    let filepath = format!("{}/{}", upload_dir, filename);
    
    // Save file
    file.persist_to(&filepath)
        .await
        .map_err(|e| ApiError::internal_error(format!("Failed to save file: {}", e)))?;
    
    let file_url = format!("/{}", filepath);
    
    Ok(Json(ApiResponse::success(serde_json::json!({
        "url": file_url,
        "filename": filename,
        "message": "Document uploaded successfully"
    }))))
}