// ── DOM Elements ─────────────────────────────────────────────
const chatBox  = document.getElementById('chatBox');
const chatForm = document.getElementById('chatForm');
const msgInput = document.getElementById('message');
const chatWrap = chatBox.querySelector('.max-w-5xl');

// ── Utilities ─────────────────────────────────────────────────
const scrollBottom = () =>
  chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });

const escapeHtml = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const createBubble = (type, innerHtml) => {
  const el = document.createElement('div');
  el.className = `bubble-${type}`;
  el.innerHTML = innerHtml;
  chatWrap.appendChild(el);
  scrollBottom();
  return el;
};

// ── Avatar Bot (logo.png) ─────────────────────────────────────
const AVATAR_BOT = `
  <div class="avatar avatar-bot">
    <img src="/logo.png" alt="bot"
         class="w-full h-full object-cover rounded-[10px]"
         onerror="this.outerHTML='<i class=\\'fa-solid fa-mountain\\'></i>'" />
  </div>`;

// ── Typing Indicator ──────────────────────────────────────────
let typingEl = null;

const showTyping = () => {
  if (typingEl) return;
  typingEl = createBubble('bot', `
    ${AVATAR_BOT}
    <div class="msg-content flex items-center gap-2 py-3 px-4">
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
      <span class="typing-dot"></span>
    </div>`);
};

const hideTyping = () => {
  typingEl?.remove();
  typingEl = null;
};

// ── Chat Messages ─────────────────────────────────────────────
const addUserMessage = (text) =>
  createBubble('user', `
    <div class="avatar avatar-user"><i class="fa-solid fa-user"></i></div>
    <div class="msg-content">${escapeHtml(text)}</div>`);

const addBotMessage = (md) => {
  hideTyping();
  createBubble('bot', `
    ${AVATAR_BOT}
    <div class="msg-content prose prose-invert max-w-none">${marked.parse(md)}</div>`);
};

const addErrorMessage = (icon, text) =>
  addBotMessage(`<i class="fa-solid fa-${icon} mr-1"></i> ${text}`);

// ── Quick Question ────────────────────────────────────────────
const sendQuickQuestion = (q) => {
  msgInput.value = q;
  chatForm.dispatchEvent(new Event('submit', { cancelable: true }));
};

// ── Submit → /api/chat ────────────────────────────────────────
chatForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const text = msgInput.value.trim();
  if (!text) return;

  msgInput.value = '';
  addUserMessage(text);
  showTyping();

  try {
    const res  = await fetch('/api/chat', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify({ message: text }),
    });

    const data = await res.json();

    data.success
      ? addBotMessage(data.reply)
      : addErrorMessage('triangle-exclamation text-yellow-400', data.reply);

  } catch {
    addErrorMessage('wifi text-red-400', 'Tidak dapat terhubung ke server. Pastikan server Express sudah berjalan.');
  }
});