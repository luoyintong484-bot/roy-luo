GitHub Actions CI 说明

这个工作流会在 `push` 和 `pull_request`（`main` / `master`）触发，自动检测仓库类型并执行相应步骤：

- Node: 当存在 `package.json` 时，运行 `npm ci` 和 `npm test`。
- Python: 当存在 `requirements.txt` 或 `pyproject.toml` 时，安装依赖并尝试运行 `pytest`。
- Docker: 当存在 `Dockerfile` 时，构建镜像；如果设置了 `DOCKERHUB_USERNAME` 和 `DOCKERHUB_TOKEN` Secrets，会自动推送到 Docker Hub（tag: `yourusername/repo:<sha>`）。

使用方法：

1. 可选：在仓库设置 → Secrets 中添加 `DOCKERHUB_USERNAME` 和 `DOCKERHUB_TOKEN`（用于推送镜像）。
2. 提交到 `main` 或 `master` 分支后，GitHub Actions 会自动运行。
3. 如需自定义步骤，编辑 [.github/workflows/ci.yml](.github/workflows/ci.yml#L1)。

如果你希望我为特定平台（如 Vercel、Netlify、AWS、ECS）生成部署步骤，请告诉我要部署的目标和凭据类型。 
