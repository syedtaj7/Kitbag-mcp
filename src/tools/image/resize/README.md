# image.resize

Resize an image to specific width and height dimensions.

## Usage

Provide `width`, optional `height`, and the image path/data.

### Input Schema

- `filePath` (string, optional): Local path to the image file.
- `fileData` (string, optional): Base64 encoded image data.
- `width` (number, required): Target width.
- `height` (number, optional): Target height. Scales proportionally if omitted.
- `outputPath` (string, optional): Optional local path to save output.
