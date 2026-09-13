use std::pin::Pin;

use async_trait::async_trait;
use futures::Stream;

use crate::error::AppError;

pub type ByteStream = Pin<Box<dyn Stream<Item = Result<Vec<u8>, AppError>> + Send>>;

pub struct WallpaperStream {
    pub mime_type: String,
    pub text_color: String,
    pub stream: ByteStream,
}

#[async_trait]
pub trait WallpaperRepository: Send + Sync {
    async fn get_for_contest(&self, contest_id: &str) -> Result<Option<WallpaperStream>, AppError>;
    async fn set_for_contest(
        &self,
        contest_id: &str,
        data: &[u8],
        mime_type: &str,
    ) -> Result<(), AppError>;
    async fn clear_for_contest(&self, contest_id: &str) -> Result<(), AppError>;
    async fn set_contest_text_color(&self, contest_id: &str, color: &str) -> Result<(), AppError>;

    async fn get_default(&self) -> Result<Option<WallpaperStream>, AppError>;
    async fn set_default(&self, data: &[u8], mime_type: &str) -> Result<(), AppError>;
    async fn clear_default(&self) -> Result<(), AppError>;
    async fn set_default_text_color(&self, color: &str) -> Result<(), AppError>;
}
