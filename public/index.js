$.fn.overflown=function(){var e=this[0];return e.scrollHeight>e.clientHeight||e.scrollWidth>e.clientWidth;}

$.get("/main.css", style => {
$.get("/api/data", data => {
  const el = document.createElement("div");
  el.innerHTML = data;

  window.el = el;

  const children = Array.from(el.children)
    .filter(el => !["H1", "H2"].includes(el.tagName));
  const tags = [];

  let curr = { innerText: "", children: [] };
  for (let i = 0; i < children.length; i++) {
    const a = children[i];
    if (["H3"].includes(a.tagName)) {
      tags.push(curr);
      curr = { innerText: a.innerText, children: [] };
    } else {
      curr.children.push(a);
    }
  }
  tags.push(curr);

  const subText = a => {
    return `${a.outerHTML}`;
  };
  const buildTag = a => {
    return `
  <strong id="tag-${btoa(a.innerText.split("").map(a => a.charCodeAt(0)).join(","))}" class="tag wow fadeInUp" data-wow-duration="0.5s">${a.innerText.split("T.").join("<br>T.")}</strong>
  ${
    a.children.length === 0
      ? "<br>"
      : `
  <section class="subtext-wrapper">
    <div class="subtext-container">
      ${a.children.map(subText).join("")}
    </div>
  </section>
  `
  }
  `;
  };
  
  const buildOutline = a => {
    let ret = "";
    let explore = child => {
      if(child.tagName === "STRONG" || child.tagName === "H4")ret += child.outerHTML + " ";
      else Array.from(child.children).forEach(explore);
    }
    Array.from(a.children).forEach(explore);
    
    return `<div>
      <a href="#tag-${btoa(a.innerText.split("").map(a => a.charCodeAt(0)).join(","))}"><strong class="tag tag__link wow fadeInUp" data-wow-duration="0.5s">${a.innerText}</strong></a>
      <small class="outline--teaser">[Preview]<br> ${ret}</small>
    </div>`;
  }
  
  const shouldKeep = a => {
    let ret = "";
    let explore = child => {
      if(child.tagName === "STRONG" || child.tagName === "H4")ret += child.outerHTML;
      else Array.from(child.children).forEach(explore);
    }
    Array.from(a.children).forEach(explore);
    
    return ret.length !== 0;    
  }
  
  const build = name => {
    const currTags = tags
      .filter(a => a.innerText.toLowerCase().includes(name.toLowerCase()))
      .filter(a => a.children.length !== 0)
      .filter(shouldKeep);
    $("#results").html(
      `
<h3 id="section-${name}" class="section-title">${name}</h3>
<h3 class="section-title section-title__sub">Outline</h3>
${currTags
  .map(buildOutline)
  .join("")}
  
  <hr>
<h3 class="section-title section-title__sub">Cards</h3>
  
${currTags
  .map(buildTag)
  .join("")}
`
    );
    
    $("#download-button").attr("href", `data:text/html,<style>${style.replace(/overflown/g, "removed").replace(/max-height/g, "removed")}</style><body>${$("#results").html()}</body>`);
    $("#download-button").attr("download", `Blocks_${name} (${$(".tag").length} pages).html`);
  };
  window.build = build;
  $("#loading").hide();
});
});

const search = elem => {
  if (event.keyCode === 13) {
    const query = elem.value;
    elem.value = "";
    if (query.trim() === "") return;
    build(query);
  }
};
