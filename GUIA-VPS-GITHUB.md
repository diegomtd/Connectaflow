# Como Conectar sua VPS ao GitHub via SSH

## Passo a Passo

### 1. Acesse sua VPS via terminal
```bash
ssh usuario@ip-da-sua-vps
```

---

### 2. Gere uma chave SSH na VPS
```bash
ssh-keygen -t ed25519 -C "seu@email.com"
# Pressione ENTER em tudo (sem senha é mais prático para automação)
```

---

### 3. Copie a chave pública
```bash
cat ~/.ssh/id_ed25519.pub
```
Copie **todo** o conteúdo exibido (começa com `ssh-ed25519 ...`)

---

### 4. Adicione a chave no GitHub
1. Vá em: [github.com → Settings → SSH and GPG keys](https://github.com/settings/keys)
2. Clique em **"New SSH key"**
3. Cole a chave copiada
4. Salve

---

### 5. Teste a conexão
```bash
ssh -T git@github.com
# Deve aparecer: "Hi SEU_USUARIO! You've successfully authenticated..."
```

---

### 6. Configure seu nome/email no git (se ainda não tiver)
```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu@email.com"
```

---

## Opções para pegar seu código

### Opção A — Clonar repositório existente do GitHub
```bash
git clone git@github.com:SEU_USUARIO/SEU_REPO.git
cd SEU_REPO
```

### Opção B — Criar novo repositório e enviar código da VPS
```bash
# Na VPS, dentro da pasta do projeto:
git init
git add .
git commit -m "primeiro commit"
git branch -M main
git remote add origin git@github.com:SEU_USUARIO/SEU_REPO.git
git push -u origin main
```

### Opção C — Alterar repositório existente para usar SSH (em vez de HTTPS)
```bash
# Ver remote atual:
git remote -v

# Trocar para SSH:
git remote set-url origin git@github.com:SEU_USUARIO/SEU_REPO.git
```

---

## Dica: Script automático

Execute o script incluído neste projeto para automatizar tudo:
```bash
bash setup-github-ssh.sh
```

---

## Problemas comuns

**"Permission denied (publickey)"**
- A chave não foi adicionada ao GitHub, ou não está no ssh-agent
- Solução: `ssh-add ~/.ssh/id_ed25519` e verifique no GitHub

**"Host key verification failed"**
- Solução: `ssh-keyscan github.com >> ~/.ssh/known_hosts`

**"remote: Repository not found"**
- Verifique se o nome do repositório está correto e você tem acesso
