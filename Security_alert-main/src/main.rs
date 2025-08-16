mod user_authentication;
mod config;
mod utils;
mod enums;
mod dtos;
mod admin_authentication;
mod super_admin_authentication;
mod routes;

use axum::Router;
use std::{env, net::SocketAddr, sync::Arc}; // <-- add env and SocketAddr
use tower_http::cors::{CorsLayer, Any};
use axum::http::header;
use crate::config::config::Config;
use crate::config::database::Database;
use crate::user_authentication::controllers::user_authentication_controller::AuthController;
use crate::user_authentication::services::user_authentication_service::AuthService;
use crate::super_admin_authentication::init_super_admin::ensure_super_admin;
use crate::utils::email::EmailService;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    tracing_subscriber::fmt::init();
    dotenvy::dotenv().ok();

    let config = Config::from_env()?;
    let database = Database::new(&config.database_url).await?;
    let email_service = EmailService::new(config.smtp.clone())?;

    let auth_service = Arc::new(AuthService::new(database.clone(), email_service));
    let auth_controller = Arc::new(AuthController::new(auth_service));

    // Ensure super admin exists
    let user_repo = crate::user_authentication::data::repositories::user_repository::UserRepository::new(database.clone());
    ensure_super_admin(&user_repo).await?;

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_headers([header::AUTHORIZATION, header::CONTENT_TYPE, header::ACCEPT]);

    let app = Router::new()
        .merge(routes::user_authentication_route::routes(auth_controller))
        .merge(routes::health::routes())
        .layer(cors);

    // --- Render-friendly bind: read PORT and listen on 0.0.0.0 ---
    let port: u16 = env::var("PORT").ok()
        .and_then(|p| p.parse().ok())
        .unwrap_or(3000);

    let addr = SocketAddr::from(([0, 0, 0, 0], port)); // 0.0.0.0:PORT
    let listener = tokio::net::TcpListener::bind(addr).await?;
    println!("Server running on http://{}", listener.local_addr()?);
    // -------------------------------------------------------------

    axum::serve(listener, app).await?;
    Ok(())
}
