# image.compress

Compress image quality to reduce file size.

## Usage

Provide `quality` (1-100) and the image path/data.

### Input Schema

- `filePath` (string, optional): Local path to the image file.
- `fileData` (string, optional): Base64 encoded image data.
- `quality` (number, required): Compression quality from 1 to 100.
- `outputPath` (string, optional): Optional local path to save output.
