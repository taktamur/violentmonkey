// ==UserScript==
// @name         GPT要約
// @namespace    http://xxxx/gpt-summary
// @version      1.2
// @description  GPTのAPIを使って、ページの要約を行う
// @author       taktamur@gmail.com
// @match        *://*/*
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

// OpenAPIのキーは、Tampermonkeyの設定画面にある「値」に設定しておく

// TODO logとして結果を残す
// TODO 要約を1行にする

"use strict";
// GPT APIを使用して要約を取得する関数
async function getSummary(article) {
  const API_KEY = GM_getValue("OPENAI_API_KEY");
  console.log(article.length);
  const apiUrl = "https://api.openai.com/v1/chat/completions";

  const requestBody = {
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "これからwebページのテキストを投げます。その内容を箇条書きで要約してください。" +
          "要約は箇条書きで、５項目程度としてください\n",
      },
      {
        role: "user",
        content: article,
      },
    ],
    max_tokens: 1000,
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

  // 閉じるボタンを作成
  const closeButton = document.createElement("button");
  closeButton.textContent = "閉じる";
  closeButton.style.display = "block";
  closeButton.style.marginTop = "10px";
  closeButton.style.backgroundColor = "#f44336";
  closeButton.style.color = "white";
  closeButton.style.border = "none";
  closeButton.style.padding = "5px";
  closeButton.style.cursor = "pointer";

  // コピーするボタンを作成
  const copyButton = document.createElement("button");
  copyButton.textContent = "コピー";
  copyButton.style.display = "block";
  copyButton.style.marginTop = "10px";
  copyButton.style.backgroundColor = "#008CBA";
  copyButton.style.color = "white";
  copyButton.style.border = "none";
  copyButton.style.padding = "5px";
  copyButton.style.cursor = "pointer";

  summaryDiv.appendChild(copyButton);
  summaryDiv.appendChild(closeButton);
  document.body.appendChild(summaryDiv);

  // 閉じるボタンの処理
  closeButton.addEventListener("click", () => {
    summaryDiv.style.display = "none";
  });

  // コピーするボタンの処理
  copyButton.addEventListener("click", () => {
    const textToCopy = summaryDiv.innerText.replace("コピー閉じる", "").trim(); // 要約テキストを取得し、不要なボタンテキストを削除
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
  summaryDiv.textContent = "要約を取得中...";
  summaryDiv.style.display = "block";

  try {
    const summary = await getSummary(pageContent);
    summaryDiv.innerHTML = summary.replace(/\n/g, "<br>");
    summaryDiv.appendChild(copyButton); // コピーするボタンを再度追加
    summaryDiv.appendChild(closeButton); // 閉じるボタンを再度追加
  } catch (error) {
    summaryDiv.textContent = "要約の取得に失敗しました。";
    summaryDiv.appendChild(copyButton); // エラーの場合もコピーするボタンを追加
    summaryDiv.appendChild(closeButton); // エラーの場合も閉じるボタンを追加
  }
}

GM_registerMenuCommand("要約", summary);
