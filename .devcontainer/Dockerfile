FROM mcr.microsoft.com/devcontainers/base:noble

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg \
  && rm -rf /var/lib/apt/lists/*

# Create the directory as the vscode user
USER vscode
RUN mkdir -p /home/vscode/.local/share/opencode && chown -R vscode:vscode /home/vscode/.local/share/opencode
RUN mkdir -p /home/vscode/.local/share/vibe-kanban && chown -R vscode:vscode /home/vscode/.local/share/vibe-kanban
