FROM mcr.microsoft.com/devcontainers/base:noble

# Create the directory as the vscode user
USER vscode
RUN mkdir -p /home/vscode/.local/share/opencode && chown -R vscode:vscode /home/vscode/.local/share/opencode
RUN mkdir -p /home/vscode/.local/share/vibe-kanban && chown -R vscode:vscode /home/vscode/.local/share/vibe-kanban
