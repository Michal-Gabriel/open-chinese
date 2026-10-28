/* OpenChinese — the shared header: a way home, and the account control.
 *
 * Mounts into <div id="site-nav"> if the page provides one, otherwise appends
 * itself to <body>. The story reader rebuilds document.body wholesale when it
 * renders, so the nav watches for its own removal and puts itself back.
 *
 * Reads data-home on the #site-nav element for the link back to the landing
 * page ("./" at the root, "../" one level down).
 */

const slot = document.getElementById('site-nav');
const home = (slot && slot.dataset.home) || './';
const node = document.createElement('nav');
node.className = 'site-nav';

/* First name if we have one; otherwise the part before the @, never the whole
   address — the header is on screen in public. */
function shortName(name) {
  return String(name || 'Account').split('@')[0].split(' ')[0];
}

function render() {
  node.textContent = '';

  const atHome = home === './';
  const back = document.createElement(atHome ? 'span' : 'a');
  back.className = 'home' + (atHome ? ' home--current' : '');
  if (!atHome) back.href = home;
  back.textContent = atHome ? 'OpenChinese' : '← OpenChinese';
  node.appendChild(back);

  const spacer = document.createElement('div');
  spacer.className = 'spacer';
  node.appendChild(spacer);

  const auth = window.OpenChineseAuth;
  if (!auth) return;                      // no backend configured — no account UI at all

  const box = document.createElement('div');
  box.className = 'account';
  const u = auth.user;

  const btn = document.createElement('button');
  if (u && !u.anonymous) {
    if (u.avatar) {
      const img = document.createElement('img');
      img.src = u.avatar; img.alt = ''; img.referrerPolicy = 'no-referrer';
      btn.appendChild(img);
    }
    btn.appendChild(document.createTextNode(shortName(u.name)));
    btn.title = 'Signed in — your progress saves to this account';
    btn.addEventListener('click', () => {
      if (confirm('Sign out? Your progress stays saved to your account.')) auth.signOut();
    });
  } else {
    btn.textContent = 'Sign in';
    btn.title = 'Save your progress and pick it up on any device';
    btn.addEventListener('click', () => auth.signIn());
  }
  box.appendChild(btn);

  const dot = document.createElement('span');
  dot.className = 'dot ' + (auth.status || 'idle');
  box.appendChild(dot);

  node.appendChild(box);
}

function mount() {
  if (node.isConnected) return;
  if (slot && slot.isConnected) slot.replaceWith(node);
  else document.body.insertBefore(node, document.body.firstChild);
}

render();
mount();

window.addEventListener('oc:auth', () => { render(); mount(); });
window.addEventListener('oc:status', e => {
  const dot = node.querySelector('.dot');
  if (dot) dot.className = 'dot ' + ((e.detail || {}).status || 'idle');
});

/* The reader replaces document.body when it renders, which would take the nav
   with it. Put it back rather than racing the reader for ordering. */
new MutationObserver(() => {
  if (!node.isConnected && document.body) { mount(); }
}).observe(document.documentElement, { childList: true, subtree: true });
