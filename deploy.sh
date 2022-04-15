#!/bin/bash
# This script is meant to be run from a Github Actions job to automatically build a new version of the scripts
# deploy it to the specified environment.

set -e

if [[ "$GITHUB_REF" =~ ^refs/tags/v.*$ && "$GITHUB_EVENT_NAME" == "release" ]]; then
  echo "Found release tag. Deploying to prod."
  SERVICE_PATH="prod/us-west-2/prod/services/version-tracking-script"
  BUCKET_NAME="scripts.doflo.com"
  IAM_ROLE_ARN="arn:aws:iam::202218563153:role/allow-auto-deploy-from-other-accounts"
  DIST_ID="E1WHJMX2X5DR9L"  # this is a bit of a hack this should be moved into the terragrunt code and look up the distribution based on the last time the setup code has run
elif [[ "$GITHUB_REF" == "refs/heads/master" ]]; then
  echo "On master branch. Deploying to stage."
  SERVICE_PATH="stage/us-west-2/stage/services/version-tracking-script"
  BUCKET_NAME="scripts.stage-doflo.com"
  IAM_ROLE_ARN="arn:aws:iam::540659175989:role/allow-auto-deploy-from-other-accounts"
  DIST_ID="E4YFVYX7RPRTT"  # this is a bit of a hack this should be moved into the terragrunt code and look up the distribution based on the last time the setup code has run
else
  echo "Did not find release tag or master branch, so skipping deploy."
  exit 0
fi

echo "🤖 Starting Build" 

chown root:root -R .

npm ci

npm run build

git config --global push.default simple --no-rebase

# Save Current Role
PRIOR_AWS_ACCESS_KEY_ID="$AWS_ACCESS_KEY_ID"
PRIOR_AWS_SECRET_ACCESS_KEY="$AWS_SECRET_ACCESS_KEY"
 
# Switch Roles
echo "👻 AWS Assume Role"
eval $(aws sts assume-role --role-arn "$IAM_ROLE_ARN" --role-session-name test | jq -r '.Credentials | "export AWS_ACCESS_KEY_ID=\(.AccessKeyId)\nexport AWS_SECRET_ACCESS_KEY=\(.SecretAccessKey)\nexport AWS_SESSION_TOKEN=\(.SessionToken)\n"')

echo "🤘 AWS Configure After STS Assume Role"
aws configure list

echo "🤡 Starting Copy to S3 Bucket: $BUCKET_NAME"
aws s3 sync ./build/ s3://$BUCKET_NAME/deployments/$GITHUB_SHA

echo "🤘 Make this version active: $BUCKET_NAME"
aws s3 cp s3://$BUCKET_NAME/deployments/$GITHUB_SHA s3://$BUCKET_NAME --recursive

# Return to Current Role
export AWS_ACCESS_KEY_ID=$PRIOR_AWS_ACCESS_KEY_ID
export AWS_SECRET_ACCESS_KEY=$PRIOR_AWS_SECRET_ACCESS_KEY
unset AWS_SESSION_TOKEN

echo "💀 AWS Configure After Role Revert"
aws configure list

echo "🤘 Terraform Update"
terraform-update-variable \
  --name "current_deployment" \
  --value "\"$GITHUB_SHA\"" \
  --vars-path "$SERVICE_PATH/terragrunt.hcl" \
  --git-url "git@github.com:dofloinc/infrastructure-live.git" \
  --git-checkout-path "/tmp/infrastructure-live" \
  --git-user-email "flobot@doflo.com" \
  --git-user-name "doflo-bot"

echo "🤖 Terragrunt Apply Running as Role:$IAM_ROLE_ARN"
terragrunt apply --terragrunt-working-dir "/tmp/infrastructure-live/$SERVICE_PATH"  --terragrunt-iam-role "$IAM_ROLE_ARN" -input=false -auto-approve

# echo "🤖 Assume Role $IAM_ROLE_ARN"
# eval $(aws-auth --role-arn $IAM_ROLE_ARN --role-duration-seconds 3600 --role-session-name flow-www-ci-$GITHUB_SHA)

# echo "🤖 Invalidate Distribution: $DIST_ID"
# aws cloudfront create-invalidation \
#   --distribution-id $DIST_ID \
#   --paths "/*"
