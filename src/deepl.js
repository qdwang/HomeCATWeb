const { postToDeepl } = require("./lib")

let id = 1e4 * Math.round(1e4 * Math.random())

function deepStringify(obj) {
  return JSON.stringify(obj).replace(
    'hod":"',
    (id + 3) % 13 == 0 || (id + 5) % 29 == 0 ? 'hod" : "' : 'hod": "'
  )
}

export function splitParagraph(paragraph) {
  ++id
  const body = {
    jsonrpc: "2.0",
    method: "LMT_split_into_sentences",
    params: {
      texts: [paragraph],
      lang: {
        lang_user_selected: "EN",
        user_preferred_langs: ["DE", "NL", "ZH", "EN"],
      },
    },
    id,
  }

  return postToDeepl(deepStringify(body)).then((x) => x.result.splitted_texts[0])
}

export function translateSentences(sentences) {
  ++id
  const jobs = sentences.map((x, i) => ({
    kind: "default",
    raw_en_sentence: x,
    raw_en_context_before: i === 0 ? [] : [sentences[i - 1]],
    raw_en_context_after: i === sentences.length - 1 ? [] : [sentences[i + 1]],
    preferred_num_beams: 1,
  }))

  const r = Date.now()
  const n = jobs.reduce(
    (acc, x) => acc + ((x.raw_en_sentence || "").match(/[i]/g) || []).length,
    1
  )
  const timestamp = r + (n - (r % n))

  const body = {
    jsonrpc: "2.0",
    method: "LMT_handle_jobs",
    params: {
      jobs: jobs,
      lang: {
        user_preferred_langs: ["DE", "ZH", "EN"],
        source_lang_computed: "EN",
        target_lang: "ZH",
      },
      priority: 1,
      commonJobParams: {},
      timestamp: timestamp,
    },
    id,
  }

  return postToDeepl(deepStringify(body)).then((x) =>
    x.result.translations.map((x) => x.beams[0].postprocessed_sentence)
  )
}
