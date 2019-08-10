const fs = require('fs-extra')
const path = require('path')
const { parse, normalizeUrl } = require('@docusaurus/utils')

module.exports = async function processMetadata(
  source,
  docsDir,
  siteConfig,
  docsBasePath,
  siteDir,
) {
  const filepath = path.join(docsDir, source)

  const fileString = await fs.readFile(filepath, 'utf-8')
  const { frontMatter: metadata = {}, excerpt } = parse(fileString)

  // Default id is the file name.
  if (!metadata.id) {
    metadata.id = path.basename(source, path.extname(source))
  }

  if (metadata.id.includes('/')) {
    throw new Error('Document id cannot include "/".')
  }

  // Default title is the id.
  if (!metadata.title) {
    metadata.title = metadata.id
  }

  if (!metadata.description) {
    metadata.description = excerpt
  }

  const dirName = path.dirname(source)
  if (dirName !== '.') {
    const prefix = dirName
    if (prefix) {
      metadata.id = `${prefix}/${metadata.id}`
    }
  }

  // Cannot use path.join() as it resolves '../' and removes the '@site'. Let webpack loader resolve it.
  const aliasedPath = `@site/${path.relative(siteDir, filepath)}`
  metadata.source = aliasedPath

  // Build the permalink.
  const { baseUrl } = siteConfig

  // If user has own custom permalink defined in frontmatter
  // e.g: :baseUrl:docsUrl/:langPart/:versionPart/endiliey/:id
  if (metadata.permalink) {
    metadata.permalink = path.resolve(
      metadata.permalink
        .replace(/:baseUrl/, baseUrl)
        .replace(/:docsUrl/, docsBasePath)
        .replace(/:id/, metadata.id),
    )
  } else {
    metadata.permalink = normalizeUrl([baseUrl, docsBasePath, metadata.id])
  }
  metadata.sidebar = 'adrs'
  metadata.category = metadata.sidebar_category

  return metadata
}
