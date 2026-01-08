use crate::db::DbConn;
use crate::models::{CategoryResponse, SubCategoryResponse, MainCategory, SubCategory, Service};
use crate::utils::{ApiError, ApiResponse};
use mongodb::bson::doc;
use rocket::State;
use rocket::serde::json::Json;
use rocket_okapi::openapi;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[openapi(tag = "Category")]
#[get("/category/all")]
pub async fn get_all_categories(
    db: &State<DbConn>,
) -> Result<Json<ApiResponse<Vec<CategoryResponse>>>, ApiError> {
    // Fetch all main categories from the main_categories collection
    let mut main_cursor = db
        .collection::<MainCategory>("main_categories")
        .find(None, None)
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;

    let mut main_categories = Vec::new();
    while main_cursor
        .advance()
        .await
        .map_err(|e| ApiError::internal_error(format!("Cursor error: {}", e)))?
    {
        let main_cat = main_cursor
            .deserialize_current()
            .map_err(|e| ApiError::internal_error(format!("Deserialization error: {}", e)))?;
        main_categories.push(main_cat);
    }

    // For each main category, fetch subcategories (may be empty)
    let mut categories: Vec<CategoryResponse> = Vec::new();

    for main_cat in main_categories {
        let main_id = match main_cat.id {
            Some(id) => id,
            None => continue, // skip malformed category without id
        };

        // Find subcategories for this main category
        let mut sub_cursor = db
            .collection::<SubCategory>("sub_categories")
            .find(doc! { "main_category_id": main_id }, None)
            .await
            .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;

        let mut subcategories_vec: Vec<SubCategoryResponse> = Vec::new();
        while sub_cursor
            .advance()
            .await
            .map_err(|e| ApiError::internal_error(format!("Cursor error: {}", e)))?
        {
            let sub = sub_cursor
                .deserialize_current()
                .map_err(|e| ApiError::internal_error(format!("Deserialization error: {}", e)))?;

            subcategories_vec.push(SubCategoryResponse {
                id: sub.id.unwrap().to_hex(),
                name: sub.name,
                description: sub.description,
            });
        }

        categories.push(CategoryResponse {
            id: main_id.to_hex(),
            name: main_cat.name,
            description: main_cat.description,
            icon: main_cat.icon,
            subcategories: subcategories_vec,
        });
    }

    // Sort categories alphabetically
    categories.sort_by(|a, b| a.name.cmp(&b.name));

    Ok(Json(ApiResponse::success(categories)))
}

#[openapi(tag = "Category")]
#[get("/category/<category_name>/subcategories")]
pub async fn get_subcategories(
    db: &State<DbConn>,
    category_name: String,
) -> Result<Json<ApiResponse<Vec<SubCategoryResponse>>>, ApiError> {
    // Find all services in this category
    let mut cursor = db
        .collection::<Service>("services")
        .find(
            doc! {
                "serviceCategory": &category_name
            },
            None,
        )
        .await
        .map_err(|e| ApiError::internal_error(format!("Database error: {}", e)))?;

    let mut subcategories = Vec::new();
    while cursor
        .advance()
        .await
        .map_err(|e| ApiError::internal_error(format!("Cursor error: {}", e)))?
    {
        let service = cursor
            .deserialize_current()
            .map_err(|e| ApiError::internal_error(format!("Deserialization error: {}", e)))?;

        subcategories.push(SubCategoryResponse {
            id: service.id.unwrap().to_hex(),
            name: service.name,
            description: Some(service.description),
        });
    }

    if subcategories.is_empty() {
        return Err(ApiError::not_found("Category not found"));
    }

    Ok(Json(ApiResponse::success(subcategories)))
}