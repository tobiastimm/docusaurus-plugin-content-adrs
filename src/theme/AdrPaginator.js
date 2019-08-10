import React from 'react'
import Link from '@docusaurus/Link'

function AdrPaginator(props) {
  const {
    adrsMetadata: { adrs },
    metadata,
  } = props

  return (
    <nav className="pagination-nav">
      <div className="pagination-nav__item">
        {metadata.previous && adrs[metadata.previous] && (
          <Link
            className="pagination-nav__link"
            to={adrs[metadata.previous].permalink}
          >
            <h5 className="pagination-nav__link--sublabel">Previous</h5>
            <h4 className="pagination-nav__link--label">
              &laquo; {metadata.previous_title}
            </h4>
          </Link>
        )}
      </div>
      <div className="pagination-nav__item pagination-nav__item--next">
        {metadata.next && adrs[metadata.next] && (
          <Link
            className="pagination-nav__link"
            to={adrs[metadata.next].permalink}
          >
            <h5 className="pagination-nav__link--sublabel">Next</h5>
            <h4 className="pagination-nav__link--label">
              {metadata.next_title} &raquo;
            </h4>
          </Link>
        )}
      </div>
    </nav>
  )
}

export default AdrPaginator
