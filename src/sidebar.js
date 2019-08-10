function getCategory(sidebar, categoryName) {
  const category = sidebar.find(entry => entry.label === categoryName)
  if (!category) {
    return {
      type: 'category',
      label: categoryName,
      items: [],
    }
  }
  return category
}

function addEntry(sidebar, adr) {
  const entry = {
    type: 'doc',
    id: adr.id,
    label: adr.title,
  }

  if (adr.sidebar_category) {
    const category = getCategory(sidebar, adr.sidebar_category)
    category.items.push(entry)
    sidebar.push(category)
  } else {
    sidebar.push(entry)
  }
}

module.exports = function createSidebar(adrs = {}) {
  let sidebar = []
  Object.keys(adrs).forEach(key => {
    const adr = adrs[key]
    addEntry(sidebar, adr)
  })
  return { adrs: sidebar }
}
