# Thai Address API

This project is a migration of the [original Thai Address API](https://github.com/oadultradeepfield/thai-address-api/) written in Go, now rebuilt using [Hono](https://hono.dev/) and running on Cloudflare Workers. The API provides endpoints to retrieve Thai address information (provinces, districts, subdistricts, and postal codes) in JSON format, with support for pagination, search, and sorting.

## Getting Started

### Prerequisites

Make sure you have the following installed:

1. [pnpm](https://pnpm.io/) (version 8 or later)
2. [Node.js](https://nodejs.org/) (version 18 or later)
3. [Cloudflare Wrangler](https://developers.cloudflare.com/workers/wrangler/) (for local development and deployment)
4. [SQLite3](https://sqlite.org/) (optional, for local database management)

Run `pnpm install` to install the required dependencies.

### Common Commands

- Start the development server:

  ```bash
  pnpm run dev
  ```

- Run code linting:

  ```bash
  pnpm run lint
  ```

- Deploy to Cloudflare Workers:

  ```bash
  pnpm run deploy
  ```

- Generate/synchronize types based on your Worker configuration:

  ```bash
  pnpm run cf-typegen
  ```

## Use Cases & API Reference

This API provides Thai address data (provinces, districts, subdistricts) with pagination, search, and sorting support. See the [Full API Documentation](docs/api_reference.md) for more details.

## Contributing

Feel free to contribute to this project by submitting issues or pull requests. Please ensure that your code adheres to the existing style and includes appropriate tests.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
