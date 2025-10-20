/* MEDIARITHMICS SDK LOADER - DO NOT EDIT THIS PART */
!function(t,e,a){"use strict";var i=t.scimhtiraidem||{};function s(t){var e=i[a]||{};i[a]=e,e[t]||(e[t]=function(){i._queue[a].push({method:t,args:Array.prototype.slice.apply(arguments)})})}t.googletag=t.googletag||{},t.googletag.cmd=t.googletag.cmd||[],t.googletag.cmd.push(function(){var e=t.localStorage.getItem("mics_sgmts"),a=JSON.parse(e),i=a||{};Object.keys(i).forEach(function(e){t.googletag.pubads().setTargeting("mics_"+e,i[e].map(String))})});var r="init call config push pushDefault addIdentifier addProperties addProperty onFinish onStart _reset".split(" ");i._queue=i._queue||{},i._names=i._names||[],i._names.push(a),i._queue[a]=i._queue[a]||[],i._startTime=(new Date).getTime(),i._snippetVersion="2.0";for(var o=0;o<r.length;o++)s(r[o]);t.scimhtiraidem=i,t[a]=i[a];var n=e.createElement("script");n.setAttribute("type","text/javascript"),n.setAttribute("src","https://static.mediarithmics.com/tag/2/tag.min.js"),n.setAttribute("async","true"),e.getElementsByTagName("script")[0].parentNode.appendChild(n)}(window,document,"demomediaretailsite");

// 1. Initialization (Untouched)
demomediaretailsite.init("demo-media-retail-site");

// Enables client-side feeds
demomediaretailsite.call("syncFeeds");

/* CUSTOMIZE THE TAG CALL BELOW */

// --- START CUSTOM CODE ---

// Function to check if the Mediarithmics visitor ID cookie (mics_vid) exists
function checkMicsUserCookie() {
    return document.cookie.includes('mics_vid=');
}

// 1. CONSENT LOGIC: Only send the $set_user_choice event if the cookie is NOT found.
if (!checkMicsUserCookie()) {
    var userConsent = {
        $processing_token: "fillet-april", 
        $choice_acceptance_value: true
    };
    // Push the consent event only if the cookie doesn't exist
    demomediaretailsite.push("$set_user_choice", userConsent);
}

var eventType = 'Page View';

// Define separate objects for retail event data
var pageContext = {};
var productDetails = {};
var listDetails = {};

// 2. Always define the basic page context
pageContext.page_url = 'https://demo-media-retail-site.netlify.app' + window.location.pathname;
pageContext.page_name = document.title;

// Read the page-specific dataLayer content
// NOTE: window.dataLayer MUST be defined in the HTML file BEFORE this script loads!
if (window.dataLayer && window.dataLayer.length > 0) {
    var dlData = window.dataLayer[window.dataLayer.length - 1]; 
    
    if (dlData.pageType === 'product_view' && dlData.productDetail) {
        eventType = 'Product View';
        
        // Populate Product Detail Object, MAPPING TO SCHEMA NAMES
        productDetails.id = dlData.productDetail.id; 
        productDetails.$category1 = dlData.productDetail.category; 
        productDetails.$name = dlData.productDetail.name;         
        productDetails.$price = parseFloat(dlData.productDetail.price); // Explicitly cast price
        
        pageContext.page_type = dlData.pageType;
        
        // Add top-level category property for filtering/reporting
        pageContext.$category1 = dlData.productDetail.category;
        
    } else if (dlData.pageType === 'list_view') {
        eventType = 'Product List View';
        
        // Populate List Detail Object
        listDetails.category_name = dlData.pageCategory;
        
        // NEW: Ensure price is a number within the list payload if sent
        listDetails.product_list = dlData.productList.map(function(item) {
             return {
                id: item.id,
                sku: item.sku,
                name: item.name,
                category: item.category,
                price: parseFloat(item.price) // Ensure price is float in list view too
             };
        });
        
        pageContext.page_type = dlData.pageType;
        
        // Add top-level category property for filtering/reporting
        pageContext.$category1 = dlData.pageCategory;
        
    } else {
        eventType = 'Page View';
        pageContext.page_type = dlData.pageType; 
    }
}

// 3. FINAL PUSH LOGIC (Retail Events)
if (eventType === 'Product View') {
    // Send eventType, Page Context (with $category1), and Product Details
    demomediaretailsite.push(eventType, pageContext, productDetails);
    
} else if (eventType === 'Product List View') {
    // Send eventType, Page Context (with $category1), and List Details
    demomediaretailsite.push(eventType, pageContext, listDetails);
    
} else {
    // Send eventType and Page Context only
    demomediaretailsite.push(eventType, pageContext);
}

// --- END CUSTOM CODE ---