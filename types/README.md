# /types

Shared TypeScript type definitions.

Cross-cutting type declarations, interfaces, and enums shared between
the backend (`src/`) and frontend (`web/`). Avoid duplicating types that
belong in a specific Clean Architecture layer — those stay in `src/domain/`
or `src/application/`.

## Contents (planned)
- API request/response contracts
- Shared enums and constants
- Third-party type augmentations
