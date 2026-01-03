const fs = require('fs')

const packagesDir = `packages`
const iconsDir = `icons`

const updateLocalNames = (packages) => {
  for (const package in packages) {
    if (package.startsWith('@companix')) {
      packages[package] = '*'
    }
  }
}

const updatePackage = (path, mutate) => {
  const packageContent = JSON.parse(fs.readFileSync(path, 'utf8'))
  mutate(packageContent)
  fs.writeFileSync(path, JSON.stringify(packageContent, null, 2))
}

console.log('Shake local dependencies...')
fs.readdirSync(packagesDir).forEach((packageName) => {
  const packagePath = `${packagesDir}/${packageName}/package.json`

  if (fs.existsSync(packagePath)) {
    updatePackage(packagePath, (packageContent) => {
      updateLocalNames(packageContent.devDependencies)
      updateLocalNames(packageContent.dependencies)
    })
  }
})

console.log('Set declaration path...')
;[packagesDir, iconsDir].forEach((directory) => {
  fs.readdirSync(directory).forEach((packageName) => {
    const packagePath = `${directory}/${packageName}/package.json`

    if (fs.existsSync(packagePath)) {
      updatePackage(packagePath, (packageContent) => {
        packageContent.types = './dist/index.d.ts'
      })
    }
  })
})
