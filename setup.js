const fs = require('fs')

const packagesDir = `packages`

const update = (packages) => {
  for (const package in packages) {
    if (package.startsWith('@troovi')) {
      packages[package] = '*'
    }
  }
}

console.log('Setup GitHub Packages...')

fs.readdirSync(packagesDir).forEach((packageName) => {
  const packageDir = `${packagesDir}/${packageName}`
  const packagePath = `${packageDir}/package.json`

  if (fs.lstatSync(packageDir) && fs.existsSync(packagePath)) {
    const packageContent = JSON.parse(fs.readFileSync(packagePath, 'utf8'))

    update(packageContent.devDependencies)
    update(packageContent.dependencies)

    fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 2))
  }
})
