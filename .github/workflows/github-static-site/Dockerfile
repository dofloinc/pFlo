# The CircleCi builds will run in the Docker image built from this Dockerfile. To build a new image:
#
# 1. docker build -t 542393931612.dkr.ecr.us-west-2.amazonaws.com/github-static-site:<VERSION> --build-arg GITHUB_OAUTH_TOKEN=<YOUR_TOKEN> .
# 2. eval "$(aws ecr get-login --region us-west-2 --no-include-email)"
# 3. docker push 542393931612.dkr.ecr.us-west-2.amazonaws.com/github-static-site:<VERSION>
# 4. Update the image setting in config.yml to your new VERSION.

# Note that we use a multi-stage build. This allows us to pass in the GITHUB_OAUTH_TOKEN secret (which we use to access
# the private gruntwork-io repos) as a build arg without it being stored in the build history. For more info, see:
#
# https://stackoverflow.com/a/40762010/483528
# https://vsupalov.com/build-docker-image-clone-private-repo-ssh-key/
#
FROM ubuntu:20.04 as intermediate

# You must set a GitHub personal access token as a build arg. This will be used to access the private gruntwork-io
# GitHub repos
ARG GITHUB_OAUTH_TOKEN
RUN if [ -z "$GITHUB_OAUTH_TOKEN" ]; then echo "ERROR: You must set GITHUB_OAUTH_TOKEN as a Docker build arg."; exit 1; fi

ENV GRUNTWORK_INSTALLER_VERSION v0.0.22
ENV MODULE_CI_VERSION v0.28.1
ENV TERRAFORM_VERSION 0.12.29
ENV TERRAGRUNT_VERSION v0.24.1
ENV KUBECTL_VERSION v1.17.0
ENV HELM_VERSION v3.2.3
ENV KUBERGRUNT_VERSION v0.6.4
ENV ISTIO_VERSION v1.18.0

RUN apt-get update && \
    apt-get install -y curl wget unzip sudo

RUN wget "https://releases.hashicorp.com/terraform/${TERRAFORM_VERSION}/terraform_${TERRAFORM_VERSION}_linux_amd64.zip" && \
    unzip -o "terraform_${TERRAFORM_VERSION}_linux_amd64.zip" -d "/tmp/"

RUN wget "https://github.com/gruntwork-io/terragrunt/releases/download/${TERRAGRUNT_VERSION}/terragrunt_linux_amd64" && \
    mv terragrunt_linux_amd64 "/tmp/terragrunt" && \
    chmod u+x "/tmp/terragrunt"

RUN wget "https://storage.googleapis.com/kubernetes-release/release/${KUBECTL_VERSION}/bin/linux/amd64/kubectl" && \
    mv kubectl "/tmp/kubectl" && \
    chmod u+x "/tmp/kubectl"

RUN wget "https://get.helm.sh/helm-${HELM_VERSION}-linux-amd64.tar.gz" && \
    tar -xvf helm-${HELM_VERSION}-linux-amd64.tar.gz && \
    mv "linux-amd64/helm" "/tmp/helm" && \
    chmod u+x "/tmp/helm"

RUN curl -Ls https://raw.githubusercontent.com/gruntwork-io/gruntwork-installer/master/bootstrap-gruntwork-installer.sh | bash /dev/stdin --version "$GRUNTWORK_INSTALLER_VERSION" && \
    gruntwork-install --repo "https://github.com/gruntwork-io/module-ci" --module-name "build-helpers" --tag "$MODULE_CI_VERSION" && \
    gruntwork-install --repo "https://github.com/gruntwork-io/module-ci" --module-name "git-helpers" --tag "$MODULE_CI_VERSION" && \
    gruntwork-install --repo "https://github.com/gruntwork-io/module-ci" --module-name "terraform-helpers" --tag "$MODULE_CI_VERSION" && \
    gruntwork-install --binary-name "kubergrunt" --repo "https://github.com/gruntwork-io/kubergrunt" --tag "${KUBERGRUNT_VERSION}"

# This is the real Docker image that will be created in the end. It just carefully copies code from the intermediate.
FROM ubuntu:20.04

#COPY entrypoint.sh /entrypoint.sh

# Executes `entrypoint.sh` when the Docker container starts up 
# ENTRYPOINT ["/entrypoint.sh"]

RUN apt-get update && \
    apt-get install software-properties-common -y

RUN add-apt-repository ppa:git-core/ppa -y
RUN apt-get update && \
    apt-get install git -y

RUN apt-get update && \
    apt-get install -y apt-transport-https ca-certificates curl jq python3 python3-dev python3-pip && \
    pip3 install awscli

# Here we install Docker in Docker. We need it because our builds will run, well, Docker! Note that all we're really
# using is the Docker client, as CircleCi will mount a socket for us to talk to a Docker server outside of this
# container.
RUN curl -fsSL https://download.docker.com/linux/ubuntu/gpg | apt-key add - && \
    add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" && \
    apt-get update && \
    apt-get install -y docker-ce

RUN curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt-get install -y nodejs

COPY --from=intermediate /usr/local/bin/build-docker-image /usr/local/bin/build-docker-image
COPY --from=intermediate /usr/local/bin/git-add-commit-push /usr/local/bin/git-add-commit-push
COPY --from=intermediate /usr/local/bin/terraform-update-variable /usr/local/bin/terraform-update-variable
COPY --from=intermediate /tmp/terraform /usr/local/bin/terraform
COPY --from=intermediate /tmp/terragrunt /usr/local/bin/terragrunt
COPY --from=intermediate /tmp/kubectl /usr/local/bin/kubectl
COPY --from=intermediate /tmp/helm /usr/local/bin/helm
COPY --from=intermediate /usr/local/bin/kubergrunt /usr/local/bin/kubergrunt