const { asyncHandler } = require("../utils/asyncHandler");
const socialService = require("../services/socialService");

const listFriends = asyncHandler(async (req, res) => {
  const friends = await socialService.listFriends(req.user.id);
  res.json({ friends });
});

const sendFriendRequest = asyncHandler(async (req, res) => {
  const result = await socialService.sendFriendRequest(req.user.id, req.body.targetUserId);
  res.json(result);
});

const listFriendRequests = asyncHandler(async (req, res) => {
  const requests = await socialService.listFriendRequests(req.user.id);
  res.json({ requests });
});

const listFavorites = asyncHandler(async (req, res) => {
  const favorites = await socialService.listFavorites(req.user.id);
  res.json({ favorites });
});

const toggleFavorite = asyncHandler(async (req, res) => {
  const result = await socialService.toggleFavorite(req.user.id, req.body.targetUserId);
  res.json(result);
});

const listHistory = asyncHandler(async (req, res) => {
  const history = await socialService.listHistory(req.user.id);
  res.json({ history });
});

const listDiscoverableUsers = asyncHandler(async (req, res) => {
  const users = await socialService.listDiscoverableUsers(req.user.id, {
    search: req.query.search
  });
  res.json({ users });
});

module.exports = {
  listFriends,
  sendFriendRequest,
  listFriendRequests,
  listFavorites,
  toggleFavorite,
  listHistory,
  listDiscoverableUsers
};
