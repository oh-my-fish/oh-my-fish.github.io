class Option extends React.Component {
  title() {
    var { long, short, dash = true } = this.props
    return long && short
      ? `${dash ? '--' : ''}${long} or ${dash ? '-' : ''}${short}`
      : long ? `${dash ? '--' : ''}${long}` : `${dash ? '-' : ''}${short}`
  }

  render() {
    var { description} = this.props
    return (
      <li><strong>{this.title()}:</strong> {description}</li>
    )
  }
}

class Command extends React.Component {
  subcommand() {
    var { long, short } = this.props
    return long && short
      ? `(${long}|${short})`
      : `${long || short}`
  }

  suboptions() {
    var { options = [] } = this.props
    var nodash = options.filter(opt => opt.dash === false).map(opt => opt.long)

    return nodash.length > 0
      ? nodash.length > 1
        ? `(${nodash.join('|')})`
        : `${nodash}`
      : ''
  }

  render() {
    var { description, command, arguments: args = [], options = [] } = this.props
    console.log('arguments is %s', args)
    return (
      <section className="row package">
        <header className="11u">
          <h2>
            <span className="command-command">
              {command}&nbsp;
            </span>
            <span className="command-subcommand">
              { this.subcommand() }&nbsp;
            </span>
            <span className="command-suboptions">
              { this.suboptions() }&nbsp;
            </span>
            { R.reject(R.isNil, args.map(arg =>
              arg.name ? `<${arg.name}>` : undefined)).join(' ') }
          </h2>
          <p>{description}</p>
        </header>
        <ul>
          { options.map(function (opt) {
              return <Option key={opt.long} {...opt} />}) }
        </ul>
      </section>
    )
  }
}

class CommandLineDocs extends React.Component {
  render() {
    var { source: { command, description, options, commands } } = this.props
    return (
      <section className="row package">
        <header className="11u">
          <h2>{command}</h2>
          <p>{description}</p>
        </header>
        { commands
            ? commands.map(function (cmd) {
                return <Command
                  key={cmd.long || cmd.short}
                  command={command}
                  { ...cmd }
                />
              })
            : null
        }
      </section>
    )
  }
}

class SearchInput extends React.Component {
  render() {
    return <input
      type="text"
      className="package-search"
      placeholder={`Search command line`}
      value={this.props.search}
      onChange={this.props.onChange}
    />
  }
}

class CommandLineSearch extends React.Component {
  constructor(props) {
    super(props)
    this.state = { source: null, isFetching: true }
  }

  componentWillMount() {
    fetch("/assets/js/cli-description.json")
      .then(docs => docs.json())
      .then(docs => { console.log(docs); return docs })
      .then(docs => this.setState({ source: docs, isFetching: false }))
  }

  handleChange(event) {
    this.setState({ search: event.target.value })
  }

  results() {
    var { search, source } = this.state
    var fuzzy = new Fuse(source.commands, {
      keys: ['description', 'long',
             'options.long', 'options.description',
             'arguments.name', 'arguments.description'],
      threshold: 0.6,
      distance: 2
    })
    return search
      ? R.assoc('commands', fuzzy.search(search), source)
      : source
  }

  render() {
    var { source } = this.state
    return source
      ? <section className="container cli-docs">
          <SearchInput
            search={this.state.search}
            onChange={this.handleChange.bind(this)}
          />
          <CommandLineDocs source={this.results()} />
        </section>
      : null
  }

}

ReactDOM.render(
  <CommandLineSearch />,
  document.getElementById('main')
);
