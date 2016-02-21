class Option extends React.Component {
  title() {
    var { long, short, dash = true } = this.props
    return long && short
      ? `${dash ? '--' : ''}${long}, ${dash ? '-' : ''}${short}`
      : long ? `${dash ? '--' : ''}${long}` : `${dash ? '-' : ''}${short}`
  }

  render() {
    var { description} = this.props
    return (
      <tr>
        <td>
          <strong>{this.title()}</strong>
        </td>
        <td>
          {description}
        </td>
      </tr>
    )
  }
}

class Argument extends React.Component {
  title() {
    var { name } = this.props
    return R.isEmpty(name) ? `no arguments` : `${name}`
  }

  render() {
    var { name, description, optional  = true } = this.props
    return (
      <tr>
        <td>
          <strong>
            {this.title()}
          </strong>&nbsp;
        </td>
        <td>
          {description}&nbsp;
          {optional && !R.isEmpty(name) ? '(optional)' : null}
        </td>
      </tr>
    )
  }
}

class Command extends React.Component {
  subcommand() {
    var { long, short } = this.props
    return long && short
      ? `(${long} | ${short})`
      : `${long || short}`
  }

  suboptions() {
    var { options = [] } = this.props
    var nodash = options.filter(opt => opt.dash === false).map(opt => opt.long)

    return nodash.length > 0
      ? nodash.length > 1
        ? `(${nodash.join(' | ')})`
        : `${nodash}`
      : ''
  }

  options() {
    var { options = [] } = this.props
    var dashed = options
      .filter(opt => opt.dash !== false)
      .map(opt => `--${opt.long}`)

    return dashed.length > 0
      ? dashed.length > 1
        ? `[${dashed.join(' | ')}]`
        : `${dashed}`
      : ''
  }

  arguments() {
    var { arguments: args = [] } = this.props
    return R.compose(R.join(' '), R.reject(R.isNil))(
      args.map(arg => {
        return (
          arg.name
            ? (arg.optional === false
                ? `<${arg.name}>`
                : `[${arg.name}]`)
              +
              (arg.repeating === true
                ? '...'
                : '')
            : undefined
        )
      })
    )
  }

  tableTitle(title) {
    return (
      <tr>
        <td className="title" colSpan="2">Options</td>
      </tr>
    )
  }

  render() {
    var { description, command, arguments: args = [], options = [] } = this.props
    console.log('arguments is %s', args)
    return (
      <section className="row package">
        <header className="11u">
          <h3>
            <span className="command-command">
              {command}&nbsp;
            </span>
            <span className="command-subcommand">
              { this.subcommand() }&nbsp;
            </span>
            <span className="command-suboptions">
              { this.suboptions() }&nbsp;
            </span>
            <span className="command-options">
              { this.options() }&nbsp;
            </span>
            <span className="command-arguments">
              { this.arguments() }
            </span>
          </h3>
          <p>{description}</p>
        </header>
        <div className="command-options-arguments">
          <table>
            <tbody>
              { options && options.length > 0
                  ? this.tableTitle('Options')
                  : null }
              { options && options.length > 0
                  ? options.map(function (opt) {
                    return <Option key={opt.long} {...opt} />})
                    : null }
              { args && args.length > 0
                  ? this.tableTitle('Arguments')
                  : null }
              { args && args.length > 0
                  ? args.map(function (arg) {
                    return <Argument key={arg.name} {...arg} />})
                  : null }
            </tbody>
          </table>
        </div>
      </section>
    )
  }
}

class CommandLineDocs extends React.Component {
  render() {
    var { source: {
      command,
      tagline,
      description,
      options,
      commands
    } } = this.props

    return (
      <section className="row package">
        <header className="11u">
          <h2>{command} -- {tagline}</h2>
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
      distance: 200
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
