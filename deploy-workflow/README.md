# Deploy Workflow

This directory contains the GitHub Actions deploy workflow that should be placed at
`.github/workflows/deploy-infrastructure.yml` in the repository.

## Setup Instructions

1. Copy the workflow file to the correct location:
   ```bash
   mkdir -p .github/workflows
   cp deploy-workflow/deploy-infrastructure.yml .github/workflows/
   ```

2. Configure the following GitHub repository variable:
   - `AWS_INFRA_DEPLOY_ROLE_ARN` — IAM role ARN with CDK deploy permissions (must trust GitHub OIDC)

3. Push the workflow file (requires a token with `workflow` scope):
   ```bash
   git add .github/workflows/deploy-infrastructure.yml
   git commit -m "ci: add deploy workflow"
   git push
   ```

## What it does

- Triggers automatically when code is merged to `main` that affects:
  - `packages/infrastructure/**`
  - `packages/backend/**`
  - `packages/shared/**`
- Can also be triggered manually via `workflow_dispatch`
- Deploys all CDK stacks and posts results as a PR comment
