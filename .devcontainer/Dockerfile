FROM mcr.microsoft.com/playwright:v1.58.2-noble

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID

RUN groupadd --gid ${USER_GID} ${USERNAME} \
    && useradd --uid ${USER_UID} --gid ${USER_GID} -m ${USERNAME}

# Create the directory as the vscode user
USER vscode
RUN mkdir -p /home/vscode/.local/share/opencode && chown -R vscode:vscode /home/vscode/.local/share/opencode
