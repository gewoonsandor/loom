use derive_more::derive::Constructor;
use loom_rpc::admin::v1::{self as pb, system_service_server::SystemService};
use std::sync::Arc;
use tonic::{Request, Response, Status};

use crate::{
    api::admin::image,
    domain::{Orchestrator, WallpaperRepository},
};

#[derive(Constructor)]
pub struct SystemHandler {
    wallpaper_repo: Arc<dyn WallpaperRepository>,
    orchestrator: Arc<dyn Orchestrator>,
}

#[tonic::async_trait]
impl SystemService for SystemHandler {
    async fn set_default_wallpaper(
        &self,
        request: Request<pb::SetDefaultWallpaperRequest>,
    ) -> Result<Response<()>, Status> {
        match request.into_inner().image_data.filter(|d| !d.is_empty()) {
            Some(data) => {
                let mime_type = image::mime_type(&data).map_err(Status::invalid_argument)?;
                self.wallpaper_repo.set_default(&data, mime_type).await?;
            }
            None => self.wallpaper_repo.clear_default().await?,
        }
        self.orchestrator.sync_stations(&[]);
        Ok(Response::new(()))
    }

    async fn set_default_wallpaper_text_color(
        &self,
        request: Request<pb::SetDefaultWallpaperTextColorRequest>,
    ) -> Result<Response<()>, Status> {
        self.wallpaper_repo
            .set_default_text_color(&request.into_inner().color)
            .await?;
        self.orchestrator.sync_stations(&[]);
        Ok(Response::new(()))
    }
}
