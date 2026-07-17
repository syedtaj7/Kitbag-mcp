# developer.cron_parser

Parse a cron expression to validate it and list its next execution dates.

## Usage

Provide the cron `expression` to parse.

### Input Schema

- `expression` (string, required): The cron expression.
- `iterations` (number, optional): Count of next run dates to calculate. Defaults to 5.
