use axum::{
    routing::{get, post},
    Router,
};
use std::sync::Arc;
use crate::user_authentication::controllers::user_authentication_controller::AuthController;

pub fn routes(auth_controller: Arc<AuthController>) -> Router {
    let controller = auth_controller.clone();
    let admin_handler = move |headers, json| {
        let controller = controller.clone();
        async move { controller.create_admin(headers, json).await }
    };

    let controller2 = auth_controller.clone();
    let police_handler = move |headers, json| {
        let controller = controller2.clone();
        async move { controller.create_police(headers, json).await }
    };

    // Start building the router
    Router::new()
        .route("/api/admin/create-admin", post(admin_handler))
        .route("/api/admin/create-police", post(police_handler))
        .route("/api/auth/me", get({
            let controller = auth_controller.clone();
            move |headers| async move { controller.me(headers).await }
        }))
        .route("/api/auth/register", post({
            let controller = auth_controller.clone();
            move |json| async move { controller.register(json).await }
        }))
        .route("/api/auth/login", post({
            let controller = auth_controller.clone();
            move |json| async move { controller.login(json).await }
        }))
        .route("/api/auth/verify-email", post({
            let controller = auth_controller.clone();
            move |json| async move { controller.verify_email(json).await }
        }))
        .route("/api/auth/resend-verification", post({
            let controller = auth_controller.clone();
            move |json| async move { controller.resend_verification(json).await }
        }))
        .route("/api/auth/forgot-password", post({
            let controller = auth_controller.clone();
            move |json| async move { controller.forgot_password(json).await }
        }))
        .route("/api/auth/reset-password", post({
            let controller = auth_controller.clone();
            move |json| async move { controller.reset_password(json).await }
        }))
        .route("/api/auth/change-password", post({
            let controller = auth_controller.clone();
            move |headers, json| async move { controller.change_password(headers, json).await }
        }))
        .route("/api/auth/refresh", post({
            let controller = auth_controller.clone();
            move |json| async move { controller.refresh_token(json).await }
        }))
}
