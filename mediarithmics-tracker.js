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

/* CUSTOMIZE THE TAG CALL BELOW */

// --- START CUSTOM CODE ---

// Function to check if the Mediarithmics visitor ID cookie (mics_vid) exists
function checkMicsUserCookie() {
    // We check for the specific visitor ID cookie identified in your environment
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

// Define objects for event data
var pageContext = {};
var productDetails = {};
var listDetails = {};
var finalProperties = {}; // Object used for the final merged payload

// 2. Always define the basic page context
// NOTE: page_url will be redundant with platform's $url but required for pageContext standardisation
pageContext.page_url = 'https://demo-media-retail-site.pages.dev' + window.location.pathname;
pageContext.page_name = document.title;

// Read the page-specific dataLayer content
if (window.dataLayer && window.dataLayer.length > 0) {
    var dlData = window.dataLayer[window.dataLayer.length - 1]; 
    
    if (dlData.pageType === 'product_view' && dlData.productDetail) {
        eventType = 'Product View';
        
        // Populate Product Detail Object, MAPPING TO SCHEMA NAMES ($category1, $name, $price)
        productDetails.id = dlData.productDetail.id; 
        productDetails.$category1 = dlData.productDetail.category; 
        productDetails.$name = dlData.productDetail.name;         
        // CRITICAL FIX: Ensure price is a float/number
        productDetails.$price = parseFloat(dlData.productDetail.price); 

        // REMOVED: page_type is redundant with the eventType name
        // pageContext.page_type = dlData.pageType;
        
        // RETAINED: $category1 is the required schema property
        pageContext.$category1 = dlData.productDetail.category;
        
        // CRITICAL FIX: Merge pageContext and productDetails into one object
        finalProperties = Object.assign({}, pageContext, productDetails);
        
    } else if (dlData.pageType === 'list_view') {
        eventType = 'Product List View';
        
        // Populate List Detail Object
        // NOTE: category_name is removed as it's redundant with $category1
        // listDetails.category_name = dlData.pageCategory;
        
        // CRITICAL FIX: Ensure price is a number within the list payload
        listDetails.product_list = dlData.productList.map(function(item) {
             return {
                id: item.id,
               // sku: item.sku,
                name: item.name,
                category: item.category,
                price: parseFloat(item.price) // Ensure price is float in list view too
             };
        });
        
        // REMOVED: page_type is redundant with the eventType name
        // pageContext.page_type = dlData.pageType;
        
        // RETAINED: $category1 is the required schema property
        pageContext.$category1 = dlData.pageCategory;
        
        // CRITICAL FIX: Merge pageContext and listDetails into one object
        finalProperties = Object.assign({}, pageContext, listDetails);
        
    } else {
        eventType = 'Page View';
        pageContext.page_type = dlData.pageType; 
        // Home/General Page sends only pageContext
        finalProperties = pageContext;
    }
}

// 3. FINAL PUSH LOGIC (Send the final merged object as the sole property argument)
demomediaretailsite.push(eventType, finalProperties);

// --- END CUSTOM CODE ---