/**
 * Sets up Justified Gallery.
 */
if (!!$.prototype.justifiedGallery) {
  var options = {
    rowHeight: 140,
    margins: 4,
    lastRow: "justify"
  };
  $(".article-gallery").justifiedGallery(options);
}

function typesetMathInElement(element) {
  if (!element) {
    return;
  }

  if (element.getAttribute("data-mathjax-rendered") === "true") {
    return;
  }

  if (window.MathJax && window.MathJax.Hub && typeof window.MathJax.Hub.Queue === "function") {
    window.MathJax.Hub.Queue(["Typeset", window.MathJax.Hub, element]);
    window.MathJax.Hub.Queue(function() {
      element.setAttribute("data-mathjax-rendered", "true");
    });
    return;
  }

  if (window.MathJax && typeof window.MathJax.typesetPromise === "function") {
    window.MathJax.typesetPromise([element]).then(function() {
      element.setAttribute("data-mathjax-rendered", "true");
    });
  }
}

function ensureMathInElement(selector, retriesLeft) {
  var element = document.querySelector(selector);

  if (!element) {
    return;
  }

  if ((window.MathJax && window.MathJax.Hub) || (window.MathJax && typeof window.MathJax.typesetPromise === "function")) {
    typesetMathInElement(element);
    return;
  }

  if (retriesLeft > 0) {
    window.setTimeout(function() {
      ensureMathInElement(selector, retriesLeft - 1);
    }, 300);
  }
}

function getHeadingContentHtml(heading) {
  var clone = heading.cloneNode(true);
  var anchor = clone.querySelector(".markdownIt-Anchor");

  if (anchor) {
    anchor.remove();
  }

  return clone.innerHTML.trim();
}

function buildTocHtml() {
  var headings = Array.from(document.querySelectorAll(".post .content h1[id], .post .content h2[id], .post .content h3[id], .post .content h4[id], .post .content h5[id], .post .content h6[id]"));

  if (!headings.length) {
    return "";
  }

  var minLevel = headings.reduce(function(result, heading) {
    return Math.min(result, Number(heading.tagName.slice(1)));
  }, 6);
  var root = document.createElement("ol");
  var listStack = [root];
  var itemStack = [];
  var currentLevel = minLevel;
  var counters = [0, 0, 0, 0, 0, 0];

  root.className = "toc";

  headings.forEach(function(heading) {
    var level = Number(heading.tagName.slice(1));
    var tocLevel = level - minLevel;
    var parentList;
    var item;
    var link;
    var number;
    var numberSpan;
    var textSpan;

    while (currentLevel < level) {
      if (!itemStack.length) {
        break;
      }

      parentList = document.createElement("ol");
      parentList.className = "toc-child";
      itemStack[itemStack.length - 1].appendChild(parentList);
      listStack.push(parentList);
      currentLevel += 1;
    }

    while (currentLevel > level) {
      listStack.pop();
      itemStack.pop();
      currentLevel -= 1;
    }

    counters[tocLevel] += 1;
    for (var i = tocLevel + 1; i < counters.length; i += 1) {
      counters[i] = 0;
    }

    item = document.createElement("li");
    item.className = "toc-item toc-level-" + level;

    link = document.createElement("a");
    link.className = "toc-link";
    link.setAttribute("href", "#" + heading.id);

    number = counters.slice(0, tocLevel + 1).join(".") + ".";
    numberSpan = document.createElement("span");
    numberSpan.className = "toc-number";
    numberSpan.textContent = number;

    textSpan = document.createElement("span");
    textSpan.className = "toc-text";
    textSpan.innerHTML = getHeadingContentHtml(heading);

    link.appendChild(numberSpan);
    link.appendChild(document.createTextNode(" "));
    link.appendChild(textSpan);
    item.appendChild(link);
    listStack[listStack.length - 1].appendChild(item);
    itemStack[level - minLevel] = item;
    itemStack.length = level - minLevel + 1;
  });

  return root.outerHTML;
}

function syncTocFromHeadings() {
  var tocHtml = buildTocHtml();
  var toc = document.querySelector("#toc");
  var tocFooter = document.querySelector("#toc-footer");

  if (toc && tocHtml) {
    toc.innerHTML = tocHtml;
  }

  if (tocFooter && tocHtml) {
    tocFooter.innerHTML = tocHtml;
  }
}

$(document).ready(function() {

  /**
   * Shows the responsive navigation menu on mobile.
   */
  $("#header > #nav > ul > .icon").click(function() {
    $("#header > #nav > ul").toggleClass("responsive");
  });


  /**
   * Controls the different versions of  the menu in blog post articles 
   * for Desktop, tablet and mobile.
   */
  if ($(".post").length) {
    syncTocFromHeadings();
    ensureMathInElement("#toc", 20);
    ensureMathInElement("#toc-footer", 20);

    var menu = $("#menu");
    var nav = $("#menu > #nav");
    var menuIcon = $("#menu-icon, #menu-icon-tablet");

    /**
     * Display the menu on hi-res laptops and desktops.
     */
    if ($(document).width() >= 1440) {
      menu.show();
      menuIcon.addClass("active");
    }

    /**
     * Display the menu if the menu icon is clicked.
     */
    menuIcon.click(function() {
      if (menu.is(":hidden")) {
        menu.show();
        menuIcon.addClass("active");
      } else {
        menu.hide();
        menuIcon.removeClass("active");
      }
      return false;
    });

    $("#actions-footer > #toc").click(function() {
      ensureMathInElement("#toc-footer", 20);
    });

    /**
     * Add a scroll listener to the menu to hide/show the navigation links.
     */
    if (menu.length) {
      $(window).on("scroll", function() {
        var topDistance = menu.offset().top;

        // hide only the navigation links on desktop
        if (!nav.is(":visible") && topDistance < 50) {
          nav.show();
        } else if (nav.is(":visible") && topDistance > 100) {
          nav.hide();
        }

        // on tablet, hide the navigation icon as well and show a "scroll to top
        // icon" instead
        if ( ! $( "#menu-icon" ).is(":visible") && topDistance < 50 ) {
          $("#menu-icon-tablet").show();
          $("#top-icon-tablet").hide();
        } else if (! $( "#menu-icon" ).is(":visible") && topDistance > 100) {
          $("#menu-icon-tablet").hide();
          $("#top-icon-tablet").show();
        }
      });
    }

    /**
     * Show mobile navigation menu after scrolling upwards,
     * hide it again after scrolling downwards.
     */
    if ($( "#footer-post").length) {
      var lastScrollTop = 0;
      $(window).on("scroll", function() {
        var topDistance = $(window).scrollTop();

        if (topDistance > lastScrollTop){
          // downscroll -> show menu
          $("#footer-post").hide();
        } else {
          // upscroll -> hide menu
          $("#footer-post").show();
        }
        lastScrollTop = topDistance;

        // close all submenu"s on scroll
        $("#nav-footer").hide();
        $("#toc-footer").hide();
        $("#share-footer").hide();

        // show a "navigation" icon when close to the top of the page, 
        // otherwise show a "scroll to the top" icon
        if (topDistance < 50) {
          $("#actions-footer > #top").hide();
        } else if (topDistance > 100) {
          $("#actions-footer > #top").show();
        }
      });
    }
  }
});
