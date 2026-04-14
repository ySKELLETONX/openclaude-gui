import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import { open } from '@tauri-apps/plugin-dialog';
import { readTextFile } from '@tauri-apps/plugin-fs';
import './style.css';

// Estado global
let currentView = 'chat';
let logBuffer = [];
let autoScroll = true;
let lastStatus = null;

// Elementos DOM
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const restartBtn = document.getElementById('restartBtn');
const chatMessages = document.getElementById('chatMessages');
const promptInput = document.getElementById('promptInput');
const sendBtn = document.getElementById('sendBtn');
const logsContainer = document.getElementById('logsContainer');
const logCount = document.getElementById('logCount');
const clearLogsBtn = document.getElementById('clearLogsBtn');
const openLogsFolderBtn = document.getElementById('openLogsFolderBtn');
const attachBtn = document.getElementById('attachBtn');
const attachmentPreviews = document.getElementById('attachmentPreviews');

// Estado de Anexos
let currentAttachments = []; 

// Novos elementos de Requisitos
const requirementsModal = document.getElementById('requirementsModal');
const btnInstallOpenclaude = document.getElementById('btnInstallOpenclaude');
const btnIgnoreRequirements = document.getElementById('btnIgnoreRequirements');
const installBtnText = document.getElementById('installBtnText');
const installSpinner = document.getElementById('installSpinner');

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  setupNavigation();
  setupEventListeners();
  await loadSettings();
  await updateStatus();
  setupLogListener();
  startStatusPolling();
  
  // Verificar requisitos ao iniciar
  setTimeout(checkRequirements, 1000); 
  
  console.log('OpenClaude GUI loaded');
});

// Verificação de Requisitos
async function checkRequirements() {
  try {
    const status = await invoke('check_requirements');
    console.log('Requirements:', status);

    const stepNode = document.getElementById('step-node');
    const stepOpenclaude = document.getElementById('step-openclaude');
    const nodeText = document.getElementById('node-status');
    const openclaudeText = document.getElementById('openclaude-status');

    const hasNode = status.node || status.bun;
    stepNode.className = `setup-step ${hasNode ? 'ok' : 'error'}`;
    nodeText.textContent = hasNode ? (status.bun ? 'Bun detectado' : 'Node.js detectado') : 'Node.js/Bun não encontrado';

    stepOpenclaude.className = `setup-step ${status.openclaude ? 'ok' : 'error'}`;
    openclaudeText.textContent = status.openclaude ? 'Instalado e pronto' : 'Não encontrado no sistema';

    if (!status.openclaude) {
      requirementsModal.style.display = 'flex';
      requirementsModal.classList.add('open');
    } else {
      requirementsModal.classList.remove('open');
      setTimeout(() => requirementsModal.style.display = 'none', 300);
    }
  } catch (err) {
    console.error('Falha ao verificar requisitos:', err);
  }
}

// Navegação
function setupNavigation() {
  document.querySelectorAll('.nav-btn[data-view]').forEach(btn => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });
}

function showView(viewName) {
  currentView = viewName;
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelector(`.nav-btn[data-view="${viewName}"]`).classList.add('active');
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.getElementById(`view-${viewName}`).classList.add('active');
}

// Atualização de status
async function updateStatus() {
  try {
    const info = await invoke('get_status');
    const dotClasses = { offline: 'offline', starting: 'starting', running: 'running', error: 'error' };
    const textMap = { offline: 'Offline', starting: 'Iniciando...', running: 'Ativo', error: 'Erro' };

    statusDot.className = 'status-dot ' + (dotClasses[info.status] || 'offline');
    statusText.textContent = textMap[info.status] || 'Desconhecido';

    startBtn.disabled = info.status === 'starting' || info.status === 'running';
    stopBtn.disabled = info.status !== 'running';
    restartBtn.disabled = info.status !== 'running';

    if (info.status === 'starting') {
      showNotification('Iniciando OpenClaude...', 'info');
    }

    lastStatus = info;
    return info;
  } catch (err) {
    console.error('Error getting status:', err);
    return { status: 'offline' };
  }
}

// Chat
function addMessage(text, type) {
  const msgDiv = document.createElement('div');
  msgDiv.className = `message ${type}`;

  if (type !== 'system') {
    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.textContent = 'Copiar';
    copyBtn.onclick = () => {
      navigator.clipboard.writeText(text);
      copyBtn.textContent = 'Copiado!';
      setTimeout(() => copyBtn.textContent = 'Copiar', 1500);
    };
    msgDiv.appendChild(copyBtn);
  }

  // Renderização básica Markdown-like com suporte a diffs
  const escHtml = (s) => s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  const renderDiffBlock = (body) => {
    const lines = body.split('\n');
    // remove última linha vazia oriunda do \n final
    if (lines.length && lines[lines.length - 1] === '') lines.pop();

    const rows = lines.map(line => {
      let cls = '';
      let gutter = ' ';
      let content = line;

      if (/^@@.*@@/.test(line)) {
        return `<div class="diff-separator">${escHtml(line)}</div>`;
      }
      if (line.startsWith('+') && !line.startsWith('+++')) {
        cls = 'diff-added';
        gutter = '+';
        content = line.slice(1);
      } else if (line.startsWith('-') && !line.startsWith('---')) {
        cls = 'diff-removed';
        gutter = '-';
        content = line.slice(1);
      } else if (line.startsWith('+++') || line.startsWith('---')) {
        return `<div class="diff-separator">${escHtml(line)}</div>`;
      }

      return `<div class="diff-line ${cls}"><span class="diff-gutter">${gutter}</span><span class="diff-content">${escHtml(content) || '&nbsp;'}</span></div>`;
    }).join('');

    return `<div class="diff-card"><div class="diff-pre">${rows}</div></div>`;
  };

  const isDiffBody = (body) => {
    const lines = body.split('\n').filter(l => l.length);
    if (!lines.length) return false;
    const diffLines = lines.filter(l => /^[+\-]/.test(l) || /^@@.*@@/.test(l));
    return diffLines.length >= 2 && diffLines.length / lines.length >= 0.3;
  };

  // Extrai fenced code blocks antes de processar o restante
  const placeholders = [];
  let working = text.replace(/```(\w*)\n?([\s\S]*?)```/g, (_, lang, body) => {
    const langLower = (lang || '').toLowerCase();
    let html;
    if (langLower === 'diff' || langLower === 'patch' || isDiffBody(body)) {
      html = renderDiffBlock(body);
    } else {
      html = `<pre><code>${escHtml(body)}</code></pre>`;
    }
    placeholders.push(html);
    return `\u0000CODEBLOCK${placeholders.length - 1}\u0000`;
  });

  working = escHtml(working)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+?)`/g, '<code>$1</code>')
    .replace(/\n/g, '<br>');

  // Restaura os blocos de código
  working = working.replace(/\u0000CODEBLOCK(\d+)\u0000/g, (_, i) => placeholders[+i]);

  msgDiv.innerHTML += working;
  chatMessages.appendChild(msgDiv);

  if (autoScroll) {
    chatMessages.scrollTop = chatMessages.scrollHeight;
  }
}

// Manipulação de Anexos
async function handleFileAttachment(files) {
  for (const file of files) {
    if (currentAttachments.length >= 5) {
      showNotification('Máximo de 5 anexos permitidos', 'error');
      break;
    }

    const isImage = file.type.startsWith('image/');
    const reader = new FileReader();

    reader.onload = (e) => {
      currentAttachments.push({
        name: file.name,
        type: file.type,
        data: e.target.result, // base64
        isImage: isImage,
        size: file.size
      });
      renderAttachments();
    };
    reader.readAsDataURL(file);
  }
}

function renderAttachments() {
  attachmentPreviews.innerHTML = '';
  currentAttachments.forEach((at, index) => {
    const item = document.createElement('div');
    item.className = 'preview-item file-preview';

    // Formata tamanho do arquivo
    const formatSize = (bytes) => {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    // Pega ícone baseado no tipo
    const getFileIcon = (type, name) => {
      if (type.startsWith('image/')) {
        return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`;
      } else if (type === 'application/pdf') {
        return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><text x="8" y="18" font-size="8" font-weight="bold" text-anchor="middle" fill="currentColor" stroke="none">PDF</text></svg>`;
      } else if (type.startsWith('text/') || name.match(/\.(js|ts|py|rs|java|c|cpp|h|hpp|json|yaml|yml|xml|html|css|md|txt)$/i)) {
        return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`;
      } else {
        return `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>`;
      }
    };

    // Extrai tamanho se disponível
    const fileSize = at.size || 0;
    const formattedSize = formatSize(fileSize);
    const icon = getFileIcon(at.type, at.name);

    item.innerHTML = `
      <div class="file-preview-content">
        ${icon}
        <div class="file-preview-info">
          <div class="file-name" title="${at.name}">${at.name}</div>
          <div class="file-size">${formattedSize}</div>
        </div>
      </div>
      <button class="remove-preview" title="Remover arquivo">×</button>
    `;

    const removeBtn = item.querySelector('.remove-preview');
    removeBtn.onclick = () => {
      currentAttachments.splice(index, 1);
      renderAttachments();
    };

    attachmentPreviews.appendChild(item);
  });
}

async function sendMessage() {
  const text = promptInput.value.trim();
  if (!text && currentAttachments.length === 0) return;

  promptInput.value = '';
  
  // No chat amigável, mostramos os anexos também
  let displayContent = text;
  if (currentAttachments.length > 0) {
    displayContent += `\n\n[${currentAttachments.length} anexo(s)]`;
  }
  
  addMessage(displayContent, 'user');

  try {
    // Aqui enviamos tanto o texto quanto o base64 ou path dos anexos para o backend
    // Simulação: Para arquivos de texto, vamos ler o conteúdo e anexar ao prompt
    let finalPrompt = text;
    
    if (currentAttachments.length > 0) {
      for (const at of currentAttachments) {
        if (at.path && !at.isImage) {
          try {
            const content = await readTextFile(at.path);
            finalPrompt = `[Arquivo: ${at.name}]\n${content}\n\n${finalPrompt}`;
          } catch (e) {
            console.warn(`Não foi possível ler ${at.name}:`, e);
          }
        }
      }
    }

    await invoke('send_command', { 
      input: finalPrompt,
      attachments: currentAttachments.map(a => ({ 
        name: a.name, 
        data: a.data || null, 
        path: a.path || null,
        type: a.type || null 
      }))
    });
    
    currentAttachments = [];
    renderAttachments();
  } catch (err) {
    addMessage(`Erro: ${err}`, 'system');
  }
}

// Logs
function addLogEntry(source, message) {
  const entry = document.createElement('div');
  entry.className = `log-entry ${source}`;

  const now = new Date();
  const timestamp = now.toLocaleTimeString('pt-BR', { hour12: false });
  const sourceLabel = { stdout: 'OUT', stderr: 'ERR', system: 'SYS' }[source] || source;

  entry.innerHTML = `<span class="timestamp">[${timestamp}]</span><span class="source">${sourceLabel}</span>${escapeHtml(message)}`;

  logsContainer.appendChild(entry);
  logBuffer.push(source);

  if (logBuffer.length > 1000) {
    logsContainer.removeChild(logsContainer.firstChild);
    logBuffer.shift();
  }

  logCount.textContent = logBuffer.length;

  if (logsContainer.scrollHeight - logsContainer.scrollTop <= logsContainer.clientHeight + 100) {
    logsContainer.scrollTop = logsContainer.scrollHeight;
  }
}

async function clearLogs() {
  logsContainer.innerHTML = '';
  logBuffer = [];
  logCount.textContent = '0';
  try {
    await invoke('clear_logs');
  } catch (err) {
    console.error('Error clearing logs:', err);
  }
}

// Configurações
async function loadSettings() {
  try {
    const config = await invoke('get_config');
    document.getElementById('cfgPath').value = config.openclaude_path;
    document.getElementById('cfgArgs').value = config.args[0] || '';
    document.getElementById('cfgWorkDir').value = config.working_dir;
    document.getElementById('cfgPort').value = config.port;
    document.getElementById('cfgTimeout').value = config.startup_timeout_ms;
    document.getElementById('cfgAutoScroll').checked = config.auto_scroll;
    document.getElementById('cfgStartWindows').checked = config.start_with_windows;
    document.getElementById('cfgSkipPermissions').checked = config.skip_permissions !== false;

    document.querySelectorAll('.theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === config.theme.toLowerCase());
    });

    autoScroll = config.auto_scroll;
    applyTheme(config.theme.toLowerCase());
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

async function saveSettings() {
  const config = {
    openclaude_path: document.getElementById('cfgPath').value,
    args: [document.getElementById('cfgArgs').value].filter(Boolean),
    working_dir: document.getElementById('cfgWorkDir').value,
    port: parseInt(document.getElementById('cfgPort').value) || 3000,
    startup_timeout_ms: parseInt(document.getElementById('cfgTimeout').value) || 30000,
    theme: document.querySelector('.theme-btn.active').dataset.theme.toLowerCase(),
    start_with_windows: document.getElementById('cfgStartWindows').checked,
    auto_scroll: document.getElementById('cfgAutoScroll').checked,
    skip_permissions: document.getElementById('cfgSkipPermissions').checked
  };

  try {
    await invoke('save_config', { newConfig: config });
    autoScroll = config.auto_scroll;
    applyTheme(config.theme);
    showNotification('Configurações salvas!', 'success');
  } catch (err) {
    showNotification(`Erro ao salvar: ${err}`, 'error');
  }
}

function applyTheme(theme) {
  if (theme === 'light') {
    document.body.style.background = '#f5f5f5';
    document.body.style.color = '#333';
    document.querySelector('.sidebar').style.background = '#e0e0e0';
    document.querySelector('.header').style.background = '#e0e0e0';
  } else {
    document.body.style.background = '#1a1a2e';
    document.body.style.color = '#eee';
    document.querySelector('.sidebar').style.background = '#16213e';
    document.querySelector('.header').style.background = '#16213e';
  }
}

// Notificações
function showNotification(message, type = 'info') {
  const notif = document.createElement('div');
  notif.className = `notification ${type}`;
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

// Event Listeners
function setupEventListeners() {
  sendBtn.addEventListener('click', sendMessage);

  promptInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });

  startBtn.addEventListener('click', async () => {
    try {
      await invoke('start_process');
    } catch (err) {
      showNotification(`Erro: ${err}`, 'error');
    }
  });

  stopBtn.addEventListener('click', async () => {
    try {
      await invoke('stop_process');
      showNotification('Processo parado', 'info');
    } catch (err) {
      showNotification(`Erro: ${err}`, 'error');
    }
  });

  restartBtn.addEventListener('click', async () => {
    try {
      await invoke('restart_process');
    } catch (err) {
      showNotification(`Erro: ${err}`, 'error');
    }
  });

  clearLogsBtn.addEventListener('click', clearLogs);

  openLogsFolderBtn.addEventListener('click', async () => {
    try {
      const result = await invoke('open_logs_folder');
      showNotification(result.message, 'success');
    } catch (err) {
      showNotification(`Erro: ${err}`, 'error');
    }
  });

  document.getElementById('saveSettingsBtn').addEventListener('click', saveSettings);

  document.getElementById('resetSettingsBtn').addEventListener('click', async () => {
    await loadSettings();
    showNotification('Configurações restauradas', 'success');
  });

  document.querySelectorAll('.theme-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.theme-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });

  document.getElementById('testPathBtn').addEventListener('click', async () => {
    const path = document.getElementById('cfgArgs').value;
    try {
      const result = await invoke('test_connection');
      const testResult = document.getElementById('testResult');
      testResult.textContent = result.success ? 'Válido!' : 'Não encontrado';
      testResult.style.color = result.success ? '#4caf50' : '#e74c3c';
    } catch (err) {
      showNotification(`Erro: ${err}`, 'error');
    }
  });

  // Listener para colar imagens (Ctrl+V)
  promptInput.addEventListener('paste', (e) => {
    const items = (e.clipboardData || e.originalEvent.clipboardData).items;
    for (const item of items) {
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        handleFileAttachment([file]);
      }
    }
  });

  // Listener para o botão de alfinete (diálogo do Tauri)
  attachBtn.addEventListener('click', async () => {
    try {
      const selected = await open({
        multiple: true,
        filters: [{
          name: 'Imagens e Documentos',
          extensions: ['png', 'jpg', 'jpeg', 'gif', 'pdf', 'txt', 'js', 'py', 'rs']
        }]
      });

      if (selected) {
        const paths = Array.isArray(selected) ? selected : [selected];
        // Nota: Para carregar o preview de imagens locais no Tauri, 
        // precisaríamos usar convertFileSrc ou ler como binário.
        // Por enquanto, mostraremos o ícone de arquivo.
        paths.forEach(path => {
          const name = path.split(/[\\/]/).pop();
          currentAttachments.push({
            name: name,
            path: path,
            isImage: name.match(/\.(png|jpg|jpeg|gif)$/i),
            isPath: true
          });
        });
        renderAttachments();
      }
    } catch (err) {
      console.error('Erro ao abrir diálogo:', err);
      // Fallback
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.onchange = (e) => handleFileAttachment(e.target.files);
      input.click();
    }
  });

  // Requisitos
  btnIgnoreRequirements.addEventListener('click', () => {
    requirementsModal.classList.remove('open');
    setTimeout(() => requirementsModal.style.display = 'none', 300);
  });

  btnInstallOpenclaude.addEventListener('click', async () => {
    try {
      installBtnText.textContent = 'Instalando...';
      installSpinner.style.display = 'inline-block';
      btnInstallOpenclaude.disabled = true;

      const result = await invoke('install_openclaude');
      showNotification(result.message, 'success');
      
      // Re-verificar após instalação
      await checkRequirements();
    } catch (err) {
      showNotification(err, 'error');
    } finally {
      installBtnText.textContent = 'Instalar OpenClaude via NPM';
      installSpinner.style.display = 'none';
      btnInstallOpenclaude.disabled = false;
    }
  });
}

// Listener de logs do backend
function setupLogListener() {
  listen('log-update', (event) => {
    const data = event.payload;
    addLogEntry(data.source, data.message);
  });
}

// Polling de status
function startStatusPolling() {
  setInterval(async () => {
    const status = await updateStatus();
    if (JSON.stringify(status) !== JSON.stringify(lastStatus)) {
      lastStatus = status;
    }
  }, 2000);
}

// Helper
function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
