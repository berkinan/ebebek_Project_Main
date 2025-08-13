/* 
    Berk İnan
    14.08.2025
    Note: I tried using simple, clear variable/function names on purpose so that the code is easy to read. I didn’t add comments for every function or variable because of the time limit. 
*/

(function ()
{
  const data_Url = "https://gist.githubusercontent.com/sevindi/8bcbde9f02c1d4abe112809c974e1f49/raw/9bf93b58df623a9b16f1db721cd0a7a539296cf0/products.json";
  const ls_Products = "carousel_products_v1";
  const ls_Favs = "carousel_favs_v1";
  const root_Id = "carousel-root";
  const title_Text = "Beğenebileceğinizi düşündüklerimiz";
  const anchor_Text = "Sizin için Seçtiklerimiz";
  const color_Orange="#f28e00", color_Beige="#fef6eb", color_Border="#e9ecef", color_Text="#7a7474ff", color_Muted="#8a94a6", color_Green="#22a45a", color_Star="#ffb400";

  function is_OnHome ()
  {
    const path_Text = (location.pathname || "/").replace(/\/+$/, "/");
    return path_Text === "/" || path_Text === "/tr" || path_Text === "/tr/" || path_Text === "/anasayfa" || path_Text === "/anasayfa/";
  }

  function load_JQuery ()
  {
    return new Promise(function (resolve_Fn)
    {
      if (window.jQuery) 
        { 
          return resolve_Fn(window.jQuery); 
        }
      const script_El = document.createElement("script");
      script_El.src = "https://code.jquery.com/jquery-3.7.1.min.js";
      script_El.onload = function () { resolve_Fn(window.jQuery); };
      document.head.appendChild(script_El);
    });
  }

  function clean_Turkish (text)
  {
    return (text || "")
      .toString()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/İ/g, "I")
      .replace(/ı/g, "i");
  }

  function to_Number (value)
  {
    if (value == null) 
      { 
        return NaN;      
      }
    if (typeof value === "number") 
      { 
        return value; 
      }
    const clean_Text = String(value).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
    return parseFloat(clean_Text);
  }

  function format_TL (value)
  {
    const num = to_Number(value);
    if (!isFinite(num)) 
      { 
        return ""; 
      }
    const parts = num.toFixed(2).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return `${parts[0]},${parts[1]} TL`;
  }

  function get_Discount (old_Val, new_Val)
  {
    const old_Num = to_Number(old_Val);
    const new_Num = to_Number(new_Val);
    if (!isFinite(old_Num) || !isFinite(new_Num) || old_Num <= new_Num) 
      { 
        return 0; 
      }
    return Math.round(((old_Num - new_Num) / old_Num) * 100);
  }

  function get_Key (item)
  {
    return String(item.id || item.sku || item.url || item.slug || item.code || item.title);
  }

  function read_Favs ()
  {
    return JSON.parse(localStorage.getItem(ls_Favs) || "[]");
  }

  function write_Favs (list)
  {
    localStorage.setItem(ls_Favs, JSON.stringify(list));
  }

  async function fetch_Products ()
  {
    const cache = localStorage.getItem(ls_Products);
    if (cache) 
      { 
        return JSON.parse(cache); 
      }

    const res = await fetch(data_Url, { method: "GET", mode: "cors" });
    const data = await res.json();
    localStorage.setItem(ls_Products, JSON.stringify(data));
    return data;
  }

  function add_CarouselCss ($)
  {
    if (document.querySelector("style.carousel-style")) 
      { 
        return; 
      }

    const css_Text =
    `
      #${root_Id}{width:100%;margin:24px 0 32px;}
      #${root_Id} .carousel-container{max-width:1320px;height:680px;margin:0 auto;padding:0 16px;font-family:inherit;}
      #${root_Id} .carousel-band{background:${color_Beige};border-radius:20px 20px 0 0;width:1290px;height:82px;display:flex;align-items:center;justify-content:flex-start;padding:0 24px;margin:0 auto 18px;}
      #${root_Id} .carousel-band h2{margin:0;color:${color_Orange};font-weight:800;font-size:28px;letter-spacing:.2px;line-height:1;}
      #${root_Id} .carousel-shell{position:relative;z-index:0;overflow:visible;width:1290px;margin:0 auto;min-height:600px;}
      #${root_Id} .carousel-track{position:relative;z-index:1;display:flex;gap:24px;scroll-snap-type:x mandatory;padding:12px;overflow:auto;-ms-overflow-style:none;scrollbar-width:none;cursor:grab;align-items:stretch;will-change:scroll-position;touch-action:pan-y;}
      #${root_Id} .carousel-track::-webkit-scrollbar{display:none;}
      #${root_Id} .carousel-track.is-dragging{cursor:grabbing;user-select:none;}
      #${root_Id} .carousel-arrow{position:absolute;top:50%;transform:translateY(-50%);width:50px;height:50px;border-radius:999px;background:${color_Beige};display:flex;align-items:center;justify-content:center;cursor:pointer;border:0;box-shadow:0 6px 18px rgba(0,0,0,.08);z-index:3;}
      #${root_Id} .carousel-prev{left:-64px;}
      #${root_Id} .carousel-next{right:-64px;}
      #${root_Id} .carousel-arrow svg{width:22px;height:22px;stroke:${color_Orange};fill:none;stroke-width:2.5px;}
      #${root_Id} .carousel-card{width:242px;flex:0 0 auto;scroll-snap-align:start;background:#fff;border:1px solid ${color_Border};border-radius:18px;box-shadow:0 12px 24px rgba(13,38,76,.06);overflow:hidden;position:relative;display:flex;flex-direction:column;transition:box-shadow .18s ease,border-color .18s ease,transform .18s ease;height:auto;}
      #${root_Id} .carousel-card:hover,#${root_Id} .carousel-card:focus-visible{border-color:${color_Orange};box-shadow:0 14px 28px rgba(13,38,76,.10),inset 0 0 0 2px rgba(246,139,31,.65);transform:translateY(-1px);}
      #${root_Id} .carousel-top{position:relative;padding:64px 8px 0;}
      #${root_Id} .carousel-heart{position:absolute;right:12px;top:12px;width:52px;height:52px;border-radius:999px;background:#fff;border:1px solid ${color_Border};display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.08);cursor:pointer;z-index:4;}
      #${root_Id} .carousel-heart svg{width:24px;height:24px;fill:none;stroke:${color_Orange};stroke-width:2px;}
      #${root_Id} .carousel-heart.active svg{fill:${color_Orange};stroke:${color_Orange};}
      #${root_Id} .carousel-img{height:200px;border-radius:12px;background:#fff;display:flex;align-items:center;justify-content:center;width:100%;}
      #${root_Id} .carousel-img img{max-width:230px;max-height:200px;object-fit:contain;display:block;user-drag:none;-webkit-user-drag:none;}
      #${root_Id} .carousel-body{padding:12px 8px 12px;display:flex;flex-direction:column;gap:10px;flex:1 1 auto;}
      #${root_Id} .carousel-name{color:${color_Text};font-size:15px;line-height:1.35;min-height:48px;font-weight:600;}
      #${root_Id} .carousel-rating{display:flex;align-items:center;gap:8px;}
      #${root_Id} .carousel-stars{display:flex;gap:2px;}
      #${root_Id} .carousel-stars svg{width:16px;height:16px;fill:${color_Star};}
      #${root_Id} .carousel-rc{color:${color_Muted};font-size:13px;}
      #${root_Id} .carousel-price{display:flex;flex-direction:column;gap:6px;margin-top:6px;}
      #${root_Id} .carousel-current{color:${color_Text};font-weight:800;font-size:22px;}
      #${root_Id} .carousel-current.is-discount{color:${color_Green};}
      #${root_Id} .carousel-oldrow{display:flex;align-items:center;gap:10px;}
      #${root_Id} .carousel-old{color:#98a2b3;text-decoration:line-through;font-size:14px;font-weight:600;}
      #${root_Id} .carousel-disc{display:inline-flex;align-items:center;gap:6px;color:${color_Green};font-weight:800;font-size:14px;}
      #${root_Id} .carousel-disc i{width:20px;height:20px;border-radius:999px;background:${color_Green};display:inline-flex;align-items:center;justify-content:center;}
      #${root_Id} .carousel-disc i svg{width:12px;height:12px;stroke:#fff;fill:none;stroke-width:3px;}
      #${root_Id} .carousel-cta{margin-top:auto;height:56px;border-radius:999px;background:${color_Beige};color:${color_Orange};font-weight:800;border:0;cursor:pointer;font-size:15px;width:100%;transition:background-color .18s ease, box-shadow .18s ease, transform .12s ease, color .18s ease;}
      #${root_Id} .carousel-cta:hover,
      #${root_Id} .carousel-cta:focus-visible{background:${color_Orange}; color:#fff;box-shadow:0 10px 24px rgba(242,142,0,.35);transform:translateY(-1px); outline:none;}
      #${root_Id} .carousel-cta:active{transform:translateY(0);box-shadow:0 6px 16px rgba(242,142,0,.25);}  
    `;
    $('<style>').addClass('carousel-style').html(css_Text).appendTo('head');
  }

  function find_Anchor ($)
  {
    const norm_Text = clean_Turkish(anchor_Text);
    const $matches = $("h1,h2,h3,div,section,article").filter(function ()
    {
      const inner_Text = clean_Turkish($(this).text().trim());
      return inner_Text.includes(norm_Text);
    });

    if (!$matches.length) 
      { 
        return null; 
      }

    let min_Top = Infinity;
    let picked_El = null;

    $matches.each(function ()
    {
      const off = $(this).offset();
      if (off && off.top < min_Top)
      {
        min_Top = off.top;
        picked_El = this;
      }
    });

    return $(picked_El).closest("section,div").first();
  }

  function make_Root ($)
  {
    $("#" + root_Id).remove();

    const markup = `
      <section id="${root_Id}" aria-label="${title_Text}">
        <div class="carousel-container">
          <div class="carousel-band"><h2>${title_Text}</h2></div>
          <div class="carousel-shell">
            <button class="carousel-arrow carousel-prev" type="button" aria-label="Önceki">
              <svg viewBox="0 0 24 24"><path d="M15 6l-6 6 6 6"/></svg>
            </button>
            <div class="carousel-track" role="list"></div>
            <button class="carousel-arrow carousel-next" type="button" aria-label="Sonraki">
              <svg viewBox="0 0 24 24"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </div>
        </div>
      </section>`;

    const root_Jq = $(markup);
    const anchor_Jq = find_Anchor($);

    if (anchor_Jq && anchor_Jq.length)
    {
      anchor_Jq.before(root_Jq);
    }
    else
    {
      $("main,#main,body").first().append(root_Jq);
    }

    return root_Jq;
  }

  function make_Stars ()
  {
    let out_Text = "";
    for (let i = 0; i < 5; i++)
    {
      out_Text += `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 17.3l-6.18 3.46 1.6-6.88L2 8.98l7-0.6L12 2l3 6.38 7 .6-5.42 4.9 1.6 6.88z"/></svg>`;
    }
    return out_Text;
  }

  function render_Cards ($, track_Jq, items, favs)
  {
    const html = items.map(function (item)
    {
      const key = get_Key(item);
      const url = item.url || item.link || "#";
      const img = item.image || item.img || item.imageUrl || "";
      const title = item.title || item.name || "Ürün";
      const price = item.price ?? item.current_price ?? item.sale_price ?? item.salePrice;
      const old_Val = item.original_price ?? item.originalPrice ?? item.list_price ?? item.listPrice;
      const has_Discount = to_Number(old_Val) > to_Number(price);
      const percent = has_Discount ? get_Discount(old_Val, price) : 0;
      const rating = Number(item.rating || item.rating_value || 0);
      const rate_Count = item.rating_count || item.review_count || item.reviews || null;
      const is_Fav = favs.includes(String(key));

      return `
      <article class="carousel-card" data-url="${encodeURI(url)}" data-key="${key}" role="listitem" tabindex="0">
        <div class="carousel-top">
          <div class="carousel-heart ${is_Fav ? "active" : ""}" aria-pressed="${is_Fav}">
            <svg viewBox="0 0 24 24"><path d="M12 21s-6.7-4.35-9.33-7.4C-0.5 9.52 2.16 4 6.96 4c2.03 0 3.8 1.1 5.04 2.76C13.24 5.1 15 4 17.04 4c4.8 0 7.46 5.52 4.29 9.6C18.7 16.65 12 21 12 21z"/></svg>
          </div>
          <div class="carousel-img">
            <img alt="${title.replace(/"/g, "&quot;")}" loading="lazy" src="${img}">
          </div>
        </div>
        <div class="carousel-body">
          <div class="carousel-name">${title}</div>
          ${ (rating || rate_Count) ? `
          <div class="carousel-rating">
            <div class="carousel-stars">${make_Stars()}</div>
            ${ rate_Count ? `<div class="carousel-rc">(${rate_Count})</div>` : "" }
          </div>` : "" }
          <div class="carousel-price">
            ${ has_Discount ? `
              <div class="carousel-oldrow">
                <div class="carousel-old">${format_TL(old_Val)}</div>
                <div class="carousel-disc"><i><svg viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg></i>%${percent}</div>
              </div>` : "" }
            <div class="carousel-current ${has_Discount ? 'is-discount' : ''}">${format_TL(price)}</div>
          </div>
          <button class="carousel-cta" type="button">Sepete Ekle</button>
        </div>
      </article>`;
    }).join("");

    track_Jq.html(html);
  }

  function bind_Events ($, root_Jq)
  {
    const track_Jq = root_Jq.find(".carousel-track");
    const prev_Btn_Jq = root_Jq.find(".carousel-prev");
    const next_Btn_Jq = root_Jq.find(".carousel-next");

    function card_Width ()
    {
      const firstW = root_Jq.find(".carousel-card").first().outerWidth(true) || 242;
      return firstW + 24;
    }

    function move_By (dir_Num)
    {
      const step = (Math.floor(track_Jq.width() / card_Width()) * card_Width()) || card_Width();
      track_Jq[0].scrollBy({ left: dir_Num * step, behavior: "smooth" });
    }

    prev_Btn_Jq.on("click", function () { move_By(-1); });
    next_Btn_Jq.on("click", function () { move_By(1); });

    let isDown = false;
    let startX = 0;
    let startLeft = 0;

    track_Jq.on("mousedown", function (e)
    {
      isDown = true;
      startX = e.pageX;
      startLeft = track_Jq[0].scrollLeft;
      track_Jq.addClass("is-dragging");
      e.preventDefault();
    });

    $(document).on("mouseup", function ()
    {
      if (isDown)
      {
        isDown = false;
        track_Jq.removeClass("is-dragging");
      }
    });

    $(document).on("mousemove", function (e)
    {
      if (!isDown) 
        { 
          return; 
        }
      track_Jq[0].scrollLeft = startLeft - (e.pageX - startX);
    });

    root_Jq.on("click keydown", ".carousel-card, .carousel-cta", function (e)
    {
      if ($(e.target).closest(".carousel-heart").length) 
        { 
          return; 
        }
      if (e.type === "keydown" && e.key !== "Enter") 
        { 
          return; 
        }

      const card_Jq = $(this).closest(".carousel-card");
      const link_Url = card_Jq.attr("data-url");
      if (link_Url && link_Url !== "#") 
        { 
          window.open(link_Url, "_blank", "noopener"); 
        }
    });

    root_Jq.on("click", ".carousel-heart", function (e)
    {
      e.stopPropagation();

      const btn_Jq = $(this);
      const key = String(btn_Jq.closest(".carousel-card").attr("data-key"));

      let favs = read_Favs();
      const idx = favs.indexOf(key);

      if (idx === -1)
      {
        favs.push(key);
        btn_Jq.addClass("active").attr("aria-pressed", "true");
      }
      else
      {
        favs.splice(idx, 1);
        btn_Jq.removeClass("active").attr("aria-pressed", "false");
      }

      write_Favs(favs);
    });
  }

  async function start_App ()
  {
    if (!is_OnHome()) 
      { 
        console.log("wrong page");
        return; 
      }

    const $ = await load_JQuery();
    add_CarouselCss($);

    const root_Jq = make_Root($);

    let products = await fetch_Products();
    if (products && products.data && Array.isArray(products.data)) 
      { 
        products = products.data; 
      }
    if (!Array.isArray(products)) 
      { 
        products = []; 
      }

    products = products.filter(function (item)
    {
      return (item.url || item.link) && (item.price ?? item.current_price ?? item.sale_price ?? item.salePrice) != null;
    });

    const favs = read_Favs();

    render_Cards($, root_Jq.find(".carousel-track"), products, favs);
    bind_Events($, root_Jq);
  }

  start_App();
})();
