const emojiPromise = fetch('/emoji.json').then(r => r.json());

async function main() {
  const emoji = await emojiPromise;
  const { bannerElement, searchInput, searchForm, resultElement } = getElements(document);
  const [ getState, setState ] = useState({ topResult: false, emoji, offset: 0 });
  const app = new App(getState, setState);
  boundOnSearchKeyup = onSearchKeyup.bind(null, resultElement, app, searchInput);
  boundOnSearchKeyup();
  const moveDown = () => setState({ offset: getState().offset + 1 })
  const moveUp = () => setState({ offset: getState().offset - 1 })
  searchInput.addEventListener('keyup', onArrowKeys.bind(null, moveDown, moveUp));
  searchInput.addEventListener('keyup', boundOnSearchKeyup);
  searchForm.addEventListener('submit', onSubmit.bind(null, getState, bannerElement));
}

document.addEventListener('DOMContentLoaded', main);

function onArrowKeys(moveDown, moveUp, { key, preventDefault }) {
  switch (key) {
    case 'ArrowDown': return moveDown();
    case 'ArrowUp': return moveUp();
  }
}

function onSearchKeyup(resultElement, app, searchInput, event = {}) {
  render(resultElement, app, {
    maxResults: 50,
    query: preProcessQuery(searchInput)
  });
}

function onSubmit(getState, bannerElement) {
  const { topResult } = getState();
  if (!topResult) return;
  navigator.clipboard.writeText(topResult.emoji);
  bannerElement.innerHTML = `Copied '${topResult.emoji}' to the clipboard`;
}

function preProcessQuery(searchInput) {
  const defaultQuery = searchInput.getAttribute('placeholder');
  return searchInput.value.length > 0
    ? searchInput.value.trim()
    : defaultQuery;
}

function getElements(document) {
  const bannerElement = document.querySelector('#banner');
  const searchInput = document.querySelector('#search');
  const searchForm = document.querySelector('#search_form');
  const resultElement = document.querySelector('#results');
  return { bannerElement, searchInput, searchForm, resultElement };
}

class App {
  constructor(getState, setState) {
    const { emoji } = getState();
    this.getState = getState;
    this.setState = setState;
    this.results = { '': emoji };
  }

  render({ maxResults, query }) {
    const results = this._getResultsForQueryAndUpdateCache(query);
    const { topResult, rest } = this._getResultParts(results);
    this.setState({ topResult });
    if (topResult) {
      return `
        <div class='top-result'>
          <h2 class='top-result__result'>${topResult.emoji} ${topResult.description}</h2>
          <div class='top-result__instructions'>(Enter/Submit to copy)</div>
        </div>

        ${rest.slice(1, 1 + maxResults).map(({ emoji, description }) => `<div> ${emoji} ${description}</div>`).join('\n')}
        ${rest.length > (1 + maxResults) ? `<div>(and ${rest.length - 1 - maxResults} more)</div>` : ''}
      `;
    } else {
      return `No results for ${query}`;
    }
  }

  _getResultParts(results) {
    const { offset } = this.getState();
    const index = offset % results.length;
    const topResult = results[index];
    const before = index > 0 ? results.slice(0, index) : [];
    const after = results.slice(index + 1, -1);
    const spacer = { emoji: '&nbsp;', description: '&nbsp;' };
    return { topResult, rest: [...after, spacer, ...before] };
  }

  _getResultsForQueryAndUpdateCache(query) {
    const { emoji } = this.getState();
    const bestGuess = this.results[query.slice(0,-1)] || emoji;
    const queryTerms = query.toLowerCase().split(' ');
    const filteredResults = this.results[query]
      || bestGuess.filter(({ description }) => queryTerms.every(term => description.toLowerCase().match(term)));
    this.results[query] = filteredResults;
    return filteredResults
  }
}

/** rudimentary "Framework" */

function render(element, component, props) {
  element.innerHTML = component.render(props);
}

function useState(initialState) {
  let state = { ...initialState };
  function getState() {
    return state;
  }
  function setState(newState) {
    state = { ...state, ...newState };
  }
  return [ getState, setState ];
}

