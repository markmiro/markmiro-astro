#!/bin/sh
# Run a command with the restricted S3 profile, signing in first if the SSO
# session has expired. See docs/aws-s3-access.md.
export AWS_PROFILE="${AWS_PROFILE:-markmiro-s3}"

if ! command -v aws >/dev/null 2>&1; then
  echo "with-aws: AWS CLI not found; S3 reads and uploads will fail." >&2
elif ! aws configure get sso_session >/dev/null 2>&1; then
  echo "with-aws: profile $AWS_PROFILE isn't configured; see docs/aws-s3-access.md." >&2
elif ! aws sts get-caller-identity >/dev/null 2>&1; then
  echo "with-aws: AWS session for $AWS_PROFILE expired, signing in…" >&2
  aws sso login || echo "with-aws: sign-in failed; continuing without AWS access." >&2
fi

exec "$@"
