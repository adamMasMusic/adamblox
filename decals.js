(function () {
  'use strict';
  if (!location.href.includes('activeTab=Decal')) return;

  GM_addStyle(`
    #custom-decal-uploader {
      border: 2px dashed #656668;
      border-radius: 8px;
      padding: 30px;
      text-align: center;
      background: #2b2d31;
      color: #ffffff;
      transition: all 0.3s ease;
    }
    #custom-decal-uploader.dragover {
      background: #3c4043;
      border-color: #00a2ff;
    }
    .upload-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 15px;
      margin-top: 20px;
    }
    .image-preview {
      position: relative;
      border: 1px solid #656668;
      border-radius: 8px;
      padding: 10px;
      background: #393b3f;
    }
    .image-preview img {
      width: 100%;
      height: 100px;
      object-fit: cover;
      border-radius: 4px;
    }
    .image-name {
      font-size: 0.8em;
      margin: 5px 0;
      word-break: break-word;
      color: #ffffff;
    }
    .status-bar {
      width: 100%;
      height: 6px;
      background: #656668;
      border-radius: 3px;
      overflow: hidden;
      margin-top: 5px;
    }
    .status-fill {
      height: 100%;
      transition: width 0.3s ease;
      border-radius: 3px;
    }
    .status-pending { background: #ffa500; width: 0%; }
    .status-uploading { background: #00a2ff; width: 50%; }
    .status-success { background: #00ff88; width: 100%; }
    .status-error { background: #ff4757; width: 100%; }
    .upload-text {
      font-size: 1.2em;
      margin-bottom: 10px;
      color: #ffffff;
    }
    .upload-info {
      font-size: 0.9em;
      color: #b9bbbe;
      margin-top: 10px;
    }
    .api-key-setup {
      background: #404249;
      border-radius: 8px;
      padding: 20px;
      margin: 20px 0;
    }
    .api-key-input {
      width: 100%;
      padding: 10px;
      border: 1px solid #656668;
      border-radius: 4px;
      background: #36393f;
      color: #ffffff;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 11px;
      word-break: break-all;
      height: 60px;
    }
    .api-key-buttons {
      margin-top: 15px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    .btn {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 0.9em;
      text-decoration: none;
      display: inline-block;
      transition: background-color 0.2s;
    }
    .btn-primary {
      background: #5865f2;
      color: white;
    }
    .btn-primary:hover {
      background: #4752c4;
    }
    .btn-secondary {
      background: #4f545c;
      color: white;
    }
    .btn-secondary:hover {
      background: #5d6269;
    }
    .btn-danger {
      background: #ed4245;
      color: white;
    }
    .btn-danger:hover {
      background: #c9302c;
    }
    .api-key-status {
      margin-top: 10px;
      font-size: 0.9em;
    }
    .status-valid {
      color: #00ff88;
    }
    .status-invalid {
      color: #ff4757;
    }
    .creator-setup {
      background: #404249;
      border-radius: 8px;
      padding: 15px;
      margin: 15px 0;
    }
    .creator-options {
      display: flex;
      gap: 20px;
      margin: 10px 0;
      align-items: center;
    }
    .creator-option {
      display: flex;
      align-items: center;
      gap: 5px;
      color: #ffffff;
    }
    .creator-option input[type="radio"] {
      margin-right: 5px;
    }
    .creator-id-input {
      width: 100%;
      padding: 8px;
      border: 1px solid #656668;
      border-radius: 4px;
      background: #36393f;
      color: #ffffff;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 12px;
    }
    .creator-id-section {
      margin-top: 10px;
    }
  `);

  let uploadQueue = [];
  let completedUploads = 0;
  let apiKey = localStorage.getItem('adamblox_opencloud_key');
  let creatorType = localStorage.getItem('adamblox_creator_type') || 'user';
  let creatorId = localStorage.getItem('adamblox_creator_id');

  // Find and replace the existing upload interface
  function replaceUploadInterface() {
    // Method 1: Look for "Upload Asset" button
    const uploadButton = Array.from(document.querySelectorAll('button[type="button"]')).find(button => {
      return button.textContent.includes('Upload Asset');
    });
    
    if (uploadButton) {
      let container = uploadButton.parentElement;
      while (container && container !== document.body) {
        const hasDragText = container.textContent.includes('Drag and drop media here');
        if (hasDragText) {
          const customUploader = createCustomUploader();
          container.replaceWith(customUploader);
          console.log('Replaced upload interface via upload button');
          return true;
        }
        container = container.parentElement;
      }
    }
    
    // Method 2: Look for drag and drop text directly
    const dragTextElement = Array.from(document.querySelectorAll('span')).find(span => 
      span.textContent.includes('Drag and drop media here')
    );
    
    if (dragTextElement) {
      let container = dragTextElement.parentElement;
      while (container && container !== document.body) {
        const hasUploadButton = container.textContent.includes('Upload Asset');
        const hasFileLimit = container.textContent.includes('Max number of files');
        
        if (hasUploadButton && hasFileLimit) {
          const customUploader = createCustomUploader();
          container.replaceWith(customUploader);
          console.log('Replaced upload interface via drag text');
          return true;
        }
        container = container.parentElement;
      }
    }

    // Method 3: Look for file format restrictions text
    const formatTextElement = Array.from(document.querySelectorAll('span')).find(span => 
      span.textContent.includes('*.jpg, *.png, *.tga, *.bmp')
    );
    
    if (formatTextElement) {
      let container = formatTextElement.parentElement;
      while (container && container !== document.body) {
        if (container.textContent.includes('Upload Asset')) {
          const customUploader = createCustomUploader();
          container.replaceWith(customUploader);
          console.log('Replaced upload interface via format text');
          return true;
        }
        container = container.parentElement;
      }
    }

    return false;
  }

  function createCustomUploader() {
    const uploader = document.createElement('div');
    uploader.id = 'custom-decal-uploader';
    
    if (!apiKey || !creatorId) {
      uploader.innerHTML = createApiKeySetup();
    } else {
      uploader.innerHTML = createUploadInterface();
      addUploadEventListeners(uploader);
    }

    return uploader;
  }

  function createApiKeySetup() {
    return `
      <div class="api-key-setup">
        <div class="upload-text">🔑 OpenCloud API Key Required</div>
        <div class="upload-info">
          To upload multiple decals, you need a Roblox OpenCloud API key with Asset creation permissions.
        </div>
        <div style="margin: 15px 0;">
          <textarea class="api-key-input" placeholder="Paste your OpenCloud API key here..." id="api-key-input">${apiKey || ''}</textarea>
          <div id="api-key-status" class="api-key-status"></div>
        </div>
        <div class="creator-setup">
          <div style="margin-bottom: 10px; color: #ffffff;">Upload as:</div>
          <div class="creator-options">
            <label class="creator-option">
              <input type="radio" name="creator-type" value="user" ${creatorType === 'user' ? 'checked' : ''} id="creator-user">
              <span>User</span>
            </label>
            <label class="creator-option">
              <input type="radio" name="creator-type" value="group" ${creatorType === 'group' ? 'checked' : ''} id="creator-group">
              <span>Group</span>
            </label>
          </div>
          <div class="creator-id-section">
            <div style="margin-bottom: 5px; color: #ffffff;" id="creator-id-label">
              ${creatorType === 'user' ? 'Your User ID:' : 'Group ID:'}
            </div>
            <input type="text" class="creator-id-input" placeholder="${creatorType === 'user' ? 'Enter your Roblox User ID' : 'Enter Group ID'}" id="creator-id-input" value="${creatorId || ''}">
            <div style="font-size: 0.8em; color: #b9bbbe; margin-top: 5px;" id="creator-id-help">
              ${creatorType === 'user' ? 
                'Find your User ID at: <a href="https://www.roblox.com/users/profile" target="_blank" style="color: #00a2ff;">roblox.com/users/profile</a>' :
                'Find Group ID in the group URL: roblox.com/groups/<strong>GROUP_ID</strong>/group-name'
              }
            </div>
          </div>
        </div>
        <div class="api-key-buttons">
          <button class="btn btn-primary" id="save-api-key">Save Settings</button>
          <a href="https://create.roblox.com/dashboard/credentials" target="_blank" class="btn btn-secondary">
            Get API Key from Roblox
          </a>
        </div>
        <div class="upload-info" style="margin-top: 15px;">
          <strong>Required permissions:</strong> Create assets<br>
          <strong>Note:</strong> Your settings are stored locally in your browser only.
        </div>
      </div>
    `;
  }

  function createUploadInterface() {
    const creatorDisplayText = creatorType === 'user' ? `User ID: ${creatorId}` : `Group ID: ${creatorId}`;
    return `
      <div class="upload-text">💾 Drop multiple decal images here to upload!</div>
      <div class="upload-info">
        Format: *.jpg, *.png, *.tga, *.bmp | Max size per file: 20 MB<br>
        Using OpenCloud API ✓ | Uploading as ${creatorType} | ${creatorDisplayText}
      </div>
      <div style="margin: 10px 0;">
        <button class="btn btn-danger" id="clear-api-key" style="font-size: 0.8em;">Clear Settings</button>
      </div>
      <div id="upload-grid" class="upload-grid"></div>
    `;
  }

  function addUploadEventListeners(uploader) {
    uploader.addEventListener('dragover', (e) => {
      e.preventDefault();
      uploader.classList.add('dragover');
    });

    uploader.addEventListener('dragleave', (e) => {
      if (!uploader.contains(e.relatedTarget)) {
        uploader.classList.remove('dragover');
      }
    });

    uploader.addEventListener('drop', handleDrop);
    uploader.addEventListener('click', (e) => {
      if (e.target.id === 'clear-api-key') {
        clearApiKey();
        return;
      }
      
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = true;
      input.accept = 'image/*';
      input.onchange = (e) => handleFileSelect(e.target.files);
      input.click();
    });
  }

  async function handleDrop(e) {
    e.preventDefault();
    document.getElementById('custom-decal-uploader').classList.remove('dragover');
    
    if (!apiKey || !creatorId) {
      alert('Please set up your OpenCloud API key and creator ID first!');
      return;
    }
    
    handleFileSelect(e.dataTransfer.files);
  }

  async function handleFileSelect(files) {
    if (!apiKey || !creatorId) {
      alert('Please set up your OpenCloud API key and creator ID first!');
      return;
    }

    const validFiles = [...files].filter(file => 
      file.type.startsWith('image/') && file.size <= 20 * 1024 * 1024 && file.size > 0
    );

    if (validFiles.length === 0) {
      alert('No valid image files found! Make sure files are images and under 20MB.');
      return;
    }

    if (validFiles.length !== files.length) {
      alert(`${files.length - validFiles.length} files were skipped (invalid format or too large)`);
    }

    uploadQueue = validFiles.map(file => ({
      file,
      name: file.name.replace(/\.[^/.]+$/, ''),
      status: 'pending',
      element: null
    }));

    completedUploads = 0;
    displayImagePreviews();
    startUploads();
  }

  function displayImagePreviews() {
    const grid = document.getElementById('upload-grid');
    grid.innerHTML = '';

    uploadQueue.forEach((item, index) => {
      const preview = document.createElement('div');
      preview.className = 'image-preview';
      
      const img = document.createElement('img');
      img.src = URL.createObjectURL(item.file);
      img.onload = () => URL.revokeObjectURL(img.src);
      
      const name = document.createElement('div');
      name.className = 'image-name';
      name.textContent = item.name;
      
      const statusBar = document.createElement('div');
      statusBar.className = 'status-bar';
      
      const statusFill = document.createElement('div');
      statusFill.className = 'status-fill status-pending';
      statusBar.appendChild(statusFill);
      
      preview.appendChild(img);
      preview.appendChild(name);
      preview.appendChild(statusBar);
      
      grid.appendChild(preview);
      
      uploadQueue[index].element = preview;
      uploadQueue[index].statusFill = statusFill;
    });
  }

  async function startUploads() {
    console.log('Starting OpenCloud uploads...');

    for (const item of uploadQueue) {
      updateStatus(item, 'uploading');
      
      try {
        await uploadDecalOpenCloud(item.file, item.name);
        updateStatus(item, 'success');
        completedUploads++;
      } catch (error) {
        console.error('Upload failed:', error);
        updateStatus(item, 'error');
        completedUploads++;
      }
      
      // Delay between uploads to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    // Show results after all uploads complete
    if (completedUploads === uploadQueue.length) {
      setTimeout(() => {
        const successCount = uploadQueue.filter(item => item.status === 'success').length;
        const errorCount = uploadQueue.filter(item => item.status === 'error').length;
        
        let message = `Upload complete!\n✅ Success: ${successCount}\n❌ Failed: ${errorCount}`;
        if (successCount > 0) {
          message += '\n\nPage will reload to show your new decals.';
        }
        
        alert(message);
        if (successCount > 0) {
          location.reload();
        }
      }, 1000);
    }
  }

  function updateStatus(item, status) {
    item.status = status;
    item.statusFill.className = `status-fill status-${status}`;
  }

  async function uploadDecalOpenCloud(file, displayName) {
    console.log('Uploading to OpenCloud:', file.name);
    console.log('API Key format check:', apiKey ? `${apiKey.substring(0, 20)}...` : 'NO KEY');

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = function() {
        const arrayBuffer = reader.result;
        
        // Create boundary
        const boundary = '----formdata-adamblox-' + Date.now() + Math.random().toString(36);
        
        // Create the request object as per Roblox API format
        const requestData = {
          assetType: "Decal",
          displayName: displayName,
          description: "Uploaded via Adamblox",
          creationContext: {
            creator: creatorType === 'user' ? 
              { userId: creatorId } : 
              { groupId: creatorId }
          }
        };
        
        // Create form data parts
        let bodyParts = [];
        
        // Add request field (JSON data)
        bodyParts.push(`--${boundary}\r\n`);
        bodyParts.push(`Content-Disposition: form-data; name="request"\r\n\r\n`);
        bodyParts.push(`${JSON.stringify(requestData)}\r\n`);
        
        // Add fileContent field
        bodyParts.push(`--${boundary}\r\n`);
        bodyParts.push(`Content-Disposition: form-data; name="fileContent"; filename="${file.name}"\r\n`);
        bodyParts.push(`Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`);
        
        // Convert text parts to bytes
        const textEncoder = new TextEncoder();
        const headerBytes = textEncoder.encode(bodyParts.join(''));
        const footerBytes = textEncoder.encode(`\r\n--${boundary}--\r\n`);
        
        // Combine everything
        const totalLength = headerBytes.length + arrayBuffer.byteLength + footerBytes.length;
        const combinedData = new Uint8Array(totalLength);
        combinedData.set(headerBytes, 0);
        combinedData.set(new Uint8Array(arrayBuffer), headerBytes.length);
        combinedData.set(footerBytes, headerBytes.length + arrayBuffer.byteLength);
        
        // Convert to binary string for GM_xmlhttpRequest
        let binaryString = '';
        for (let i = 0; i < combinedData.length; i++) {
          binaryString += String.fromCharCode(combinedData[i]);
        }

        console.log('Request details:', {
          url: 'https://apis.roblox.com/assets/v1/assets',
          method: 'POST',
          contentType: `multipart/form-data; boundary=${boundary}`,
          bodyLength: binaryString.length,
          requestData: requestData
        });

        GM_xmlhttpRequest({
          method: 'POST',
          url: 'https://apis.roblox.com/assets/v1/assets',
          headers: {
            'x-api-key': apiKey,
            'Content-Type': `multipart/form-data; boundary=${boundary}`
          },
          data: binaryString,
          binary: true,
          responseType: 'json',
          onload: function(response) {
            console.log('Upload response:', response.status, response.responseText);
            
            if (response.status >= 200 && response.status < 300) {
              try {
                const result = typeof response.response === 'object' ? response.response : JSON.parse(response.responseText);
                console.log('Upload successful:', result);
                resolve(result);
              } catch (e) {
                console.log('Upload successful (no JSON response)');
                resolve({ success: true });
              }
            } else {
              let errorMsg = response.responseText;
              if (response.status === 401) {
                errorMsg = 'API Key is invalid, expired, or lacks permissions. Check your API key settings.';
                alert(errorMsg);
                clearApiKey();
              }
              reject(new Error(`Upload failed: ${response.status} - ${errorMsg}`));
            }
          },
          onerror: function(error) {
            console.error('Upload request failed:', error);
            reject(new Error('Network error during upload'));
          }
        });
      };
      
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsArrayBuffer(file);
    });
  }

  function setupApiKeyHandlers() {
    const saveButton = document.getElementById('save-api-key');
    const keyInput = document.getElementById('api-key-input');
    const creatorIdInput = document.getElementById('creator-id-input');
    const statusDiv = document.getElementById('api-key-status');
    const userRadio = document.getElementById('creator-user');
    const groupRadio = document.getElementById('creator-group');
    const creatorIdLabel = document.getElementById('creator-id-label');
    const creatorIdHelp = document.getElementById('creator-id-help');
    
    // Handle radio button changes
    function updateCreatorType() {
      const selectedType = document.querySelector('input[name="creator-type"]:checked').value;
      creatorType = selectedType;
      
      if (selectedType === 'user') {
        creatorIdLabel.textContent = 'Your User ID:';
        creatorIdInput.placeholder = 'Enter your Roblox User ID';
        creatorIdHelp.innerHTML = 'Find your User ID at: <a href="https://www.roblox.com/users/profile" target="_blank" style="color: #00a2ff;">roblox.com/users/profile</a>';
      } else {
        creatorIdLabel.textContent = 'Group ID:';
        creatorIdInput.placeholder = 'Enter Group ID';
        creatorIdHelp.innerHTML = 'Find Group ID in the group URL: roblox.com/groups/<strong>GROUP_ID</strong>/group-name';
      }
    }
    
    if (userRadio && groupRadio) {
      userRadio.addEventListener('change', updateCreatorType);
      groupRadio.addEventListener('change', updateCreatorType);
    }
    
    if (saveButton && keyInput && creatorIdInput && statusDiv) {
      saveButton.onclick = async () => {
        const key = keyInput.value.trim();
        const creatorIdValue = creatorIdInput.value.trim();
        
        if (!key) {
          statusDiv.innerHTML = '<span class="status-invalid">Please enter an API key</span>';
          return;
        }

        if (!creatorIdValue || !/^\d+$/.test(creatorIdValue)) {
          statusDiv.innerHTML = `<span class="status-invalid">Please enter a valid ${creatorType === 'user' ? 'User' : 'Group'} ID (numbers only)</span>`;
          return;
        }

        if (key.length < 50) {
          statusDiv.innerHTML = '<span class="status-invalid">API key seems too short - make sure you copied the full key</span>';
          return;
        }

        // Save settings without testing (we'll validate on first upload)
        apiKey = key;
        creatorId = creatorIdValue;
        localStorage.setItem('adamblox_opencloud_key', key);
        localStorage.setItem('adamblox_creator_type', creatorType);
        localStorage.setItem('adamblox_creator_id', creatorIdValue);
        
        statusDiv.innerHTML = '<span class="status-valid">✓ Settings saved! Upload a file to test the API key.</span>';
        
        setTimeout(() => {
          const uploader = document.getElementById('custom-decal-uploader');
          uploader.innerHTML = createUploadInterface();
          addUploadEventListeners(uploader);
        }, 1500);
      };

      keyInput.onkeypress = creatorIdInput.onkeypress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          saveButton.click();
        }
      };
    }
  }

  function clearApiKey() {
    if (confirm('Are you sure you want to clear your settings?')) {
      apiKey = null;
      creatorId = null;
      localStorage.removeItem('adamblox_opencloud_key');
      localStorage.removeItem('adamblox_creator_type');
      localStorage.removeItem('adamblox_creator_id');
      const uploader = document.getElementById('custom-decal-uploader');
      uploader.innerHTML = createApiKeySetup();
      setupApiKeyHandlers();
    }
  }

  // Wait for page to load and then replace the interface
  function init() {
    const tryReplace = () => {
      if (replaceUploadInterface()) {
        console.log('Upload interface successfully replaced');
        
        // Set up API key handlers if showing setup
        if (!apiKey || !creatorId) {
          setupApiKeyHandlers();
        }
        return;
      }
      
      // If we haven't found it yet, try again in a bit
      setTimeout(tryReplace, 1000);
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', tryReplace);
    } else {
      tryReplace();
    }

    // Set up mutation observer for dynamic content
    const observer = new MutationObserver(() => {
      if (!document.getElementById('custom-decal-uploader')) {
        replaceUploadInterface();
        if (!apiKey || !creatorId) {
          setupApiKeyHandlers();
        }
      }
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  init();
})();