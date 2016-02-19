var RepoType = React.createClass({
  render: function() {
    switch (this.props.type) {
      case 'plugin':
       return <a className="1u fa fa-dropbox" href="#"><span>Package</span></a>
      case 'theme':
        return <a className="1u fa fa-terminal" href="#"><span>Prompt</span></a>
    }
  }
})

var PackageSearch = React.createClass({
  getInitialState() {
    return { repos: [], search: '' }
  },
  componentWillMount() {
    var root = this
    fetch("https://api.github.com/orgs/oh-my-fish/repos")
      .then(function (repos) {
        return repos.json()
      })
      .then(function (repos) {
        return repos
          .filter(function (repo) {
            return /^(plugin|theme)-.*$/.test(repo.name)
          })
          .map(function (repo) {
            return {
              name: repo.name,
              description: repo.description,
              type: /^(plugin|theme)-.*$/.exec(repo.name)[1],
              url: repo.html_url
            }
          })
      })
      .then(function (repos) {
        console.log(repos)
        root.setState({ repos: repos })
      })
  },
  handleChange: function(event) {
    this.setState({ search: event.target.value })
  },
  results: function() {
    var search = this.state.search, repos = this.state.repos
    return search
      ? new Fuse(repos, {keys: ['name']}).search(search)
      : repos
  },
  render: function() {
    return (
      <div id="content" className="container">
        <div className="row">
          <input
            type="text"
            className="package-search"
            placeholder="Search for packages"
            value={this.state.search}
            onChange={this.handleChange}
          />
        </div>
        {
          this.results().map(function (repo) {
            return (
              <div className="row">
                <section className="row package">
                  <span className="9u">
                    <h2>{repo.name}</h2>
                    <p>{repo.description}</p>
                  </span>
                  <RepoType type={repo.type} />
                  <a className="1u fa fa-github" href={repo.url}>
                    <span>Github</span>
                  </a>
                </section>
              </div>
            )
          })
        }
      </div>
    )
  }
});

React.render(
  <PackageSearch />,
  document.getElementById('main')
);
