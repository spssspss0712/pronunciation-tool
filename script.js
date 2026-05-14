const form = document.getElementById('dictionary-form');
const wordInput = document.getElementById('word-search');
const resultEl = document.getElementById('result');

function renderPhonetics(phonetics) {
  if (!Array.isArray(phonetics) || phonetics.length === 0) {
    return '';
  }

  const phoneticsHtml = phonetics.map((phonetic) => {
    const audioButton = phonetic.audio
      ? `<button class="play-audio" data-audio="${phonetic.audio}" title="Play audio">🔊</button>`
      : '';
    return `
      <div class="phonetic-item">
        ${audioButton}
        <span class="phonetic-text">${phonetic.text || ''}</span>
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
      ${entry.phonetic ? `<p class="phonetic-primary">Pronunciation: ${entry.phonetic}</p>` : ''}
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

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  const word = wordInput.value.trim();

  if (!word) {
    showMessage('Please enter a word to search.', true);
    return;
  }

  showMessage('Searching...');

  try {
    const entries = await fetchWord(word);
    if (!Array.isArray(entries) || entries.length === 0) {
      showMessage(`No results found for "${word}".`, true);
      return;
    }

    resultEl.innerHTML = entries.map(renderDefinition).join('');
    
    // Add audio playback listeners
    document.querySelectorAll('.play-audio').forEach(button => {
      button.addEventListener('click', () => {
        const audioUrl = button.dataset.audio;
        const audio = new Audio(audioUrl);
        audio.play();
      });
    });
  } catch (error) {
    showMessage(error.message, true);
  }
});