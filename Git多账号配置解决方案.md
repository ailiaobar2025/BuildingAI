# Git多账号SSH配置问题解决方案

## 🔍 问题描述

在使用不同的GitHub账号进行项目开发时，可能遇到以下问题：
- Git提交时使用了错误的账号信息
- SSH认证失败，无法推送/拉取代码
- 远程仓库配置与实际使用的账号不匹配

## 📋 问题诊断

### 1. 检查当前Git配置
```bash
# 查看用户名和邮箱
git config user.name
git config user.email

# 查看远程仓库
git remote -v

# 检查SSH密钥状态
ssh-add -l
```

### 2. 检查SSH配置
```bash
# 查看SSH密钥文件
ls -la ~/.ssh/

# 查看SSH配置文件
cat ~/.ssh/config
```

## 🛠️ 解决方案

### 方案一：使用SSH Host别名（推荐）

#### 1. 配置SSH Config文件

编辑 `~/.ssh/config` 文件，添加不同GitHub账号的配置：

```bash
# 默认 GitHub 账号 (firefly717)
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519

# 第二个 GitHub 账号 (ailiaobar2025)
Host github-ailiaobar
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_new_github
```

#### 2. 生成对应的SSH密钥（如果没有）

```bash
# 为ailiaobar账号生成新的SSH密钥
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519_new_github -C "your_email@example.com"

# 将公钥添加到GitHub账号
cat ~/.ssh/id_ed25519_new_github.pub
```

#### 3. 修改远程仓库URL

```bash
# 将远程仓库URL修改为使用SSH别名
git remote set-url origin git@github-ailiaobar:ailiaobar2025/BuildingAI.git
```

#### 4. 更新Git用户信息

```bash
# 更新本地仓库的用户名（匹配GitHub账号）
git config user.name "ailiaobar2025"

# 可选：更新邮箱
git config user.email "your_ailiaobar_email@domain.com"
```

#### 5. 添加SSH密钥到代理

```bash
# 添加对应的SSH密钥
ssh-add ~/.ssh/id_ed25519_new_github
```

#### 6. 验证配置

```bash
# 测试SSH连接
ssh -T git@github-ailiaobar

# 应该看到类似输出：
# Hi ailiaobar2025! You've successfully authenticated, but GitHub does not provide shell access.

# 验证远程仓库配置
git remote -v
```

### 方案二：使用不同目录的全局配置

#### 1. 为不同项目设置独立的Git配置

```bash
# 进入项目目录，设置本地配置
cd /path/to/project
git config user.name "ailiaobar2025"
git config user.email "your_ailiaobar_email@domain.com"
```

#### 2. 使用条件配置（Git 2.13+）

编辑 `~/.gitconfig`：

```ini
[user]
    name = firefly717
    email = 1163862236@qq.com

# 为特定目录使用不同的配置
[includeIf "gitdir:~/develop/ailiaobar-projects/"]
    path = ~/.gitconfig-ailiaobar

[includeIf "gitdir:~/develop/BuildingAI/"]
    path = ~/.gitconfig-ailiaobar
```

创建 `~/.gitconfig-ailiaobar`：

```ini
[user]
    name = ailiaobar2025
    email = your_ailiaobar_email@domain.com
```

## 🔧 SSH配置文件完整示例

`~/.ssh/config` 文件示例：

```bash
# 默认 GitHub 账号
Host github.com
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519
    ProxyCommand socat - PROXY:127.0.0.1:%h:%p,proxyport=7897

# ailiaobar2025 GitHub 账号
Host github-ailiaobar
    HostName github.com
    User git
    IdentityFile ~/.ssh/id_ed25519_new_github
    ProxyCommand socat - PROXY:127.0.0.1:%h:%p,proxyport=7897

# Gitee 配置
Host gitee.com
    HostName gitee.com
    PreferredAuthentications publickey
    IdentityFile ~/.ssh/id_ed25519_gitee

# 全局配置
Host *
    HostKeyAlgorithms +ssh-rsa
    PubkeyAcceptedKeyTypes +ssh-rsa
```

## 📝 常用命令速查

### Git配置管理
```bash
# 查看所有配置
git config --list

# 查看特定配置
git config user.name
git config user.email

# 设置本地仓库配置
git config user.name "用户名"
git config user.email "邮箱"

# 设置全局配置
git config --global user.name "用户名"
git config --global user.email "邮箱"
```

### SSH密钥管理
```bash
# 查看已加载的SSH密钥
ssh-add -l

# 添加SSH密钥到代理
ssh-add ~/.ssh/私钥文件名

# 删除所有SSH密钥
ssh-add -D

# 测试SSH连接
ssh -T git@github.com
ssh -T git@github-别名
```

### 远程仓库管理
```bash
# 查看远程仓库
git remote -v

# 修改远程仓库URL
git remote set-url origin 新的URL

# 添加远程仓库
git remote add 远程名 URL
```

## ⚠️ 注意事项

1. **SSH密钥权限**：确保私钥文件权限为600
   ```bash
   chmod 600 ~/.ssh/id_ed25519_new_github
   ```

2. **代理设置**：如果使用代理，确保配置正确
   ```bash
   ProxyCommand socat - PROXY:127.0.0.1:%h:%p,proxyport=7897
   ```

3. **密钥持久化**：将SSH密钥添加到macOS钥匙串
   ```bash
   ssh-add --apple-use-keychain ~/.ssh/id_ed25519_new_github
   ```

4. **全局vs本地配置**：
   - `git config`：仅影响当前仓库
   - `git config --global`：影响所有仓库

## ✅ 验证步骤

完成配置后，按以下步骤验证：

1. **测试SSH连接**
   ```bash
   ssh -T git@github-ailiaobar
   ```

2. **检查Git配置**
   ```bash
   git config user.name
   git config user.email
   ```

3. **验证远程仓库**
   ```bash
   git remote -v
   ```

4. **测试提交**
   ```bash
   git add .
   git commit -m "test commit"
   git push
   ```

## 🚀 快速解决脚本

创建一个快速修复脚本 `fix-git-account.sh`：

```bash
#!/bin/bash

# 设置变量
GITHUB_USERNAME="ailiaobar2025"
GITHUB_EMAIL="your_email@example.com"
REPO_OWNER="ailiaobar2025"
REPO_NAME="BuildingAI"
SSH_KEY_PATH="~/.ssh/id_ed25519_new_github"

echo "🔧 修复Git多账号配置..."

# 更新Git用户信息
git config user.name "$GITHUB_USERNAME"
git config user.email "$GITHUB_EMAIL"

# 更新远程仓库URL
git remote set-url origin "git@github-ailiaobar:$REPO_OWNER/$REPO_NAME.git"

# 添加SSH密钥
ssh-add "$SSH_KEY_PATH"

# 验证配置
echo "✅ 验证配置："
echo "用户名: $(git config user.name)"
echo "邮箱: $(git config user.email)"
echo "远程仓库: $(git remote get-url origin)"

# 测试SSH连接
echo "🔗 测试SSH连接："
ssh -T git@github-ailiaobar

echo "🎉 配置完成！"
```

使用方法：
```bash
chmod +x fix-git-account.sh
./fix-git-account.sh
```

---

**📝 文档版本**: v1.0.0  
**📅 创建日期**: 2025-10-20  
**🔧 适用系统**: macOS, Linux

遇到问题时，按照此文档逐步排查和解决即可。