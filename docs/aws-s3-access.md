# Local AWS S3 access

This repo reads and uploads objects in the `markmiro-website-content` bucket in `us-west-1`. Use the dedicated IAM Identity Center role `MarkmiroWebsiteS3ReadWrite` in AWS account `960118178684`. Do not sign the AWS CLI in as the account's root user or create a root access key: that would give the machine access far beyond this bucket.

The role permits listing this bucket, reading objects, and uploading or replacing objects. It does not permit deleting objects, administering buckets, listing all account buckets, or using other AWS services. `aws s3 ls` without a bucket name may fail; use `aws s3 ls s3://markmiro-website-content` instead.

## First browser sign-in

1. Use the password setup email sent to `contact@markmiro.com` for the Identity Center user `markmiro-s3-cli` to set its password. The setup link is valid for up to seven days. If the invitation expired or was never received, ask the AWS account administrator to resend it. Never enter this account's root password into the CLI sign-in flow.
2. Open the [AWS access portal](https://d-9067abd2b9.awsapps.com/start), sign in as `markmiro-s3-cli`, and complete any MFA prompt.
3. In the portal, choose account `markmiro` (`960118178684`) and permission set `MarkmiroWebsiteS3ReadWrite`. This is the restricted identity to use for local S3 work.

For later CLI sign-ins, run `aws sso login --profile markmiro-s3` and complete the browser window opened by that command. The SSO directory is in `us-east-1`, even though the bucket is in `us-west-1`. A console session alone does not configure the CLI on a new machine.

## Configure a new machine

1. Install [AWS CLI v2](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) and verify it with `aws --version`.
2. Run `aws configure sso --profile markmiro-s3`. Use these answers when prompted:

   | Prompt | Value |
   | --- | --- |
   | SSO session name | `markmiro-s3` |
   | SSO start URL | `https://d-9067abd2b9.awsapps.com/start` |
   | SSO Region | `us-east-1` |
   | SSO registration scopes | `sso:account:access` |
   | AWS account | `960118178684` (`markmiro`) |
   | Permission set / role | `MarkmiroWebsiteS3ReadWrite` |
   | CLI profile name | `markmiro-s3` |
   | Default client Region | `us-west-1` |
   | Output format | `json` |

   The wizard may open a browser before showing the account and role choices. Sign in with the dedicated Identity Center user. If the role is absent, an administrator must assign this user to that permission set in account `960118178684`.

   If a sandbox or firewall blocks the wizard's browser callback, add these non-secret values to `~/.aws/config` instead. Append them to an existing file; do not overwrite other profiles:

   ```ini
   [profile markmiro-s3]
   sso_session = markmiro-s3
   sso_account_id = 960118178684
   sso_role_name = MarkmiroWebsiteS3ReadWrite
   region = us-west-1
   output = json

   [sso-session markmiro-s3]
   sso_start_url = https://d-9067abd2b9.awsapps.com/start
   sso_region = us-east-1
   sso_registration_scopes = sso:account:access
   ```

3. Sign in and test access:

   ```sh
   aws sso login --profile markmiro-s3
   aws s3 ls s3://markmiro-website-content --profile markmiro-s3
   ```

   AWS stores the profile in `~/.aws/config` and temporary SSO tokens in `~/.aws/sso/cache`. Keep both outside this repo. No access key or secret key is needed. To end the session, run `aws sso logout`.

   If `aws sso login` cannot bind its local callback port, use `aws sso login --profile markmiro-s3 --use-device-code --no-browser`. Open the AWS URL it prints, sign in as `markmiro-s3-cli`, and enter its short-lived code. If an agent is running the command, the user must enter their own password in the browser.

## Use the profile with this repo

The repo's `s3-down` and `s3-up` scripts use the AWS CLI, while `src/lib/s3.ts` uses the AWS SDK credential chain. Set `AWS_PROFILE` in the terminal running these commands so both use the restricted role:

```sh
export AWS_PROFILE=markmiro-s3
bun run s3-down                 # Download into ../s3
bun run s3-up                   # Upload from ../s3
```

Run `aws sso login --profile markmiro-s3` again when the session expires. `bun run deploy` calls `s3-up`, so set `AWS_PROFILE` in that terminal too. The bucket download lives one directory above the repo by design. Do not commit AWS credentials, SSO cache files, or the downloaded bucket contents.

An agent setting up another machine should verify the active profile and bucket access before running uploads. If sign-in or access fails, inspect `aws configure list --profile markmiro-s3` for the credential source, confirm the `us-east-1` SSO and `us-west-1` bucket regions, and check the Identity Center account assignment. Do not work around an access error by switching to root credentials.

AWS references: [CLI SSO setup](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-sso.html), [S3 bucket-scoped policy example](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_examples_s3_rw-bucket.html).
