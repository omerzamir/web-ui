const getters = {
  isLogged: state => state.user !== null,
  isFiles: state => !state.loading && state.route.name === 'Files',
  isListing: (state, getters) => getters.isFiles && !!state.req.isDir,
  isEditor: (state, getters) => getters.isFiles && (state.req.type === 'text' || state.req.type === 'textImmutable'),
  isActiveDialog: state => !!state.show,
  selectedCount: state => state.selected.length,
  currentFolder: state => state.path[state.path.length - 1] || { id: '', name: '' },
  shares: state => state.shares,
}

export default getters
