use rocket_okapi::okapi::Map;
use serde::{Deserialize, Serialize};
use rocket::http::Status;
use rocket::response::{self, Responder, Response};
use rocket::Request;
use std::io::Cursor;
use rocket_okapi::okapi::schemars::JsonSchema;
use rocket_okapi::response::OpenApiResponderInner;
use rocket_okapi::r#gen::OpenApiGenerator;
use rocket_okapi::okapi::openapi3::{MediaType, Response as OpenApiResponse, Responses};

/// Generic API response
#[derive(Debug, Serialize, Deserialize, JsonSchema)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub data: Option<T>,
}

impl<T> ApiResponse<T> {
    pub fn success(data: T) -> Self {
        ApiResponse {
            success: true,
            message: None,
            data: Some(data),
        }
    }

    pub fn success_with_message(message: String, data: T) -> Self {
        ApiResponse {
            success: true,
            message: Some(message),
            data: Some(data),
        }
    }

    pub fn error(message: String) -> ApiResponse<()> {
        ApiResponse {
            success: false,
            message: Some(message),
            data: None,
        }
    }
}

/// Error wrapper used in routes
#[derive(Debug, Serialize, JsonSchema)]
pub struct ApiError {
    #[schemars(skip)] // skip non-serializable type in OpenAPI schema
    #[serde(skip_serializing)]
    pub status: Status,
    pub message: String,
}

impl ApiError {
    pub fn bad_request(message: impl Into<String>) -> Self {
        ApiError {
            status: Status::BadRequest,
            message: message.into(),
        }
    }

    pub fn unauthorized(message: impl Into<String>) -> Self {
        ApiError {
            status: Status::Unauthorized,
            message: message.into(),
        }
    }

    pub fn not_found(message: impl Into<String>) -> Self {
        ApiError {
            status: Status::NotFound,
            message: message.into(),
        }
    }

    pub fn internal_error(message: impl Into<String>) -> Self {
        ApiError {
            status: Status::InternalServerError,
            message: message.into(),
        }
    }
}

impl<'r> Responder<'r, 'static> for ApiError {
    fn respond_to(self, _: &'r Request<'_>) -> response::Result<'static> {
        let body = serde_json::to_string(&ApiResponse::<()>::error(self.message))
            .unwrap_or_else(|_| r#"{"success":false,"message":"Internal error"}"#.to_string());

        Response::build()
            .status(self.status)
            .header(rocket::http::ContentType::JSON)
            .sized_body(body.len(), Cursor::new(body))
            .ok()
    }
}

impl OpenApiResponderInner for ApiError {
    fn responses(generator: &mut OpenApiGenerator) -> rocket_okapi::Result<Responses> {
        let schema = generator.json_schema::<ApiError>();
        let mut content = Map::new(); // ✅ FIXED
        content.insert(
            "application/json".to_owned(),
            MediaType {
                schema: Some(schema),
                ..Default::default()
            },
        );

        let mut responses = Responses::default();
        responses.responses.insert(
            "400".to_string(),
            rocket_okapi::okapi::openapi3::RefOr::Object(OpenApiResponse {
                description: "API error response".to_string(),
                content,
                ..Default::default()
            }),
        );

        Ok(responses)
    }
}