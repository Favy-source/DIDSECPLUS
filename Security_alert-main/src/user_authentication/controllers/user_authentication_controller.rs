use axum_extra::extract::TypedHeader;
use headers::Authorization;
use headers::authorization::Bearer;
use crate::dtos::user_authentication_dto::{RegisterRequest, UserResponse};
use crate::dtos::user_authentication_dto::*;
use crate::utils::auth_error::AuthError;
use crate::utils::api_response::ApiResponse;
use crate::user_authentication::services::user_authentication_service::AuthService;
use axum::{
    extract::{Json},
    http::{HeaderMap, StatusCode},
    response::{IntoResponse},
};
use serde::Deserialize;
use std::sync::Arc;
use uuid::Uuid;



#[derive(Clone)]
pub struct AuthController {
    auth_service: Arc<AuthService>,
}

impl AuthController {

    /// Super admin creates an admin account
    pub async fn create_admin(
        &self,
        TypedHeader(Authorization(bearer)): TypedHeader<Authorization<Bearer>>,
        Json(mut request): Json<RegisterRequest>,
    ) -> Result<impl IntoResponse, AuthError> {
        let token_data = self.auth_service.decode_jwt_token(bearer.token())?;
        if token_data.role.to_string() != "super_admin" {
            return Ok((StatusCode::FORBIDDEN, Json(ApiResponse::<MessageResponse> { data: None, message: Some("Only super admins can create admin accounts".to_string()), success: false })));
        }
        request.role = Some(crate::enums::role::Role::Admin);
        let response = self.auth_service.register(request).await?;
        let api_response = ApiResponse::success_with_message(
            response,
            "Admin account created successfully".to_string(),
        );
        Ok((StatusCode::CREATED, Json(api_response)))
    }

    /// Super admin creates a police account
    pub async fn create_police(
        &self,
        TypedHeader(Authorization(bearer)): TypedHeader<Authorization<Bearer>>,
        Json(mut request): Json<RegisterRequest>,
    ) -> Result<impl IntoResponse, AuthError> {
        let token_data = self.auth_service.decode_jwt_token(bearer.token())?;
        if token_data.role.to_string() != "super_admin" {
            return Ok((StatusCode::FORBIDDEN, Json(ApiResponse::<MessageResponse> { data: None, message: Some("Only super admins can create police accounts".to_string()), success: false })));
        }
        request.role = Some(crate::enums::role::Role::Police);
        let response = self.auth_service.register(request).await?;
        let api_response = ApiResponse::success_with_message(
            response,
            "Police account created successfully".to_string(),
        );
        Ok((StatusCode::CREATED, Json(api_response)))
    }

    pub async fn me(
        &self,
        TypedHeader(Authorization(bearer)): TypedHeader<Authorization<Bearer>>,
    ) -> Result<impl IntoResponse, AuthError> {
        let token_data = self.auth_service.decode_jwt_token(bearer.token())?;
        let user_id = token_data.sub;
        let user = self.auth_service.find_user_by_id(user_id.parse().unwrap()).await?;
        let user_response = UserResponse {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            is_email_verified: user.is_email_verified,
            is_active: user.is_active,
        };
        let mut map = std::collections::HashMap::new();
        map.insert("user", user_response);
        Ok((StatusCode::OK, Json(map)))
    }
    pub fn new(auth_service: Arc<AuthService>) -> Self {
        Self { auth_service }
    }

    pub async fn register(
        &self,
        Json(request): Json<RegisterRequest>,
    ) -> Result<impl IntoResponse, AuthError> {
        let response = self.auth_service.register(request).await?;
        let api_response = ApiResponse::success_with_message(
            response,
            "User registered successfully".to_string(),
        );
        Ok((StatusCode::CREATED, Json(api_response)))
    }

    pub async fn login(
        &self,
        Json(request): Json<LoginRequest>,
    ) -> Result<impl IntoResponse, AuthError> {
        let response = self.auth_service.login(request).await?;
        let api_response = ApiResponse::success_with_message(
            response,
            "Login successful".to_string(),
        );
        Ok((StatusCode::OK, Json(api_response)))
    }

    pub async fn verify_email(
        &self,
        Json(request): Json<VerifyEmailRequest>,
    ) -> Result<impl IntoResponse, AuthError> {
        let response = self.auth_service.verify_email(request).await?;
        let api_response = ApiResponse::success_with_message(
            response,
            "Email verified successfully".to_string(),
        );
        Ok((StatusCode::OK, Json(api_response)))
    }

    pub async fn resend_verification(
        &self,
        Json(request): Json<ResendVerificationRequest>,
    ) -> Result<impl IntoResponse, AuthError> {
        let response = self.auth_service.resend_verification(request).await?;


        let message = if response.message == "Email is already verified." {
            response.message.clone()
        } else {
            "Verification email sent successfully".to_string()
        };

        let api_response = ApiResponse::success_with_message(response, message);
        Ok((StatusCode::OK, Json(api_response)))
    }


    pub async fn forgot_password(
        &self,
        Json(request): Json<ForgotPasswordRequest>,
    ) -> Result<impl IntoResponse, AuthError> {
        let response = self.auth_service.forgot_password(request).await?;
        let api_response = ApiResponse::success_with_message(
            response,
            "Password reset email sent successfully".to_string(),
        );
        Ok((StatusCode::OK, Json(api_response)))
    }

    pub async fn reset_password(
        &self,
        Json(request): Json<ResetPasswordRequest>,
    ) -> Result<impl IntoResponse, AuthError> {
        let response = self.auth_service.reset_password(request).await?;
        let api_response = ApiResponse::success_with_message(
            response,
            "Password reset successfully".to_string(),
        );
        Ok((StatusCode::OK, Json(api_response)))
    }

    pub async fn change_password(
        &self,
        headers: HeaderMap,
        Json(request): Json<ChangePasswordRequest>,
    ) -> Result<impl IntoResponse, AuthError> {
        let user_id = self.extract_user_id_from_token(&headers).await?;
        let response = self.auth_service.change_password(user_id, request).await?;
        let api_response = ApiResponse::success_with_message(
            response,
            "Password changed successfully".to_string(),
        );
        Ok((StatusCode::OK, Json(api_response)))
    }

    pub async fn refresh_token(
        &self,
        Json(request): Json<RefreshTokenRequest>,
    ) -> Result<impl IntoResponse, AuthError> {
        let response = self.auth_service.refresh_token(&request.refresh_token).await?;
        let api_response = ApiResponse::success_with_message(
            response,
            "Token refreshed successfully".to_string(),
        );
        Ok((StatusCode::OK, Json(api_response)))
    }

    async fn extract_user_id_from_token(&self, headers: &HeaderMap) -> Result<Uuid, AuthError> {
        let auth_header = headers
            .get("authorization")
            .ok_or(AuthError::InvalidToken)?
            .to_str()
            .map_err(|_| AuthError::InvalidToken)?;

        let token = auth_header
            .strip_prefix("Bearer ")
            .ok_or(AuthError::InvalidToken)?;

        let claims = self.auth_service.decode_jwt_token(token)?;
        let user_id: Uuid = claims.sub.parse()
            .map_err(|_| AuthError::InvalidToken)?;

        Ok(user_id)
    }
}

#[derive(Debug, Deserialize)]
pub struct RefreshTokenRequest {
    pub refresh_token: String,
}