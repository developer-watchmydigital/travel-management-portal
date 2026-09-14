const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const ARTIFACT_DIR = 'C:\\Users\\hio\\.gemini\\antigravity-ide\\brain\\2816886c-8102-497e-8f9b-83241e88c24f';
const EDGE_PATH = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('Starting Edge with remote debugging...');
  const edgeProc = spawn(EDGE_PATH, [
    '--headless',
    '--remote-debugging-port=9222',
    '--window-size=1280,900',
    '--user-data-dir=' + path.join(__dirname, 'edge_user_data'),
    'about:blank'
  ]);

  // Wait for remote debugging endpoint to become ready
  let wsUrl = null;
  for (let i = 0; i < 20; i++) {
    await new Promise(r => setTimeout(r, 500));
    try {
      const res = await fetch('http://localhost:9222/json/version');
      const data = await res.json();
      wsUrl = data.webSocketDebuggerUrl;
      if (wsUrl) break;
    } catch (e) {
      // retry
    }
  }

  if (!wsUrl) {
    console.error('Failed to get WebSocket debugger URL from Edge');
    edgeProc.kill();
    return;
  }

  console.log('Connected to Edge via WebSocket:', wsUrl);
  const ws = new WebSocket(wsUrl);

  let id = 1;
  const pending = new Map();

  ws.onmessage = (msg) => {
    const data = JSON.parse(msg.data);
    if (data.id && pending.has(data.id)) {
      const { resolve, reject } = pending.get(data.id);
      pending.delete(data.id);
      if (data.error) reject(data.error);
      else resolve(data.result);
    }
  };

  const send = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, method, params }));
    });
  };

  await new Promise(r => ws.onopen = r);

  // Helper to create page target
  const { targetId } = await send('Target.createTarget', { url: 'http://localhost:3000' });
  const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });

  const sendSession = (method, params = {}) => {
    return new Promise((resolve, reject) => {
      const msgId = id++;
      pending.set(msgId, { resolve, reject });
      ws.send(JSON.stringify({ id: msgId, sessionId, method, params }));
    });
  };

  await sendSession('Page.enable');
  await sendSession('Runtime.enable');
  await sendSession('DOM.enable');

  console.log('Navigating to http://localhost:3000...');
  await sendSession('Page.navigate', { url: 'http://localhost:3000' });
  await new Promise(r => setTimeout(r, 2500));

  // 1. Scroll to #curated
  console.log('Scrolling to #curated...');
  await sendSession('Runtime.evaluate', {
    expression: "document.getElementById('curated')?.scrollIntoView({ behavior: 'instant', block: 'start' });"
  });
  await new Promise(r => setTimeout(r, 1000));

  // Capture Goa packages in Curated Experiences
  console.log('Capturing Curated Experiences (Goa)...');
  const snap1 = await sendSession('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'curated_goa_packages.png'), Buffer.from(snap1.data, 'base64'));

  // 2. Click Gujarat state pill
  console.log('Clicking Gujarat state pill...');
  await sendSession('Runtime.evaluate', {
    expression: "(() => { const btns = Array.from(document.querySelectorAll('#curated button')); const guj = btns.find(b => b.textContent.includes('Gujarat')); if (guj) guj.click(); })()"
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Capturing Curated Experiences (Gujarat Coming Soon)...');
  const snap2 = await sendSession('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'curated_gujarat_coming_soon.png'), Buffer.from(snap2.data, 'base64'));

  // 3. Click back to Goa and click View Itinerary on first card
  console.log('Clicking Goa pill and opening Itinerary modal...');
  await sendSession('Runtime.evaluate', {
    expression: "(() => { const btns = Array.from(document.querySelectorAll('#curated button')); const goa = btns.find(b => b.textContent.includes('Goa')); if (goa) goa.click(); })()"
  });
  await new Promise(r => setTimeout(r, 600));

  await sendSession('Runtime.evaluate', {
    expression: "(() => { const btns = Array.from(document.querySelectorAll('#curated button')); const viewBtn = btns.find(b => b.textContent.includes('View Itinerary')); if (viewBtn) viewBtn.click(); })()"
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Capturing Itinerary Modal...');
  const snap3 = await sendSession('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'curated_itinerary_modal.png'), Buffer.from(snap3.data, 'base64'));

  // 4. Navigate to /admin and login
  console.log('Navigating to http://localhost:3000/admin...');
  await sendSession('Page.navigate', { url: 'http://localhost:3000/admin' });
  await new Promise(r => setTimeout(r, 1500));

  console.log('Authenticating in Admin...');
  await sendSession('Runtime.evaluate', {
    expression: "(() => { sessionStorage.setItem('r_travel_owner_auth', 'true'); location.reload(); })()"
  });
  await new Promise(r => setTimeout(r, 2000));

  // 5. Click "Curated Packages" tab
  console.log('Switching to Curated Packages tab in Admin...');
  await sendSession('Runtime.evaluate', {
    expression: "(() => { const btns = Array.from(document.querySelectorAll('button')); const tab = btns.find(b => b.textContent.includes('Curated Packages')); if (tab) tab.click(); })()"
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Capturing Admin Curated Packages Dashboard...');
  const snap4 = await sendSession('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'admin_curated_packages.png'), Buffer.from(snap4.data, 'base64'));

  // 6. Click "+ Add New Package" button to open modal
  console.log('Opening Add New Package modal in Admin...');
  await sendSession('Runtime.evaluate', {
    expression: "(() => { const btns = Array.from(document.querySelectorAll('button')); const addBtn = btns.find(b => b.textContent.includes('Add New Package')); if (addBtn) addBtn.click(); })()"
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log('Capturing Admin Add Package Modal...');
  const snap5 = await sendSession('Page.captureScreenshot', { format: 'png' });
  fs.writeFileSync(path.join(ARTIFACT_DIR, 'admin_add_package_modal.png'), Buffer.from(snap5.data, 'base64'));

  console.log('All screenshots captured successfully!');
  ws.close();
  edgeProc.kill();
  process.exit(0);
}

main().catch(err => {
  console.error('Error in capture script:', err);
  process.exit(1);
});
