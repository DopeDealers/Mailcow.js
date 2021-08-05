function isURL(string) {
    // eslint-disable-next-line no-new
    try { new URL(string) } catch { return false }
    return true;
  }

module.exports = isURL;