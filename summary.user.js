// ==UserScript==
// @name         GPT要約
// @namespace    https://github.com/taktamur/violentmonkey/blob/main/summary.user.js
// @version      1.2
// @description  GPTのAPIを使って、ページの要約を行う
// @author       taktamur@gmail.com
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

// OpenAPIのキーは、Tampermonkeyの設定画面にある「値」に設定しておく

"use strict";

/**
 * GPTで要約する
 * @param {*} article
 * @returns
 */
async function getSummary(article) {
  const API_KEY = GM_getValue("OPENAI_API_KEY");
  const MODEL = "gpt-4o-mini";
  const SYSTEM_CONTENT =
    "これからwebページのテキストを投げます。その内容を300文字程度に要約してください。キーワードっぽい箇所は、[]で囲ってください。";

  console.log(article.length);
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const requestBody = {
    model: MODEL,
    messages: [
      {
        role: "system",
        content: SYSTEM_CONTENT,
      },
      {
        role: "user",
        content: article,
      },
    ],
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${JSON.stringify(response.status)}`);
    }

    const data = await response.json();
    const summary = data.choices[0].message.content.trim();
    return summary;
  } catch (error) {
    console.error("Error summarizing text:", error);
    throw error;
  }
}

/**
 * 要約を取得して表示する
 */
async function summary() {
  // 要約結果を表示するエリアを作成
  const summaryDiv = document.createElement("div");
  summaryDiv.style.position = "fixed";
  summaryDiv.style.top = "50px";
  summaryDiv.style.right = "10px";
  summaryDiv.style.width = "300px";
  summaryDiv.style.maxHeight = "400px";
  summaryDiv.style.overflowY = "auto";
  summaryDiv.style.backgroundColor = "#f9f9f9";
  summaryDiv.style.border = "1px solid #ddd";
  summaryDiv.style.padding = "10px";
  summaryDiv.style.display = "none";
  summaryDiv.style.zIndex = 1000;

  // テキストを貼るエリアを作成
  const textArea = document.createElement("div");
  textArea.id = "summary-text";
  summaryDiv.appendChild(textArea);

  // ボタンを配置するエリアを作成
  const buttonArea = document.createElement("div");
  buttonArea.style.marginTop = "10px";
  summaryDiv.appendChild(buttonArea);

  // 閉じるボタンを作成
  const closeButton = document.createElement("button");
  closeButton.textContent = "閉じる";
  closeButton.style.display = "inline-block"; // block から inline-block に変更
  closeButton.style.backgroundColor = "#f44336";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.padding = "5px";
  closeButton.style.cursor = "pointer";
  buttonArea.appendChild(closeButton);

  // コピーするボタンを作成
  const copyButton = document.createElement("button");
  copyButton.textContent = "コピー";
  copyButton.style.display = "inline-block"; // block から inline-block に変更
  copyButton.style.marginLeft = "10px";
  copyButton.style.backgroundColor = "#008CBA";
  copyButton.style.color = "white";
  copyButton.style.border = "none";
  copyButton.style.padding = "5px";
  copyButton.style.cursor = "pointer";
  buttonArea.appendChild(copyButton);

  document.body.appendChild(summaryDiv);

  // 閉じるボタンの処理
  closeButton.addEventListener("click", () => {
    summaryDiv.style.display = "none";
  });

  // コピーするボタンの処理
  copyButton.addEventListener("click", () => {
    // textArea内のテキストを取得
    const textToCopy = textArea.innerText.trim();
    console.dir(textToCopy);
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        console.log("要約がコピーされました");
      })
      .catch((err) => {
        console.error("コピーに失敗しました: ", err);
      });
  });

  const pageContent = document.body.innerText; // ページ全体のテキストを取得

  textArea.textContent = "要約を取得中...";
  summaryDiv.style.display = "block";

  try {
    const summary = await getSummary(pageContent);
    textArea.innerHTML = "GPT要約: " + summary;
  } catch (error) {
    textArea.textContent = "要約の取得に失敗しました。";
  }
}

GM_registerMenuCommand("要約", summary);
