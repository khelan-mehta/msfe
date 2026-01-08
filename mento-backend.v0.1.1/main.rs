#[macro_use]
extern crate rocket;

mod config;
mod db;
mod models;
mod routes;
mod services;
mod guards;
mod utils;

use rocket::{Build, Rocket};
use rocket::fairing::{Fairing, Info, Kind};
use rocket::http::Header;
use rocket::{Request, Response};
use rocket::fs::FileServer;
use rocket_okapi::swagger_ui::{make_swagger_ui, SwaggerUIConfig};
// use rocket_okapi::openapi_get_routes;
use rocket::routes;

pub struct CORS;

#[rocket::async_trait]
impl Fairing for CORS {
    fn info(&self) -> Info {
        Info {
            name: "Add CORS headers to responses",
            kind: Kind::Response,
        }
    }

    async fn on_response<'r>(&self, _request: &'r Request<'_>, response: &mut Response<'r>) {
        response.set_header(Header::new("Access-Control-Allow-Origin", "*"));
        response.set_header(Header::new(
            "Access-Control-Allow-Methods",
            "POST, GET, PUT, DELETE, OPTIONS",
        ));
        response.set_header(Header::new("Access-Control-Allow-Headers", "*"));
        response.set_header(Header::new("Access-Control-Allow-Credentials", "true"));
    }
}

fn get_swagger_docs() -> SwaggerUIConfig {
    SwaggerUIConfig {
        url: "/api/v1/openapi.json".to_owned(),
        ..Default::default()
    }
}

#[launch]
fn rocket() -> Rocket<Build> {
    dotenv::dotenv().ok();
    env_logger::init();

    println!("🚀 Starting Mento Services API...");
    println!("📚 Swagger docs will be available at: http://localhost:8000/api/docs");

    rocket::build()
        .attach(db::init())
        .attach(CORS)
        .mount(
            "/api/v1",
            routes![
                // Auth routes
                routes::auth::send_otp,
                routes::auth::resend_otp,
                routes::auth::verify_otp,
                routes::auth::refresh_token,
                
                // User routes
                routes::user::get_profile,
                routes::user::update_profile,
                routes::user::upload_profile_photo,
                routes::user::update_fcm_token,
                routes::user::delete_account,
                
                // KYC routes
                routes::kyc::submit_kyc,
                routes::kyc::get_kyc_status,
                routes::kyc::get_all_kyc_submissions,
                routes::kyc::get_kyc_by_id,
                routes::kyc::update_kyc_status,
                
                // Worker routes
                routes::worker::create_worker_profile,
                routes::worker::get_worker_profile,
                routes::worker::update_worker_profile,
                routes::worker::delete_worker_profile,
                routes::worker::search_workers,
                routes::worker::get_worker_by_id,
                routes::worker::update_subscription,
                routes::worker::get_worker_stats,
                
                // Job routes
                routes::job::create_job,
                routes::job::get_jobs,
                routes::job::get_job_by_id,
                routes::job::get_my_posted_jobs,
                routes::job::apply_to_job,
                routes::job::update_job_status,
                routes::job::delete_job,
                
                // Category routes
                routes::category::get_all_categories,
                routes::category::get_subcategories,
                
                // File upload routes
                routes::file_upload::upload_image,
                routes::file_upload::upload_document,
                
                // Review routes
                routes::review::create_review,
                routes::review::get_worker_reviews,
                routes::review::delete_review,
            ],
        )
        .mount("/uploads", FileServer::from("uploads"))
        .mount("/api/docs", make_swagger_ui(&get_swagger_docs()))
        .register("/", catchers![not_found, internal_error])
}

#[catch(404)]
fn not_found() -> rocket::serde::json::Value {
    rocket::serde::json::json!({
        "success": false,
        "message": "Resource not found"
    })
}

#[catch(500)]
fn internal_error() -> rocket::serde::json::Value {
    rocket::serde::json::json!({
        "success": false,
        "message": "Internal server error"
    })
}