const form = document.getElementById('dictionary-form');
const wordInput = document.getElementById('word-search');
const resultEl = document.getElementById('result');
const historyEl = document.getElementById('history');
const historyListEl = document.getElementById('history-list');

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

function renderHistory() {
  const history = loadHistory();

  if (!history.length) {
    historyEl.style.display = 'none';
    historyListEl.innerHTML = '';
    return;
  }

  historyEl.style.display = 'block';
  historyListEl.innerHTML = history.map((word) => `
      <li><button type="button" class="history-item">${word}</button></li>
    `).join('');

  document.querySelectorAll('.history-item').forEach((button) => {
    button.addEventListener('click', () => {
      searchWord(button.textContent.trim());
    });
  });
}

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
  renderHistory();
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
      ? `<label class="slow-speed-label" style="display:none; margin-top:0.5rem; align-items:center; gap:0.5rem;">
          <span style="font-size:0.9rem;">0.5×</span>
          <div style="position:relative; width:40px; height:22px; background:#ccc; border-radius:11px; cursor:pointer; transition:background 0.3s;">
            <input class="slow-speed-toggle" type="checkbox" style="opacity:0; position:absolute; width:0; height:0; cursor:pointer;" />
            <span style="position:absolute; top:2px; left:2px; width:18px; height:18px; background:white; border-radius:50%; transition:left 0.3s; content:'';" class="toggle-slider"></span>
          </div>
        </label>`
      : '';
    return `
      <div class="phonetic-item">
        <div style="display:flex; align-items:center; gap:0.5rem;">
          <span class="phonetic-text">${phonetic.text || ''}</span>
          ${audioButton}
        </div>
        ${toggleSwitch}
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
      audio.playbackRate = toggle && toggle.checked ? 0.5 : 1;
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

renderHistory();