(function () {
  'use strict';
  if (!location.href.includes('activeTab=Decal')) return;

  GM_addStyle(`
    #decal-drop-zone {
      border: 3px dashed #2ecc71;
      border-radius: 10px;
      padding: 40px;
      text-align: center;
      font-size: 1.2em;
      background: #f9f9f9;
      color: #333;
      margin-top: 20px;
      transition: background 0.3s ease;
    }
    #decal-drop-zone.dragover {
      background: #e0fbe0;
    }
  `);

  // Create the drop area UI
  const dropZone = document.createElement('div');
  dropZone.id = 'decal-drop-zone';
  dropZone.textContent =
    '💾 Drop multiple decal images here to upload automatically!';
  document.body.prepend(dropZone);

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
  });

  dropZone.addEventListener('drop', async (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');

    const files = [...e.dataTransfer.files];
    for (const file of files) {
      if (!file.type.startsWith('image/')) continue;

      const name = file.name.replace(/\.[^/.]+$/, ''); // filename w/o extension
      await uploadDecal(file, name, 'Uploaded via Tampermonkey Enhancer');
    }
  });

  async function uploadDecal(file, name, description) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('description', description);

    const res = await fetch('https://apis.roblox.com/assets/v1/upload', {
      method: 'POST',
      body: formData,
      credentials: 'include',
    });

    if (!res.ok) {
      alert('Failed to upload ' + name);
      return;
    }

    console.log('Uploaded:', name);
  }
})();