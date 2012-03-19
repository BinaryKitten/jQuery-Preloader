/* jQuery.preloader - v0.97.1 - K Reeve aka BinaryKitten
*
*    Preloads a list of images, or all css linked images or both
*    $.preLoadImages(array imageList,fn callback)
*        imageList    The array of image locations to preload
*        callback    a link or anonymous function that will process when all images are preloaded
*
*    $.preLoadCssImages(fn callback)
*        callback    a link or anonymous function that will process when all images are preloaded
*
*    $.preLoadAllImages(array imageList,fn callback)
*        imageList    The array of image locations to preload
*        callback    a link or anonymous function that will process when all images are preloaded
*
*
* ------------ Version History -----------------------------------
* v0.97.1
*    fixed accidentally removed img setting line.
*
* v0.97
*    Attempted fix for @import and @font-face
*
* v0.96.1
*   Cleaned up Tabulation
*   
* v0.96
*   Thanks to the following people for their comments and fixes:
*       Evgeni Nabokov
*       Matt Fordham
*       fanton
*       Bruno Couto
*
*   Adjusted the regex so that:
*       - it will not match Quotes within the url
*       - it does not match data uris which need no preloading 
*   Added in a few addition checks and clean ups
*
* v0.95
*     # Note - keeping below v1 as really not sure that I consider it public usable.
*     # But it saying that it does the job it was intended to do.
*     Added Completion of loading callback.
*     Main Reworking With Thanks to Remy Sharp of jQuery for Designers
*     
*
* v0.9
*     Fixed .toString being .toSteing
*
* v0.8
*        Fixed sheet.href being null error (was causing issues in FF3RC1)
*        
* v0.7
*        Remade the preLoadImages from jQuery to DOM
*
* v0.6
*         Fixed IE6 Compatability!
*        Moved from jQuery to DOM
*
* v0.5
*         Shifted the additionalimages loader in the preLoadAllImages so it wasn't called multiple times
*         Created secondary .preLoadImages to handle additionalimages and so it can be called on itself
*/

(function ($) {
    $.preLoadImages = function(imageList,callback) {
        var pic = [], i, total, loaded = 0;
        if (typeof imageList != 'undefined') {
            if ($.isArray(imageList)) {
                total = imageList.length; // used later
                    for (i=0; i < total; i++) {
                        pic[i] = new Image();
                        pic[i].onload = function() {
                            loaded++; // should never hit a race condition due to JS's non-threaded nature
                            if (loaded == total) {
                                if ($.isFunction(callback)) {
                                    callback();
                                }
                            }
                        };
                        pic[i].src = imageList[i];
                    }
            } else {
                pic[0] = new Image();
                if ($.isFunction(callback)) {
                    pic[0].onload = callback;
                }
                pic[0].src = imageList;
            }
        } else if ($.isFunction(callback)) {
            //nothing passed but we have a callback.. so run this now
            //thanks to Evgeni Nobokov
            callback();
        }
        pic = undefined;
    };
    
    $.preLoadCSSImages = function(callback) {
        var pic = [], i, imageList = [], loaded = 0, total, regex = /url\((?:"|')?(?!data:)([^)"']+)(?:"|')?\)/i,spl;
        var cssSheets = document.styleSheets, path,myRules='',Rule,match,txt,img,sheetIdx,ruleIdx;
        for (sheetIdx=0;sheetIdx < cssSheets.length;sheetIdx++){
            var sheet = cssSheets[sheetIdx];
            if (typeof sheet.href == 'string' && sheet.href.length > 0) {
                spl = sheet.href.split('/');spl.pop();path = spl.join('/')+'/';
            } else {
                path = './';
            }
            if (sheet.cssRules) {
                myRules = sheet.cssRules;
            } else if (sheet.rules) {
                myRules = sheet.rules;
            }
            if (myRules.length > 0) {
                for (ruleIdx=0;ruleIdx<myRules.length;ruleIdx++) {
                    Rule = myRules[ruleIdx];
                    txt = Rule.cssText ? Rule.cssText : Rule.style.cssText;
                    txt = $.trim(txt);
                    if ('@' === txt.substr(0,1)) {
                        continue;
                    }
                    match = regex.exec(txt);
                    if (match != null) {
                        img = match[1];
                        if (img.substring(0,4) == 'http') {
                            imageList[imageList.length] = img;
                        } else if ( match[1].substring(1,2) == '/') {
                            var p2 = path.split('/');p2.pop();p2.pop();p2x = p2.join("/");
                            imageList[imageList.length] = p2x+img;
                        } else {
                            imageList[imageList.length] = path+img;
                        }
                    }
                };
            } 
        };
        
        total = imageList.length; // used later
        if (total > 0) {
            for (i=0; i < total; i++) {
                pic[i] = new Image();
                pic[i].onload = function() {
                    loaded++; // should never hit a race condition due to JS's non-threaded nature
                    if (loaded == total) {
                        if ($.isFunction(callback)) {
                            callback();
                        }
                    }
                };
                pic[i].src = imageList[i];
            }
        } else if($.isFunction(callback)) {
            //nothing found, but we have a callback.. so run this now
            //thanks to Evgeni Nobokov
            callback();
        }
    };
    $.preLoadAllImages = function(imageList,callback) {
        if (typeof imageList != 'undefined') {
            if ($.isFunction(imageList)) {
                callback = imageList;
            } else if (!$.isArray(imageList)) {
                imageList = [imageList];
            }
        }
        $.preLoadCSSImages(function(){
            if (imageList.length > 0) {
                $.preLoadImages(imageList,callback);
            } else {
                callback();
            }
        });
    }
})(jQuery);