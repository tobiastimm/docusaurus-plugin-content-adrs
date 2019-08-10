import React from 'react'
import { MDXProvider } from '@mdx-js/react'

import renderRoutes from '@docusaurus/renderRoutes'
import Layout from '@theme/Layout'
import AdrSidebar from '@theme/AdrSidebar'
import MDXComponents from '@theme/MDXComponents'

function AdrPage(props) {
  const { route, adrsMetadata, location } = props
  const { permalinkToId } = adrsMetadata
  const id =
    permalinkToId[location.pathname] ||
    permalinkToId[location.pathname.replace(/\/$/, '')]
  const metadata = adrsMetadata.adrs[id] || {}
  const { sidebar, description, title, permalink, image } = metadata
  return (
    <Layout
      noFooter
      description={description}
      title={title}
      image={image}
      permalink={permalink}
    >
      <div className="container container--fluid">
        <div className="row">
          <div className="col col--3">
            <AdrSidebar adrsMetadata={adrsMetadata} sidebar={sidebar} />
          </div>
          <main className="col">
            <MDXProvider components={MDXComponents}>
              {renderRoutes(route.routes, { adrsMetadata })}
            </MDXProvider>
          </main>
        </div>
      </div>
    </Layout>
  )
}

export default AdrPage
