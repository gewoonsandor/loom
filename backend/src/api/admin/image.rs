use image::ImageFormat;
use std::io::Cursor;

pub(super) fn mime_type(data: &[u8]) -> Result<&'static str, String> {
    let format = image::guess_format(data).map_err(|_| "unsupported image format".to_string())?;

    image::ImageReader::new(Cursor::new(data))
        .with_guessed_format()
        .map_err(|e| format!("failed to read image: {e}"))?
        .into_dimensions()
        .map_err(|e| format!("invalid image data: {e}"))?;

    match format {
        ImageFormat::Png => Ok("image/png"),
        ImageFormat::Jpeg => Ok("image/jpeg"),
        ImageFormat::Gif => Ok("image/gif"),
        ImageFormat::WebP => Ok("image/webp"),
        ImageFormat::Bmp => Ok("image/bmp"),
        ImageFormat::Tiff => Ok("image/tiff"),
        _ => Err("unsupported image format".to_string()),
    }
}
