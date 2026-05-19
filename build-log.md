# Build Log

## Day 1

- interface design
- tested API

## Day 2

- setup github repository for pronunciation tool project
- create personal access token fix https clone problem
- try vscode AI code helper, create index.html and script.js
- using ai to install node for me

## Next

- 逆向理解已有代码
- test/debug webpage

## Day 3

- understand fetch(), usage of response object
- add playback audio function

## Learned Today

- How fetch returns a Response object
- How to parse JSON from response
- How Audio playback works in browser

## Next

- slow option,playback audio using 0.75 speed

## Day 4

- Added slow playback option for pronunciation audio.
- Set slow playback to 0.5x after testing 0.75x and finding it still too fast.
- Practiced clarifying feature requirements with AI when the first implementation placed the toggle in the wrong location.

## learned today

- Learned that the browser Audio object has a `playbackRate` property.
- learned how to precisely describe you need, here is a template

```
I want to add a slow playback option.

Current behavior:
- The app lets users search for a word.
- If the API returns an audio URL, the page shows a play button/icon next to the pronunciation.

Expected behavior:
- Only show the slow playback option after a successful search result.
- Only show it if this word has an audio URL.
- Place the slow playback checkbox/toggle next to the play button/icon.
- If the toggle is selected, play the audio at 0.5x speed.
- If it is not selected, play at normal speed.

Do not:
- Do not show the slow playback option before the user searches.
- Do not show it under the main search box.
- Do not show it if no audio is available.

Please make the smallest possible code change.
```

## Next

- implement the search history feature
- adjust the location of slow play toggle swich

## Day 5

- add search history feature
- learned how to use localStorage

## Next

- adjust the location of slow play toggle swich
- slow play using toggle swich instead of checkbox

## Day 6

- slow play using toggle swich
- phonetic text and audio button in one line, and the slow play in the line below

## learned today

- how to interactive with AI agent
- commit immediatly after finish a feature, so you can rollback when AI messed up
- ask agent do not modify existing functions, especially after you write/modified code manually.
- example:

```
Do not modify existing playback speed behavior.
Keep the current 0.5x implementation unchanged.
Only add search history functionality.
```

- write note or comments to share intetional decisions with AI and others
- using feature brachs in the future

## Intentional Decisions

- Slow playback fixed at 0.5x
- Slow toggle only appears when audio exists

## Next

- add mouth gif to show how to pronouce

## Day 7

- add mouth shape feature
- there are three different ways to implement, chose the quick and simply way

## learnd today

- using only if
- using do not modify exist function/feature to limit the AI change region

## Next

- update the mouth shape image/match words
