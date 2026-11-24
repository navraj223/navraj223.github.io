const themeToggle = document.querySelector("[data-theme-toggle]");

if (themeToggle) {
  const themeKey = "portfolio-theme";

  function applyTheme(light) {
    document.documentElement.dataset.theme = light ? "light" : "dark";
    themeToggle.setAttribute("aria-pressed", String(light));
  }

  try {
    applyTheme(window.localStorage.getItem(themeKey) === "light");
  } catch {
    applyTheme(false);
  }

  themeToggle.hidden = false;
  themeToggle.addEventListener("click", () => {
    const light = themeToggle.getAttribute("aria-pressed") !== "true";
    applyTheme(light);

    try {
      window.localStorage.setItem(themeKey, light ? "light" : "dark");
    } catch {
      // The theme still applies when browser storage is unavailable.
    }
  });
}

const resumePanel = document.querySelector(".resume-panel");

if (resumePanel) {
  function openResumePanel() {
    resumePanel.open = true;
  }

  document.querySelector('a[href="#resume"]').addEventListener("click", openResumePanel);
  window.addEventListener("hashchange", () => {
    if (window.location.hash === "#resume") openResumePanel();
  });

  if (window.location.hash === "#resume") openResumePanel();
}

const scoresBoard = document.querySelector("[data-scores-board]");
const scoresStatus = document.querySelector("[data-scores-status]");
const scoresRefresh = document.querySelector("[data-refresh-scores]");
const scoresUrl = "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard";
const dateFormat = new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeZone: "UTC" });
const timeFormat = new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" });

function element(tag, className, content) {
  const node = document.createElement(tag);
  node.className = className;
  if (content !== undefined) node.textContent = content;
  return node;
}

function renderTeam(competitor, gameState) {
  const { team, records, score, winner } = competitor;
  const row = element("div", winner ? "score-line is-leading" : "score-line");
  const name = element("div", "score-team");

  name.append(element("span", "team-name", team.displayName));
  const record = records?.find(({ type }) => type === "total");
  if (record?.summary) name.append(element("span", "team-record", record.summary));

  const points = gameState === "pre" || score == null ? "\u2014" : score;
  row.append(name, element("strong", "team-score", points));
  return row;
}

function renderGame(game) {
  const competition = game.competitions?.[0];
  const home = competition?.competitors?.find(({ homeAway }) => homeAway === "home");
  const away = competition?.competitors?.find(({ homeAway }) => homeAway === "away");
  const status = competition?.status?.type ?? game.status?.type;
  if (!home?.team || !away?.team || !status) return null;

  const card = element("article", status.state === "in" ? "score-card score-card-live" : "score-card");
  const header = element("div", "score-matchup");
  const title = game.shortName || `${away.team.abbreviation} at ${home.team.abbreviation}`;
  header.append(
    element("h2", "score-title", title),
    element("p", "score-period", status.shortDetail || status.description),
  );
  card.append(header, renderTeam(away, status.state), renderTeam(home, status.state));

  const note = competition.notes?.[0]?.headline;
  if (note) card.append(element("p", "score-note", note));
  return card;
}

let lastUpdated = "";

async function loadScores() {
  if (scoresRefresh.disabled) return;
  scoresRefresh.disabled = true;

  try {
    const response = await fetch(scoresUrl, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok) throw new Error(`Score request failed with ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data.events)) throw new Error("Invalid scoreboard response");

    const games = data.events.map(renderGame).filter(Boolean);
    if (data.events.length && !games.length) throw new Error("Invalid game data");

    const date = new Date(data.day?.date);
    const day = Number.isNaN(date.valueOf()) ? "Today's games" : dateFormat.format(date);
    const gameCount = `${games.length} ${games.length === 1 ? "game" : "games"}`;
    lastUpdated = timeFormat.format(new Date());
    scoresStatus.textContent = `${day} / ${gameCount} / Updated ${lastUpdated}`;
    scoresBoard.replaceChildren(
      ...(games.length ? games : [element("p", "score-copy", "No games scheduled.")]),
    );
  } catch {
    scoresStatus.textContent = lastUpdated
      ? `Refresh failed. Showing scores from ${lastUpdated}.`
      : "Scores are temporarily unavailable.";
  } finally {
    scoresRefresh.disabled = false;
  }
}

if (scoresBoard && scoresStatus && scoresRefresh) {
  scoresRefresh.addEventListener("click", loadScores);
  loadScores();
  window.setInterval(() => {
    if (!document.hidden) loadScores();
  }, 120000);
}
