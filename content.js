const hostnameRegex = /\/\/([\.\-\_\w]+)/i;

function hide() {
  const blockSign = document.getElementsByClassName("is-blocked");
  blockSign.style.display = "block";
}

const popupTagNames = ["DIV", "SECTION", "FOOTER", "ASIDE", "FORM"];

function isFixed(node) {
  return window.getComputedStyle(node).position === "fixed";
}

function isCookieNotice(node) {
  const attrs = [node.id, node.className, node.getAttribute("aria-label")];
  return attrs.some((attr) =>
    /(cookie|gdpr|consent|privacy|opt-in)/i.test(attr)
  );
}

function inspectAndStrip(nodeList) {
  return Array.prototype.slice.call(nodeList).reduce((blocked, node) => {
    if (isCookieNotice(node)) {
      // check if position:fixed
      if (isFixed(node)) {
        node.remove();
        return true;
      }

      // else check if div is on top screen border
      const rect = node.getBoundingClientRect();
      if (rect.top == 0) {
        node.remove();
        return true;
      }

      // else search for fixed node in direct children
      for (const child of node.children) {
        if (isFixed(child)) {
          child.remove();
          return true;
        }
      }
    }
    return blocked;
  }, false);
}

var observer = new MutationObserver((mutationRecords) => {
  let addedNodes = [];

  for (const mut of mutationRecords) {
    let ary = Array.prototype.slice.call(mut.addedNodes);
    ary = ary.filter((node) => popupTagNames.includes(node.tagName));

    addedNodes = addedNodes.concat(ary);
  }

  const blocked = inspectAndStrip(addedNodes);
  if (blocked) hide();
});

const blocked = popupTagNames.reduce((res, tag) => {
  const nodes = document.querySelectorAll(tag);
  if (inspectAndStrip(nodes)) res = true;
  return res;
}, false);

if (blocked) {
  const blockSign = document.getElementsByClassName("is-blocked");
  blockSign.style.display = "block";
}

const config = { attributes: false, childList: true, subtree: true };

observer.observe(document.body, config);
