import React from 'react'

import Head from '@docusaurus/Head'
import AdrPaginator from '@theme/AdrPaginator'

import styles from './adr-item.module.css'

function Headings({ headings, isChild }) {
  if (!headings.length) return null
  return (
    <ul className={isChild ? '' : 'contents contents__left-border'}>
      {headings.map(heading => (
        <li key={heading.id}>
          <a href={`#${heading.id}`} className="contents__link">
            {heading.value}
          </a>
          <Headings isChild headings={heading.children} />
        </li>
      ))}
    </ul>
  )
}

function AdrItem(props) {
  const { metadata, content: AdrContent, adrsMetadata } = props

  return (
    <div>
      <Head>
        {metadata && metadata.title && <title>{metadata.title}</title>}
      </Head>
      <div className="padding-vert--lg">
        <div className="row">
          <div className="col">
            <div className={styles.adrItemContainer}>
              <header>
                <h1 className="margin-bottom--lg">{metadata.title}</h1>
              </header>
              <article>
                <div className="markdown">
                  <AdrContent />
                </div>
              </article>
              <div className="margin-top--xl margin-bottom--lg">
                <AdrPaginator adrsMetadata={adrsMetadata} metadata={metadata} />
              </div>
            </div>
          </div>
          {AdrContent.rightToc && (
            <div className="col col--3">
              <div className={styles.tableOfContents}>
                <Headings headings={AdrContent.rightToc} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdrItem
