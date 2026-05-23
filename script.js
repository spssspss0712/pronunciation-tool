const form = document.getElementById('dictionary-form');
const wordInput = document.getElementById('word-search');
const resultEl = document.getElementById('result');

// Dropdown UI (created dynamically so we don't change existing HTML structure)
const historyDropdown = document.createElement('div');
historyDropdown.id = 'history-dropdown';
historyDropdown.style.position = 'absolute';
historyDropdown.style.zIndex = '1000';
historyDropdown.style.display = 'none';
historyDropdown.style.background = 'white';
historyDropdown.style.border = '1px solid #ccc';
historyDropdown.style.borderRadius = '4px';
historyDropdown.style.boxShadow = '0 2px 6px rgba(0,0,0,0.1)';
historyDropdown.style.maxHeight = '220px';
historyDropdown.style.overflowY = 'auto';
historyDropdown.style.minWidth = '180px';
historyDropdown.style.padding = '4px 0';

const historyDropdownList = document.createElement('ul');
historyDropdownList.style.listStyle = 'none';
historyDropdownList.style.margin = '0';
historyDropdownList.style.padding = '0';
historyDropdown.appendChild(historyDropdownList);

// insert dropdown into the form so absolute positioning is relative to the form
form.style.position = form.style.position || 'relative';
form.appendChild(historyDropdown);

const HISTORY_KEY = 'pronunciationToolHistory';
const HISTORY_MAX = 10;

function loadHistory() {
  try {
    const saved = localStorage.getItem(HISTORY_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    return [];
  }
}

function saveHistory(history) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}



function renderDropdown() {
  const history = loadHistory();
  // Use the same ordering and cap as the main history logic (most recent first)
  if (!history || history.length === 0) {
    historyDropdown.style.display = 'none';
    historyDropdownList.innerHTML = '';
    return;
  }

  historyDropdownList.innerHTML = history.slice(0, HISTORY_MAX).map(word => `\n    <li style="padding:6px 12px; cursor:pointer;">${word}</li>`).join('');

  // attach click handlers
  Array.from(historyDropdownList.children).forEach((li) => {
    li.addEventListener('click', (e) => {
      const w = e.currentTarget.textContent.trim();
      hideDropdown();
      searchWord(w);
    });
    li.addEventListener('mousedown', (e) => {
      // prevent blur on input in some browsers
      e.preventDefault();
    });
  });

  // position dropdown under the input
  const rect = wordInput.getBoundingClientRect();
  const formRect = form.getBoundingClientRect();
  const left = rect.left - formRect.left;
  const top = rect.bottom - formRect.top + 4;
  historyDropdown.style.left = `${left}px`;
  historyDropdown.style.top = `${top}px`;
  historyDropdown.style.minWidth = `${rect.width}px`;
  historyDropdown.style.display = 'block';
}

function showDropdown() {
  renderDropdown();
}

function hideDropdown() {
  historyDropdown.style.display = 'none';
}

// Show dropdown on input focus/click if there is history
wordInput.addEventListener('focus', () => {
  const history = loadHistory();
  if (history && history.length) showDropdown();
});
wordInput.addEventListener('click', () => {
  const history = loadHistory();
  if (history && history.length) showDropdown();
});

// Hide dropdown when clicking outside input/dropdown
document.addEventListener('click', (e) => {
  if (e.target === wordInput) return;
  if (historyDropdown.contains(e.target)) return;
  hideDropdown();
});

function addToHistory(word) {
  const history = loadHistory();
  const cleanedWord = word.trim();
  const existingIndex = history.findIndex((item) => item.toLowerCase() === cleanedWord.toLowerCase());

  if (existingIndex !== -1) {
    history.splice(existingIndex, 1);
  }

  history.unshift(cleanedWord);

  if (history.length > HISTORY_MAX) {
    history.length = HISTORY_MAX;
  }

  saveHistory(history);
  renderDropdown();
}

function renderPhonetics(phonetics) {
  if (!Array.isArray(phonetics) || phonetics.length === 0) {
    return '';
  }

  const phoneticsHtml = phonetics.map((phonetic) => {
    const audioButton = phonetic.audio
      ? `<button type="button" class="play-audio" data-audio="${phonetic.audio}" title="Play audio">🔊</button>`
      : '';
    const toggleSwitch = phonetic.audio
      ? `<label class="slow-speed-label" style="display:none; align-items:center; gap:0.5rem;">
          <span style="font-size:0.9rem;">0.5×</span>
          <div style="position:relative; width:40px; height:22px; background:#ccc; border-radius:11px; cursor:pointer; transition:background 0.3s;">
            <input class="slow-speed-toggle" type="checkbox" style="opacity:0; position:absolute; width:0; height:0; cursor:pointer;" />
            <span style="position:absolute; top:2px; left:2px; width:18px; height:18px; background:white; border-radius:50%; transition:left 0.3s;" class="toggle-slider"></span>
          </div>
        </label>`
      : '';
    const mouthBlock = phonetic.audio
      ? `<div class="mouth-shape" aria-hidden="true">
          <div class="mouth-figure mouth-frame-0">
            <div class="upper"></div>
            <div class="lower"></div>
          </div>
        </div>`
      : '';

    return `
      <div class="phonetic-item">
        <div class="phonetic-content">
          <div class="phonetic-main">
            <span class="phonetic-text">${phonetic.text || ''}</span>
            ${audioButton}
          </div>
          ${toggleSwitch}
        </div>
        ${mouthBlock}
      </div>`;
  }).join('');

  return `
    <section class="phonetics">
      <h3>Pronunciation</h3>
      ${phoneticsHtml}
    </section>`;
}

function renderDefinition(entry) {
  const meaningsHtml = entry.meanings.map((meaning) => {
    const defs = meaning.definitions.map((def) => {
      const example = def.example ? `<div class="example">Example: ${def.example}</div>` : '';
      return `
        <div class="definition-item">
          <div class="definition-text">${def.definition}</div>
          ${example}
        </div>`;
    }).join('');

    return `
      <section class="meaning">
        <h3>${meaning.partOfSpeech}</h3>
        ${defs}
      </section>`;
  }).join('');

  const phoneticsSection = renderPhonetics(entry.phonetics);

  return `
    <article class="entry">
      <h2>${entry.word}</h2>
      <!--${entry.phonetic ? `<p class="phonetic-primary">Pronunciation: ${entry.phonetic}</p>` : ''} -->
      ${phoneticsSection}
      ${entry.origin ? `<p class="origin">Origin: ${entry.origin}</p>` : ''}
      ${meaningsHtml}
    </article>`;
}

function showMessage(message, isError = false) {
  resultEl.innerHTML = `<p class="message ${isError ? 'error' : ''}">${message}</p>`;
}

async function fetchWord(word) {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`No definition found for "${word}".`);
  }

  return response.json();
}

function attachAudioHandlers() {
  document.querySelectorAll('.play-audio').forEach((button) => {
    const audioUrl = button.dataset.audio;
    const phoneticItem = button.closest('.phonetic-item');
    const toggle = phoneticItem.querySelector('.slow-speed-toggle');
    const toggleLabel = phoneticItem.querySelector('.slow-speed-label');

    if (toggleLabel) {
      const preloadAudio = new Audio();
      preloadAudio.preload = 'auto';
      preloadAudio.src = audioUrl;
      preloadAudio.addEventListener('canplaythrough', () => {
        toggleLabel.style.display = 'inline-flex';
        updateToggleStyle(toggle, toggleLabel);
      });
      preloadAudio.addEventListener('error', () => {
        toggleLabel.style.display = 'none';
      });
      preloadAudio.load();

      toggle.addEventListener('change', () => {
        updateToggleStyle(toggle, toggleLabel);
      });
    }

    button.addEventListener('click', (event) => {
      event.preventDefault();
      const audio = new Audio(audioUrl);
      const mouthFigure = phoneticItem.querySelector('.mouth-figure');
      const mouthStates = ['mouth-frame-0', 'mouth-frame-1', 'mouth-frame-2', 'mouth-frame-3'];

      const updateMouthState = () => {
        if (!mouthFigure || !audio.duration || isNaN(audio.duration)) return;
        const ratio = Math.min(1, Math.max(0, audio.currentTime / audio.duration));
        const frameIndex = Math.floor(ratio * mouthStates.length) % mouthStates.length;
        mouthStates.forEach((state) => mouthFigure.classList.remove(state));
        mouthFigure.classList.add(mouthStates[frameIndex]);
      };

      audio.playbackRate = toggle && toggle.checked ? 0.5 : 1;

      audio.addEventListener('play', () => {
        if (mouthFigure) {
          mouthFigure.classList.add('speaking');
        }
      });

      audio.addEventListener('pause', () => {
        if (mouthFigure) {
          mouthFigure.classList.remove('speaking');
          mouthStates.forEach((state) => mouthFigure.classList.remove(state));
          mouthFigure.classList.add('mouth-frame-0');
        }
      });

      audio.addEventListener('ended', () => {
        if (mouthFigure) {
          mouthFigure.classList.remove('speaking');
          mouthStates.forEach((state) => mouthFigure.classList.remove(state));
          mouthFigure.classList.add('mouth-frame-0');
        }
      });

      audio.addEventListener('timeupdate', updateMouthState);
      audio.play();
    });
  });
}

function updateToggleStyle(toggle, toggleLabel) {
  const toggleContainer = toggleLabel.querySelector('div');
  const toggleSlider = toggleLabel.querySelector('.toggle-slider');

  if (toggle.checked) {
    toggleContainer.style.background = '#4CAF50';
    toggleSlider.style.left = '20px';
  } else {
    toggleContainer.style.background = '#ccc';
    toggleSlider.style.left = '2px';
  }
}

async function searchWord(word) {
  const trimmedWord = word.trim();

  if (!trimmedWord) {
    showMessage('Please enter a word to search.', true);
    return;
  }

  showMessage('Searching...');

  try {
    const entries = await fetchWord(trimmedWord);
    if (!Array.isArray(entries) || entries.length === 0) {
      showMessage(`No results found for "${trimmedWord}".`, true);
      return;
    }

    resultEl.innerHTML = entries.map(renderDefinition).join('');
    attachAudioHandlers();
    addToHistory(trimmedWord);
  } catch (error) {
    showMessage(error.message, true);
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  await searchWord(wordInput.value);
});