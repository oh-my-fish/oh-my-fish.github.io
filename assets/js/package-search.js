/*
The MIT License (MIT) Copyright (c) 2016 Derek Willian Stavis

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

var typeNameRegex = /^(plugin|theme)-(.+)$/

class Progress extends React.Component {
  render() {
    return this.props.active
      ? <section className="1u loading">
          <span className="fa fa-circle-o-notch"></span>
        </section>
      : null
  }
}

class RepoType extends React.Component {
  render() {
    return this.props.type === 'theme'
      ? <a className="1u fa fa-terminal"><span></span></a>
      : <a className="1u fa fa-dropbox"><span></span></a>
  }
}

class RepoIcon extends React.Component {
  render() {
    return <div className="1u repo-icon">
      <a href={this.props.url || ''}>
        <span className={`fa ${this.props.name}`}></span>
      </a>
      <div className="title">{this.props.title}</div>
    </div>
  }
}

class Repository extends React.Component {
  render() {
    return <section className="row package">
      <RepoType type={this.props.repo.type} />
      <span className="9u">
        <h2>{this.props.repo.name}</h2>
        <p>{this.props.repo.description}</p>
      </span>
      <RepoIcon name="fa-github" title="Github" url={this.props.repo.url}/>
      <RepoIcon name="fa-star" title={this.props.repo.stars} />
    </section>
  }
}

class SearchInput extends React.Component {
  render() {
    return <input
      type="text"
      className="package-search"
      placeholder={`Search in ${this.props.repoCount} packages`}
      value={this.props.search}
      onChange={this.props.onChange}
    />
  }
}

class PackageSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = { repos: [], search: '', isFetching: true }
  }

  componentWillMount() {
    fetch("https://api.github.com/orgs/oh-my-fish/repos?per_page=100")
      .then(repos => repos.json())
      .then(repos => repos
        .filter(repo => typeNameRegex.test(repo.name))
        .map(repo => ({
          name: typeNameRegex.exec(repo.name)[2],
          description: repo.description,
          type: typeNameRegex.exec(repo.name)[1],
          stars: repo.stargazers_count,
          url: repo.html_url
        }))
      )
      .then(repos => this.setState({ repos: repos, isFetching: false }))
  }

  handleChange(event) {
    this.setState({ search: event.target.value })
  }

  results() {
    var { search, repos } = this.state
    return search
      ? new Fuse(repos, { keys: ['name'] }).search(search)
      : R.sortBy(R.prop('stars'), repos).reverse()
  }

  render() {
    return (
      <div id="content" className="container">
        <div className="row">
          <SearchInput
            value={this.state.search}
            repoCount={this.state.repos.length}
            onChange={this.handleChange.bind(this)} />
        </div>
        <div className="row">
          { <Progress active={this.state.isFetching} /> }
          { this.results().map(repo =>
              <Repository key={repo.name} repo={repo}/>) }
        </div>
      </div>
    )
  }

}

React.render(
  <PackageSearch />,
  document.getElementById('main')
);
