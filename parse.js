const debug = require('debug')('butter-streamer:parse')

const sepMap = {
  '\'': '\'',
  '"': '"',
  '{': '}',
  '[': ']',
  '(': ')',
  '': ''
}

const parseArgs = (uri) => {
  const [name, ...args] = uri.split('?')
  const parsed = { name }

  if (args) {
    args.join('?').split('&').map(arg => {
      let osep, csep
      try {
        ;[ , osep = '' ] = arg.match(/=(.?)/)
        csep = sepMap[osep]
        const [ , key, value ] = arg.match(new RegExp(`([^=]+)=\\${osep}(.*)\\${csep}`))

        switch (osep) {
          case '\'':
          case '"':
            parsed[key] = value
            break
          case '{':
          case '[':
          default:
            parsed[key] = JSON.parse(`${osep}${value}${csep}`)
        }
      } catch (e) {
        debug('ERROR: could not parse malformed arg: "', arg, '",',
          osep, csep, ', skipping, error was:', e)
      }
    })
  }

  debug('parsed', uri, parsed)
  return parsed
}

module.exports = parseArgs
