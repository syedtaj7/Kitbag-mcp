# image.convert_format

Convert an image to a different file format (supports png, jpeg, bmp).

## Usage

Provide the target `format` and the image data/path.

### Input Schema

- `filePath` (string, optional): Local path to the image file.
- `fileData` (string, optional): Base64 encoded image data.
- `format` (string, required): Target format ('png', 'jpeg', 'bmp').
- `outputPath` (string, optional): Optional local path to save the output.
