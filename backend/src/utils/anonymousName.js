function createAnonymousUsername() {
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `Stranger${suffix}`;
}

module.exports = { createAnonymousUsername };

