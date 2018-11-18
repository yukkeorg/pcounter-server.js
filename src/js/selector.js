'use strict'

module.exports = function $(query, element) {
  if(!element) element = document
  return element.querySelector(query)
}
