# /workers

Background job and worker definitions.

Long-running or scheduled tasks that run outside the main API process.
Worker entry points are wired up in `src/interfaces/workers/` following
Clean Architecture; this folder holds worker-specific configuration,
scripts, and job definitions.

## Contents (planned)
- Job processor definitions
- Cron/schedule configuration
- Worker-specific utilities
