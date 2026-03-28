function createAnonymousUsername() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `Guest${suffix}`;
}

module.exports = { createAnonymousUsername };
