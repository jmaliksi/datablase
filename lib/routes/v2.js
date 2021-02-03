const Router = require('express-promise-router');

const { playerStats } = require('../controllers/stats.js');
const { player, players } = require('../controllers/players.js');
const { team, teams } = require('../controllers/teams.js');

const router = new Router();

/**
 * Get all teams for a given season. Defaults to current season.
 *
 * @route GET /teams
 * @group Teams
 * @group APIv2
 * @summary Get the list of all teams
 * @returns {[object]} 200 - list of teams
 */
router.get('/teams', async (req, res) => {
  let season;

  if (req.query.season !== undefined) {
    if (req.query.season === '' || req.query.season === 'current') {
      season = 'current';
    } else {
      season = Number(req.query.season);
    }
  }
  const result = await teams({ season });

  res.json(result);
});

/**
 * Get a single team's details for a given season. Defaults to current season.
 *
 * @route GET /teams/:teamId
 * @group Teams
 * @group APIv2
 * @summary Get a specific team's details
 * @returns {[object]} 200 - a team's details
 */
router.get('/teams/:teamId', async (req, res, next) => {
  const season = Number(req.query.season);
  const teamId = req.params.teamId;

  if (teamId === undefined) {
    const err = new Error('Required query param `teamId` missing');
    err.status = 400;
    next(err);
  }

  const result = await team({ season, teamId });

  res.json(result);
});

/**
 * Get a list of player details. Defaults to retrieving all players.
 *
 * @route GET /players
 * @group Players
 * @group APIv2
 * @summary Get the list of players
 * @returns {[object]} 200 - list of players
 */
router.get('/players', async (req, res) => {
  let season;

  if (req.query.season !== undefined) {
    if (req.query.season === '' || req.query.season === 'current') {
      season = 'current';
    } else {
      season = Number(req.query.season);
    }
  }

  const result = await players({ season });

  res.json(result);
});

/**
 * Get a player's details. Defaults to retrieving most recent record.
 *
 * @route GET /players/:playerIdOrSlug
 * @group Players
 * @group APIv2
 * @summary Get a player
 * @returns {[object]} 200 - player
 */
router.get('/players/:playerIdOrSlug', async (req, res) => {
  const playerIdOrSlug = req.params.playerIdOrSlug;

  if (playerIdOrSlug === undefined) {
    const err = new Error("Required query param 'playerIdOrSlug' missing.");
    err.status = 400;
    next(err);
  }

  // Attempt to retrieve player by the default 'player_id' field
  let result = await player(playerIdOrSlug);

  // If 'player_id' lookup returns null, attempt to find player by 'url_slug' field
  if (result === null) {
    result = await player(playerIdOrSlug, { findByField: 'url_slug' });
  }

  res.json(result);
});

/**
 * Get stats for players and teams.
 *
 * @route GET /stats
 * @group Stats
 * @group APIv2
 * @summary Get a list of stat splits
 * @returns {[object]} 200 - list of stat splits
 */
router.get('/stats', async (req, res, next) => {
  const {
    gameType,
    group,
    order,
    playerId,
    sortStat,
    teamId,
    type,
  } = req.query;
  const limit =
    req.query.limit !== undefined ? Number(req.query.limit) : undefined;
  const season =
    req.query.season !== undefined && isNaN(req.query.season)
      ? req.query.season
      : Number(req.query.season);

  if (group === undefined) {
    const err = new Error(
      "Required query param 'group' missing. Available groups: hitting, pitching."
    );
    err.status = 400;
    next(err);
  }

  if (type === undefined) {
    const err = new Error(
      'Required query param `type` missing. Available types: season.'
    );
    err.status = 400;
    next(err);
  }

  const result = await playerStats({
    gameType,
    group,
    limit,
    order,
    playerId,
    season,
    sortStat,
    teamId,
    type,
  });

  res.json(result);
});

module.exports = router;