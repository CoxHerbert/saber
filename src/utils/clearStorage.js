(function clearStorage() {
  const isClearStorage = localStorage.getItem('isClearStorage');
  if (!isClearStorage) {
    localStorage.clear();
    localStorage.setItem('isClearStorage', true);
  }
})();
