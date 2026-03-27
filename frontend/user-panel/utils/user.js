export function getUserId(user) {
  return user?._id || user?.id || "";
}

export function getUserKey(user, fallbackPrefix = "user", index = 0) {
  return getUserId(user) || user?.email || user?.username || `${fallbackPrefix}-${index}`;
}
