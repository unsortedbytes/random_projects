// console.log("Hello world")
// alert("Connected to js")

// =========== UTILITIES ======================

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));// Node-list 

const out = $("#output");
const preview = $("#preview");
const STORAGE_KEY = "code-unsortedbytes-in";

const escapeHtml = s => 
    String(s)