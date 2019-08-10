const path = require('path')
const { getOptions } = require('loader-utils')
const { resolve } = require('url')

module.exports = async function(fileString) {
  const callback = this.async()
  const options = Object.assign({}, getOptions(this), {
    filepath: this.resourcePath,
  })
  const { adrsDir, siteDir, sourceToPermalink } = options

  // Determine the source dir. e.g: /docs, /website/versioned_docs/version-1.0.0
  let sourceDir
  const thisSource = this.resourcePath
  if (thisSource.startsWith(adrsDir)) {
    sourceDir = adrsDir
  }

  let content = fileString

  // Replace internal markdown linking (except in fenced blocks).
  if (sourceDir) {
    let fencedBlock = false
    const lines = content.split('\n').map(line => {
      if (line.trim().startsWith('```')) {
        fencedBlock = !fencedBlock
      }
      if (fencedBlock) return line

      let modifiedLine = line
      // Replace inline-style links or reference-style links e.g:
      // This is [Document 1](doc1.md) -> we replace this doc1.md with correct link
      // [doc1]: doc1.md -> we replace this doc1.md with correct link
      const mdRegex = /(?:(?:\]\()|(?:\]:\s?))(?!https)([^'")\]\s>]+\.mdx?)/g
      let mdMatch = mdRegex.exec(modifiedLine)
      while (mdMatch !== null) {
        // Replace it to correct html link.
        const mdLink = mdMatch[1]
        const targetSource = `${sourceDir}/${mdLink}`
        const aliasedSource = source =>
          `@site/${path.relative(siteDir, source)}`
        const permalink =
          sourceToPermalink[aliasedSource(resolve(thisSource, mdLink))] ||
          sourceToPermalink[aliasedSource(targetSource)]
        if (permalink) {
          modifiedLine = modifiedLine.replace(mdLink, permalink)
        }
        mdMatch = mdRegex.exec(modifiedLine)
      }
      return modifiedLine
    })
    content = lines.join('\n')
  }

  return callback(null, content)
}
