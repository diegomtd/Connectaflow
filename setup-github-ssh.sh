#!/bin/bash
# Script para configurar SSH da VPS com GitHub
# Execute na sua VPS: bash setup-github-ssh.sh

set -e

echo "=== Configuracao SSH VPS → GitHub ==="
echo ""

# 1. Verificar se já existe chave SSH
if [ -f ~/.ssh/id_ed25519.pub ]; then
  echo "[OK] Chave SSH já existe: ~/.ssh/id_ed25519.pub"
else
  echo "[1/4] Gerando chave SSH..."
  read -p "Seu email do GitHub: " GITHUB_EMAIL
  ssh-keygen -t ed25519 -C "$GITHUB_EMAIL" -f ~/.ssh/id_ed25519 -N ""
  echo "[OK] Chave gerada com sucesso"
fi

echo ""
echo "[2/4] Iniciando ssh-agent..."
eval "$(ssh-agent -s)"
ssh-add ~/.ssh/id_ed25519

echo ""
echo "[3/4] ==================================================="
echo "COPIE a chave abaixo e adicione no GitHub:"
echo "  GitHub → Settings → SSH and GPG keys → New SSH key"
echo "==================================================="
echo ""
cat ~/.ssh/id_ed25519.pub
echo ""
echo "==================================================="

read -p "Pressione ENTER após adicionar a chave no GitHub..."

echo ""
echo "[4/4] Testando conexão com GitHub..."
if ssh -T git@github.com 2>&1 | grep -q "successfully authenticated"; then
  echo "[OK] Conexão com GitHub estabelecida com sucesso!"
else
  ssh -T git@github.com || true
fi

echo ""
echo "=== Configuracao concluida! ==="
echo ""
echo "Agora você pode usar git com SSH:"
echo "  git clone git@github.com:SEU_USUARIO/SEU_REPO.git"
echo "  git remote set-url origin git@github.com:SEU_USUARIO/SEU_REPO.git"
