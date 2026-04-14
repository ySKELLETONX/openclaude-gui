# 🚀 OpenClaude GUI

<div align="center">
  <img src="assets/Preview.png" alt="OpenClaude GUI Banner" width="100%">

  <p align="center">
    <strong>Uma interface desktop moderna, rápida e elegante para o OpenClaude.</strong>
  </p>

  <p align="center">
    <img src="https://img.shields.io/badge/Maintained%20%3F-yes-green.svg" alt="Maintained">
    <img src="https://img.shields.io/github/license/Danilitoxp/openclaude-gui" alt="License">
    <img src="https://img.shields.io/badge/Framework-Tauri%202-blue" alt="Framework">
    <img src="https://img.shields.io/badge/Frontend-Vite%20%2B%20JS-yellow" alt="Frontend">
  </p>
</div>

---

## 🌟 O que é o OpenClaude GUI?

O **OpenClaude GUI** é o cliente desktop oficial para o projeto **OpenClaude**. Criado e mantido por **Danilo Oliveira**, este projeto foi desenvolvido para proporcionar uma experiência de usuário premium, focada em produtividade e uma estética moderna.

Nascido da necessidade de ter uma interface local poderosa e fácil de usar, ele conecta você diretamente ao poder do OpenClaude sem as distrações do navegador.

## ✨ Funcionalidades Principais

- 🖥️ **Interface Nativa**: Construído com **Tauri 2**, garantindo baixo consumo de recursos e performance máxima.
- 🎨 **Design Premium**: Estética *glassmorphism* com bordas finas e sombras suaves para um visual state-of-the-art.
<br><br>
<div align="center">
  <img src="assets/design.png" alt="OpenClaude Design" width="90%">
</div>
<br>

- 🤖 **Modo de Conversa**: Interface amigável de chat com renderização Markdown completa e suporte a code blocks.
- 📂 **Gestão de Sessões**: Histórico de chat persistente e organizado para que você nunca perca o fio da meada.
<br><br>
<div align="center">
  <img src="assets/Historico.png" alt="Histórico de Sessões" width="90%">
</div>
<br>

- 📎 **Anexos Multimodais**: Envie imagens (PNG, JPG, WEBP) e documentos diretamente no chat — processados nativamente pelo provedor como `image_url` para análise visual contextual.
- ⚡ **Slash Commands**: Acesso rápido a ações via `/` no input — `/clear`, `/compact`, `/memory`, `/help`, `/cost`, `/init`, `/continue`.
- 🧠 **Memória de Projeto**: Edite o `CLAUDE.md` do projeto direto pela GUI via `/memory` para manter contexto persistente entre sessões.
- 🛑 **Interrupção de Geração**: Pare respostas em andamento com um clique — cancela o stream sem travar a aplicação.
- 🔨 **Visualização Inline de Ferramentas**: Chamadas de `Write`, `Edit` e `Bash` são renderizadas como cards dedicados — diffs coloridos para edições e blocos de código com syntax highlighting.
- 💭 **Estado de "Pensando"**: Feedback visual animado enquanto o modelo processa, com contexto sobre qual ferramenta está sendo executada.
- ⚙️ **Configuração Inteligente**: Verificação automática de pré-requisitos (Node.js/Bun) com instalador automático do OpenClaude CLI.
- 🔧 **Gerenciador de Provedores com Perfis Salvos**: Configure e alterne entre múltiplos perfis de API. O novo gerenciador permite listar, selecionar e excluir perfis salvos no arquivo de configuração global (`~/.claude.json`), garantindo paridade total com o gerenciamento de perfis do terminal.
<br><br>
<div align="center">
  <img src="assets/configuracoes.png" alt="Gerenciador de Perfis" width="90%">
</div>
<br>

- ⚙️ **Modos de Execução**: Escolha como o agente age — **Auto** (executa tudo sem pedir), **Perguntar** (confirma antes de cada ação) ou **Planejar** (só descreve, não executa).
- 📁 **Contexto de Projeto**: Selecione uma pasta como diretório de trabalho para que todas as operações ocorram dentro do contexto do seu projeto.
- 🎯 **Quick Replies Automáticas**: detecção inteligente de pedidos de permissão/aprovação e oferecimento de respostas rápidas (Sim/Não ou opções extraídas do texto).
- 📊 **Estatísticas de Resposta**: visualização de tokens consumidos, duração, custo estimados e número de turnos abaixo de cada resposta.
- 🛡️ **Timeout e Tratamento de Erros Robusto**: Cliente HTTP com timeout de 120s e mensagens de erro contextuais (conexão, timeout, requisição).
- 🎭 **Temas Claro/Escuro**: Personalize a aparência da aplicação conforme sua preferência.
- 🚀 **Performance**: Frontend ultra-rápido utilizando **Vite** e Vanilla JS/CSS.
- 📡 **Multi-provedores**: Suporte flexível a múltiplos provedores de API via configuração na GUI com persistência local.
- 🔐 **Modo Permissões**: Suporte opcional à flag `--dangerously-skip-permissions` (equivalente ao terminal) configurável na GUI.

## 🆕 Últimas Melhorias

Esta versão traz avanços significativos na experiência de uso:

| Categoria | Melhoria |
|-----------|----------|
| 🤖 **Provedores** | 12+ provedores + **Gerenciador de Perfis Salvos** (Listar, Selecionar, Excluir) sincronizado com o CLI |
| ⚙️ **Modos** | 3 modos de execução: **Auto** (executa tudo), **Perguntar** (confirma antes), **Planejar** (só descreve) |
| 📁 **Projeto** | Seletor de pasta como diretório de trabalho; todas as operações ocorrem no contexto do projeto |
| 🎯 **Quick Replies** | Detecção automática de pedidos de permissão/aprovação com botões de resposta rápida (Sim/Não ou opções) |
| 📊 **Estatísticas** | Barra de stats após respostas mostra: tokens (entada/saída), duração, custo USD, turnos |
| 💬 **Chat** | Renderização Markdown Real-time + Unificação de Respostas (fim das respostas fragmentadas) |
| 🖼️ **Multimodal** | Envio de imagens direto ao provedor via formato `image_url` (base64) + leitura de textos no chat |
| ⚡ **Slash Commands** | 7 comandos built-in: `/clear`, `/compact`, `/memory`, `/help`, `/cost`, `/init`, `/continue` |
| 🛑 **Controle** | Botão **Stop** interrompe streams em andamento; ícone animado do assistente para indicações visuais |
| 🔨 **Tools UI** | Cards inline para `Write`/`Edit` (diffs coloridos) e `Bash` (code blocks com syntax highlighting) |
| 💭 **UI Polish** | Design refinado para avisos de `[context]`, remoção do caractere `└` por ícones profissionais, e transições suaves |
| ⚙️ **Config** | `working_dir` padrão = home do usuário; binário `openclaude` como default; instalação automática via NPM |
| 🔐 **Segurança** | Flag opcional `skip_permissions` configurável pela GUI; persistência local de provedores |

## 🛠️ Tecnologias Utilizadas

- [Tauri 2](https://tauri.app/) - Backend em Rust, UI em Webview.
- [Vite](https://vitejs.dev/) - Tooling de frontend rápido.
- [Vanilla CSS/JS](https://developer.mozilla.org/en-US/) - Para controle total e performance.


## 🚀 Como Começar

### Pré-requisitos

Antes de começar, você precisará ter instalado:
- [Node.js](https://nodejs.org/) **ou** [Bun](https://bun.sh/) (para o gerenciamento de pacotes)
- [Rust](https://www.rust-lang.org/tools/install) (necessário para o Tauri)

> **Nota:** O OpenClaude CLI será instalado automaticamente pela GUI na primeira verificação de requisitos.

### Instalação

1. Clone o repositório:
   ```bash
   git clone https://github.com/Danilitoxp/openclaude-gui.git
   cd openclaude-gui
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie em modo de desenvolvimento:
   ```bash
   npm run tauri:dev
   ```

### Primeira Execução

Ao iniciar pela primeira vez, a GUI verificará automaticamente os pré-requisitos:
- Detecta se você tem Node.js ou Bun instalado
- Verifica se o OpenClaude está instalado no sistema
- Oferece instalar o OpenClaude via NPM caso não esteja presente

### Build

Para gerar o executável final:
```bash
npm run tauri:build
```

### 💡 Dicas de Uso

- Digite `/` no input para abrir o menu de **slash commands**.
- Arraste e solte imagens diretamente na janela do chat para anexá-las.
- Use `/memory` para editar o `CLAUDE.md` do projeto ativo sem sair da GUI.
- Clique no botão **Stop** (aparece durante a geração) para interromper a resposta imediatamente.
- Cards de `Write`/`Edit` mostram o diff inline; `Bash` mostra o comando e a saída formatados.

## 📦 Dependências

O projeto utiliza as seguintes bibliotecas principais:

- **[Tauri 2](https://tauri.app/)** - Framework para builds desktop nativos com backend em Rust
- **[Vite](https://vitejs.dev/)** - Toolchain de frontend ultrarrápido
- **[tauri-apps/api](https://v2.tauri.app)** - API oficial para interações com o backend
- **[tauri-apps/plugin-dialog](https://v2.tauri.com/plugins/dialog)** - Diálogo para seleção de arquivos
- **[tauri-apps/plugin-fs](https://v2.tauri.com/plugins/fs)** - Acesso ao sistema de arquivos
- **[tauri-apps/plugin-shell](https://v2.tauri.com/plugins/shell)** - Execução de comandos shell
- **Vanilla CSS/JS** - Controle total e máxima performance

## 🤝 Contribuindo

Este projeto foi idealizado por **Danilo Oliveira** e é aberto para que a comunidade possa contribuir, evoluir e tornar o OpenClaude a melhor alternativa open source! Sinta-se à vontade para abrir issues ou enviar Pull Requests.

1. Faça um Fork do projeto
2. Crie sua Feature Branch (`git checkout -b feature/NovaFeature`)
3. Commit suas mudanças (`git commit -m 'Add: Nova Feature'`)
4. Push para a Branch (`git push origin feature/NovaFeature`)
5. Abra um Pull Request

---

<div align="center">
  <p>Criado por <strong>Danilo Oliveira</strong>.</p>
  <p>Desenvolvido com ❤️ para a comunidade Open Source.</p>
</div>
