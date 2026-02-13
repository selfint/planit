FROM mcr.microsoft.com/devcontainers/base:noble

RUN apt-get update && export DEBIAN_FRONTEND=noninteractive \
    && apt-get -y install --no-install-recommends ffmpeg \
    && apt-get clean -y && rm -rf /var/lib/apt/lists/*

USER vscode

RUN mkdir -p /home/vscode/.local/share/opencode \
    && mkdir -p /home/vscode/.local/share/vibe-kanban