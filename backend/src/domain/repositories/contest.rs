use async_trait::async_trait;
use loom_core::contest::Contest;

use crate::error::AppError;

#[async_trait]
pub trait ContestRepository: Send + Sync {
    async fn get_next_contest(&self) -> Result<Option<Contest>, AppError>;
    async fn set_map(&self, contest_id: &str, map_id: i32) -> Result<(), AppError>;
}
