const path = require('path')
const pluginContentAdrs = require('../index')
const fs = require('fs-extra')
const os = require('os')

let TEST_DIR = ''

describe('loadAdrs', () => {
  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'docusaraus-plugin-content-adrs')
    fs.emptyDir(TEST_DIR, done)
  })

  afterEach(done => fs.remove(TEST_DIR, done))

  test('simple website', async () => {
    const siteDir = path.join(TEST_DIR, 'website')
    const siteConfig = {
      title: 'Hello',
      baseUrl: '/',
      url: 'https://docusaurus.io',
    }
    const pluginPath = 'adrs'
    const plugin = pluginContentAdrs(
      {
        siteDir,
        siteConfig,
      },
      {
        path: 'adrs',
      },
    )
    const { adrs: adrsMetadata } = await plugin.loadContent()
    expect(adrsMetadata.hello).toEqual({
      category: 'Guides',
      id: 'hello',
      permalink: '/adrs/hello',
      previous: 'foo/baz',
      previous_title: 'baz',
      sidebar: 'adrs',
      source: path.join('@site', pluginPath, 'hello.md'),
      title: 'Hello, World !',
      description: `Hi, Endilie here :)`,
    })

    expect(adrsMetadata['foo/bar']).toEqual({
      category: 'Test',
      id: 'foo/bar',
      next: 'foo/baz',
      next_title: 'baz',
      permalink: '/adrs/foo/bar',
      sidebar: 'adrs',
      source: path.join('@site', pluginPath, 'foo', 'bar.md'),
      title: 'Bar',
      description: 'This is custom description',
    })
  })
})
