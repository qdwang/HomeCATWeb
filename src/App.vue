<template>
  <div class="op-wrapper">
    <div class="parser">
      <textarea v-model="raw"></textarea>
      <button @click="parse(raw)">Parse</button>
    </div>
    <div class="output">
      <textarea v-model="output"></textarea>
      <button @click="generateOutput">Generate output</button>
    </div>
  </div>
  <div class="body-wrapper">
    <div class="quick-words">
      <div :key="key" v-for="({ key, word }, index) in quickWords">
        <input
          :value="key"
          @change="quickWords[index].key = $event.target.value"
        />
        <span @dblclick="quickWords.splice(index, 1)">{{ word }}</span>
      </div>
    </div>
    <div class="translation-blocks">
      <div :class="{block: true, focus: !!p.focus}" :key="index" v-for="(p, index) in paragraphs">
        <div :key="sentence" v-for="(sentence, i) in p.sentences">
          <div class="origin ez-read2">{{ sentence }}</div>
          <div
            :ref="x => textdiv.push(x)"
            class="textdiv ez-read3"
            @input="p.translations[i] = $event.target.innerText"
            @keydown="quickInput"
            @focus="p.focus = true"
            @blur="p.focus = false"
            contenteditable="true"
          >
            {{ p.translations[i] }}
          </div>
        </div>

        <!-- <div class="origin ez-read2">{{ p.origin }}</div>
        <div class="loading" v-if="p.loading">Loading...</div>
        <div
          class="textdiv ez-read3"
          @input="p.translation = $event.target.innerText"
          @keydown="quickInput"
          contenteditable="true"
        >
          {{ p.translation }}
        </div> -->
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue"
import { splitParagraph, translateSentences } from "./deepl.js"
import { getTopWords, createNewQuickWord, setQuickWord, moveToNext } from "./shortcut.js"

const raw = ref("")
const output = ref("")
const paragraphs = ref([])
const quickWords = ref([])
const textdiv = ref([])

function parse(content) {
  paragraphs.value = content
    .split(/\n+/g)
    .map((x) => x.trim())
    .filter((x) => x)
    .map((x) => ({
      origin: x,
      sentences: [],
      loading: true,
      focus: false,
      translations: [],
    }))

  Promise.all(
    paragraphs.value.map((item) => {
      return splitParagraph(item.origin)
        .then((x) => {
          item.sentences = x
          return translateSentences(x)
        })
        .then((x) => {
          item.translations = x
          item.translation = x.join("")
          return item.translation
        })
        .catch((x) => (item.translation = x))
        .finally(() => (item.loading = false))
    })
  ).then((translatedParagraphs) => {
    quickWords.value = getTopWords(translatedParagraphs.join("\n"))
  })
}

function generateOutput() {
  output.value = paragraphs.value.map((x) => x.translations.join('')).join("\n\n")
}

function quickInput(e) {
  createNewQuickWord(quickWords.value, e)
  setQuickWord(quickWords.value, e)
  moveToNext(textdiv.value, e)
}
</script>

<style>
@font-face {
  font-family: "Crimson Pro";
  src: url("./assets/CrimsonPro-Regular.woff2") format("woff2");
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}
* {outline: 0; caret-color: black;}
body {
  background: #eee;
}
.ez-read1 {
  background: rgb(237, 237, 237);
  color: rgb(38, 38, 38);
}
.ez-read2 {
  background: rgb(224, 224, 224);
  color: rgb(51, 51, 51);
}
.ez-read3 {
  background: rgb(205, 205, 205);
  color: rgb(0, 0, 0);
}
.origin {
  padding: 2px 8px 4px;
  font-size: 18px;
  line-height: 1.3;
  border-radius: 4px 4px 0 0;
  font-family: "Crimson Pro";
}
.textdiv {
  resize: none;
  font-size: 15px;
  line-height: 1.6;
  padding: 2px 8px 4px;
  margin-bottom: 1px;
  border: 1px solid #888;
  border-radius: 0 0 8px 8px;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}
textarea {
  height: 80px;
  font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
}
.op-wrapper {
  display: flex;
}
.parser,
.output {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
}
.op-wrapper textarea {
  font-size: 14px;
}
.block {
  position: relative;
  display: flex;
  flex-direction: column;
  margin: 16px 8px;
  border-left: 2px solid #aaa;
  padding-left: 8px;
  opacity: .6;
  transition: all .5s;
}
.block.focus {
  opacity: 1;
}
.loading {
  position: absolute;
  bottom: 8px;
  right: 8px;
  color: #eee;
  font-family: "Crimson Pro";
  font-size: 18px;
}
.body-wrapper {
  display: flex;
}
.quick-words {
  min-width: 150px;
  margin-top: 8px;
  padding: 8px;
  font-size: 14px;
}
.quick-words > div {
  margin-bottom: 4px;
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
  display: flex;
}
.quick-words input {
  width: 20px;
  font-family: Menlo, Consolas, monospace;
  border: 0;
  margin-right: 4px;
  text-align: center;
}
</style>