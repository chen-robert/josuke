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
  <strong class="tag wow fadeInUp" data-wow-duration="0.5s">${a.innerText.split("T.").join("<br>T.")}</strong>
  ${
    a.children.length === 0
      ? "<br>"
      : `
  <section class="subtext-wrapper wow fadeInUp" data-wow-duration="0.5s">
    <div class="subtext-container">
      ${a.children.map(subText).join("")}
    </div>
  </section>
  `
  }
  `;
  };
  const build = name => {
    $("#results").html(
      `
<h3 id="section-${name}" class="section-title">${name}</h3>
${tags
  .filter(a => a.innerText.toLowerCase().includes(name.toLowerCase()))
  .map(buildTag)
  .filter((v, i, a) => a.indexOf(v) === i)
  .join("")}
`
    );
    
    $(".subtext-container").each((i, elem) => {
      if($(elem).overflown()){
        $(elem).addClass("overflown");
      }
    });
    $(".subtext-container").click(function(){
      $(this).css("max-height", "initial");
      $(this).removeClass("overflown");
    });
    
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
