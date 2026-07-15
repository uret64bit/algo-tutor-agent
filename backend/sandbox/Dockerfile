# 沙箱镜像：用于 execute_code 工具隔离执行用户代码
# 该镜像自身不挂载 docker.sock；后端容器通过 docker SDK spawn 兄弟容器。
FROM python:3.12-slim

# 安装 C++ 与 Java 工具链
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc g++ openjdk-17-jdk-headless ca-certificates && \
    rm -rf /var/lib/apt/lists/*

# 非 root 用户
RUN useradd -m -u 1000 sandbox && \
    mkdir -p /sandbox && chown sandbox:sandbox /sandbox

WORKDIR /sandbox
USER sandbox

# 无 ENTRYPOINT —— 由后端 docker SDK 通过 command 启动
