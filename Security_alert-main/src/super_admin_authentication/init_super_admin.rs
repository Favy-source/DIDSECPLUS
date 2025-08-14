use crate::user_authentication::data::models::user::User;
use crate::user_authentication::data::repositories::user_repository::UserRepository;
use crate::enums::role::Role;
use chrono::Utc;
use uuid::Uuid;
use bcrypt::hash;
use std::env;

pub async fn ensure_super_admin(user_repo: &UserRepository) -> anyhow::Result<()> {
    let email = env::var("SUPER_ADMIN_EMAIL").unwrap_or_else(|_| "superadmin@didsecplus.com".to_string());
    let password = env::var("SUPER_ADMIN_PASSWORD").unwrap_or_else(|_| "sadmin@123".to_string());
    let first_name = env::var("SUPER_ADMIN_FIRST_NAME").unwrap_or_else(|_| "Super".to_string());
    let last_name = env::var("SUPER_ADMIN_LAST_NAME").unwrap_or_else(|_| "Admin".to_string());

    if user_repo.find_by_email(&email).await?.is_none() {
        let password_hash = hash(&password, bcrypt::DEFAULT_COST)?;
        let now = Utc::now();
        let user = User {
            id: Uuid::new_v4(),
            email: email.clone(),
            password_hash,
            first_name,
            last_name,
            role: Role::SuperAdmin,
            is_email_verified: true,
            is_active: true,
            created_at: now,
            updated_at: now,
            last_login: None,
        };
        user_repo.create_user(&user).await?;
        println!("Super admin account created: {}", email);
    } else {
        println!("Super admin account already exists: {}", email);
    }
    Ok(())
}
