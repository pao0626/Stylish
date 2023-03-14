function getOffset(currentPage = 0, listPerPage) {
  return (currentPage - 0) * listPerPage;
}

function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}

module.exports = {
  getOffset,
  emptyOrRows,
};
