const { extract } = require("@node-rs/jieba")

const wordsLst = "1234567890abcdefghijklmnopqrstuvwxyz"

function getWordsMapping(quickWords) {
  const result = {}
  quickWords.forEach(x => {
    result[x.key] = x.word
  })
  return result
}

function genKey(quickWords) {
  const usedKeys = new Set(quickWords.map(x => x.key))

  for (let i = 0; i < wordsLst.length; i++) {
    const key = wordsLst[i]
    if (!usedKeys.has(key))
      return key
  }

  for (let i = 0; i < wordsLst.length; i++) {
    for (let j = 0; j < wordsLst.length; j++) {
      const key = wordsLst[i] + wordsLst[j]
      if (!usedKeys.has(key))
        return key
    }
  }
}

export function getTopWords(content, topn = 10) {
  const words = extract(content, topn)
  const result = []
  Object.values(words).forEach(x => {
    const key = genKey(result)
    result.push({
      key,
      word: x.keyword
    })
  })
  return result
}

export function moveToNext(divs, e) {
  if (!e.ctrlKey || e.keyCode !== 13)
    return;

  e.preventDefault()
  
  for (let i = 0; i < divs.length; i++) {
    if (e.target === divs[i] && i < divs.length - 1) {
      divs[i + 1].focus()
      break
    }
  }
}

export function createNewQuickWord(quickWords, e) {
  if (!e.ctrlKey || e.keyCode !== 78)
    return;

  e.preventDefault()

  const textdiv = e.target
  const selRange = window.getSelection()
  const content = textdiv.innerText.slice(
    Math.min(selRange.anchorOffset, selRange.focusOffset),
    Math.max(selRange.anchorOffset, selRange.focusOffset)
  ).trim()

  const contents = new Set(quickWords.map(x => x.word))
  if (content && !contents.has(content))
    quickWords.push({ key: genKey(quickWords), word: content })
}

export function setQuickWord(quickWords, e) {
  if (e.keyCode !== 9)
    return;

  e.preventDefault()

  const wordsMapping = getWordsMapping(quickWords)

  const textdiv = e.target
  const selRange = window.getSelection()
  const content = textdiv.innerText.slice(0, selRange.anchorOffset)
  const pattern = content.match(/\w+$/)
  if (pattern) {
    const offset = pattern[0].length
    const word = wordsMapping[pattern[0]]
    if (!word)
      return;

    const pos = selRange.anchorOffset - offset + word.length
    textdiv.innerText =
      textdiv.innerText.slice(0, selRange.anchorOffset - offset) +
      word +
      textdiv.innerText.slice(selRange.anchorOffset)

    const range = document.createRange()
    range.setStart(textdiv.childNodes[0], pos)
    range.setEnd(textdiv.childNodes[0], pos)
    selRange.removeAllRanges()
    selRange.addRange(range)
  }
}