# GitHub Commit Preparation

Repository name: citypulse-ai

Suggested commit:

feat: complete civic AI platform and production infrastructure

Before push:

git status
git diff --check
git add .
git status
git commit -m "feat: complete civic AI platform and production infrastructure"
git push

Never commit:
.env
API keys
database credentials
node_modules
private secrets
