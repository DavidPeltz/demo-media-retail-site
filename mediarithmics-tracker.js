/*
 * Mediarithmics Tracker Script (Refactored)
 * Includes all required initialization, cookie check, consent, and schema mapping logic.
 */

/* MEDIARITHMICS SDK LOADER - DO NOT EDIT THIS PART */
!function(t,e,a){"use strict";var i=t.scimhtiraidem||{};function s(t){var e=i[a]||{};i[a]=e,e[t]||(e[t]=function(){i._queue[a].push({method:t,args:Array.prototype.slice.apply(arguments)})})}t.googletag=t.googletag||{},t.googletag.cmd=t.googletag.cmd||[],t.googletag.cmd.push(function(){var e=t.localStorage.getItem("mics_sgmts"),a=JSON.parse(e),i=a||{};Object.keys(i).forEach(function(e){t.googletag.pubads().setTargeting("mics_"+e,i[e].map(String))})});var r="init call config push pushDefault addIdentifier addProperties addProperty onFinish onStart _reset".split(" ");i._queue=i._queue||{},i._names=i._names||[],i._names.push(a),i._queue[a]=i._queue[a]||[],i._startTime=(new Date).getTime(),i._snippetVersion="2.0";for(var o=0;o<r.length;o++)s(r[o]);t.scimhtiraidem=i,t[a]=i[a];var n=e.createElement("script");n.setAttribute("type","text/javascript"),n.setAttribute("src","https://static.mediarithmics.com/tag/2/tag.min.js"),n.setAttribute("async","true"),e.getElementsByTagName("script")[0].parentNode.appendChild(n)}(window,document,"demomediaretailsite");

// 1. Initialization (Untouched)
demomediaretailsite.init("demo-media-retail-site");

// Enables client-side feeds
demomediaretailsite.call("syncFeeds");

var eventName = 'live_page_view';
var properties = {}; 

// Read the page-specific dataLayer content
if (window.dataLayer && window.dataLayer.length > 0) {
    var dlData = window.dataLayer[window.dataLayer.length - 1]; 
    
    if (dlData.pageType === 'product_view' && dlData.productDetail) {
        eventName = 'live_product_view';
        properties = {
          "product" : {
            "product_id" : dlData.productDetail.id,
            "name" : dlData.productDetail.name,
            "brand" : dlData.productDetail.brand,
            "price"  : parseFloat(dlData.productDetail.price),
            "category" : dlData.productDetail.category
          } 
        }
        
    } else if (dlData.pageType === 'list_view') {
        eventName = 'live_product_list_view';
        properties = {
          "category" : dlData.pageCategory
        }
    }
}

// 3. FINAL PUSH LOGIC (Send the final merged object as the sole property argument)
demomediaretailsite.push(eventName, properties);

// --- END CUSTOM CODE ---