const globby = require('globby')
const fs = require('fs-extra')
const path = require('path')
const { idx, normalizeUrl, docuHash } = require('@docusaurus/utils')

const createSidebar = require('./sidebar')
const processMetadata = require('./metadata')

const DEFAULT_OPTIONS = {
  path: 'adrs',
  routeBasePath: 'adrs',
  include: [
    '**/*.md',
    '**/*.mdx',
    '!**/template.md',
    '!**/template.mdx',
    '!**/index.md',
    '!**/index.mdx',
  ],
  docLayoutComponent: '@theme/DocLegacyPage',
  docItemComponent: '@theme/DocLegacyItem',
  remarkPlugins: [],
  rehypePlugins: [],
}

module.exports = function(context, opts) {
  const options = { ...DEFAULT_OPTIONS, ...opts }
  const contentPath = path.resolve(context.siteDir, options.path)
  let globalContents = {}

  return {
    name: 'docusaurus-plugin-content-adrs',

    contentPath,

    getPathsToWatch() {
      const { include = [] } = options
      const globPattern = include.map(pattern => `${contentPath}/${pattern}`)
      return [...globPattern, options.sidebarPath]
    },

    // Fetches adr contents and returns metadata for the contents.
    async loadContent() {
      const { include, routeBasePath, sidebarPath } = options
      const { siteConfig, siteDir } = context
      const adrsDir = contentPath

      if (!fs.existsSync(adrsDir)) {
        fs.copySync(path.resolve(__dirname, './template'), adrsDir)
      }

      // Prepare metadata container.
      let adrs = {}

      // Metadata for default adrs files.
      const adrsFiles = await globby(include, {
        cwd: adrsDir,
      })

      await Promise.all(
        adrsFiles.map(async source => {
          const metadata = await processMetadata(
            source,
            adrsDir,
            siteConfig,
            routeBasePath,
            siteDir,
          )
          adrs[metadata.id] = metadata
        }),
      )
      const adrsSidebars = createSidebar(adrs)
      // Get the titles of the previous and next ids so that we can use them.
      Object.keys(adrs).forEach(currentID => {
        const previousID = idx(adrs, [currentID, 'previous'])
        if (previousID) {
          const previousTitle = idx(adrs, [previousID, 'title'])
          adrs[currentID].previous_title = previousTitle || 'Previous'
        }
        const nextID = idx(adrs, [currentID, 'next'])
        if (nextID) {
          const nextTitle = idx(adrs, [nextID, 'title'])
          adrs[currentID].next_title = nextTitle || 'Next'
        }
      })

      const sourceToPermalink = {}
      const permalinkToId = {}
      Object.values(adrs).forEach(({ id, source, permalink }) => {
        sourceToPermalink[source] = permalink
        permalinkToId[permalink] = id
      })

      globalContents = {
        docs: adrs,
        docsDir: adrsDir,
        docsSidebars: adrsSidebars,
        sourceToPermalink,
        permalinkToId,
      }

      return globalContents
    },

    async contentLoaded({ content, actions }) {
      if (!content) {
        return
      }

      const { docLayoutComponent, docItemComponent, routeBasePath } = options
      const { addRoute, createData } = actions

      const routes = await Promise.all(
        Object.values(content.docs).map(async metadataItem => {
          const metadataPath = await createData(
            `${docuHash(metadataItem.permalink)}.json`,
            JSON.stringify(metadataItem, null, 2),
          )
          return {
            path: metadataItem.permalink,
            component: docItemComponent,
            exact: true,
            modules: {
              content: metadataItem.source,
              metadata: metadataPath,
            },
          }
        }),
      )

      const adrsBaseRoute = normalizeUrl([
        context.siteConfig.baseUrl,
        routeBasePath,
      ])
      const adrsMetadataPath = await createData(
        `${docuHash(adrsBaseRoute)}.json`,
        JSON.stringify(content, null, 2),
      )

      addRoute({
        path: adrsBaseRoute,
        component: docLayoutComponent,
        routes,
        modules: {
          docsMetadata: adrsMetadataPath,
        },
      })
    },

    configureWebpack(config, isServer, { getBabelLoader, getCacheLoader }) {
      const { rehypePlugins, remarkPlugins } = options
      return {
        module: {
          rules: [
            {
              test: /(\.mdx?)$/,
              include: [contentPath],
              use: [
                getCacheLoader(isServer),
                getBabelLoader(isServer),
                {
                  loader: '@docusaurus/mdx-loader',
                  options: {
                    remarkPlugins,
                    rehypePlugins,
                  },
                },
                {
                  loader: path.resolve(__dirname, './markdown/index.js'),
                  options: {
                    siteConfig: context.siteConfig,
                    siteDir: context.siteDir,
                    adrDir: globalContents.adrDir,
                    sourceToPermalink: globalContents.sourceToPermalink,
                  },
                },
              ].filter(Boolean),
            },
          ],
        },
      }
    },
  }
}
