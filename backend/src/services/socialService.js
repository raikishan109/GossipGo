const User = require("../models/User");
const { listEndedChatsForUser } = require("./chatService");
const { HttpError } = require("../utils/httpError");

async function getUserByIdOrThrow(userId, query = User.findById(userId)) {
  const user = await query;

  if (!user) {
    throw new HttpError(404, "User not found.");
  }

  return user;
}

function hasRelationship(items, targetUserId) {
  return items.some((item) => item.toString() === targetUserId);
}

async function listFriends(userId) {
  const user = await getUserByIdOrThrow(
    userId,
    User.findById(userId).populate("friends", "username avatar status lastSeenAt")
  );

  return user.friends;
}

async function sendFriendRequest(senderId, targetUserId) {
  if (senderId === targetUserId) {
    throw new HttpError(400, "Cannot friend yourself.");
  }

  const [sender, receiver] = await Promise.all([
    getUserByIdOrThrow(senderId),
    getUserByIdOrThrow(targetUserId)
  ]);

  if (hasRelationship(sender.friends, targetUserId)) {
    throw new HttpError(400, "Already friends.");
  }

  const existingRequest = sender.friendRequests.find(
    (request) => request.user.toString() === targetUserId
  );

  if (existingRequest) {
    if (existingRequest.type === "received") {
      sender.friends.push(targetUserId);
      receiver.friends.push(senderId);
      sender.friendRequests = sender.friendRequests.filter(
        (request) => request.user.toString() !== targetUserId
      );
      receiver.friendRequests = receiver.friendRequests.filter(
        (request) => request.user.toString() !== senderId
      );
      await Promise.all([sender.save(), receiver.save()]);

      return { message: "Friend request accepted." };
    }

    throw new HttpError(400, "Request already sent.");
  }

  sender.friendRequests.push({ user: targetUserId, type: "sent" });
  receiver.friendRequests.push({ user: senderId, type: "received" });
  await Promise.all([sender.save(), receiver.save()]);

  return { message: "Friend request sent." };
}

async function listFriendRequests(userId) {
  const user = await getUserByIdOrThrow(
    userId,
    User.findById(userId).populate("friendRequests.user", "username avatar")
  );

  return user.friendRequests;
}

async function listFavorites(userId) {
  const user = await getUserByIdOrThrow(
    userId,
    User.findById(userId).populate("favorites", "username avatar status")
  );

  return user.favorites;
}

async function toggleFavorite(userId, targetUserId) {
  if (userId === targetUserId) {
    throw new HttpError(400, "Cannot favorite yourself.");
  }

  const user = await getUserByIdOrThrow(userId);

  if (hasRelationship(user.favorites, targetUserId)) {
    user.favorites = user.favorites.filter((id) => id.toString() !== targetUserId);
    await user.save();

    return { message: "Removed from favorites." };
  }

  await getUserByIdOrThrow(targetUserId);
  user.favorites.push(targetUserId);
  await user.save();

  return { message: "Added to favorites." };
}

async function listHistory(userId) {
  return listEndedChatsForUser(userId, { limit: 50 });
}

async function listDiscoverableUsers(userId) {
  const currentUser = await getUserByIdOrThrow(userId);

  return User.find({
    _id: { $nin: [...currentUser.friends, currentUser._id] },
    status: "active",
    role: "user"
  })
    .limit(20)
    .select("username avatar status lastSeenAt");
}

module.exports = {
  listFriends,
  sendFriendRequest,
  listFriendRequests,
  listFavorites,
  toggleFavorite,
  listHistory,
  listDiscoverableUsers
};
