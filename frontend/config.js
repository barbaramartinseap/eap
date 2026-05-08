/**
 * config.js — Configuração de ambiente EAP IA
 * DEV: manter http://localhost:3333
 * PROD: atualizar com a URL do Railway após o deploy
 */
;(function () {
  var isLocal =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.protocol === 'file:'

  window.EAP_API = isLocal
    ? 'http://localhost:3333'
    : 'https://eap-ia.up.railway.app'
})()
