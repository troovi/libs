const fs = require('fs')

const version = process.env.version
const package = process.argv[2]

if (version && package) {
  console.log(`@companix/${package}:`, version, 'upgrade')

  const packagePath = `./packages/${package}/package.json`

  if (!fs.existsSync(packagePath)) {
    console.log('package not exists:', package)
    console.log('')
    return
  }

  const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

  const currentVersion = packageContent.version

  const chunks = currentVersion.split('.')

  var [major, minor, patch] = [+chunks[0], +chunks[1], +chunks[2]]

  if (version === 'patch') {
    patch++
  }

  if (version === 'minor') {
    minor++
    patch = 0
  }

  if (version === 'major') {
    major++
    minor = 0
    patch = 0
  }

  const nextVersion = [major, minor, patch.toString().padStart(2, '0')].join('.')

  console.log('prev version:', currentVersion)
  console.log('next version:', nextVersion)
  console.log('')

  packageContent.version = nextVersion

  fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2))
} else {
  console.log('some params not provided:', { version, package })
}
