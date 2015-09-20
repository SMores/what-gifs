// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    bounds: {
      width: 700,
      height: 750
    }
  });
});


$.ajaxTransport("+binary", function(options, originalOptions, jqXHR){
  // check for conditions and support for blob / arraybuffer response type
  if (window.FormData && ((options.dataType && (options.dataType == 'binary')) || (options.data && ((window.ArrayBuffer && options.data instanceof ArrayBuffer) || (window.Blob && options.data instanceof Blob))))) {
    return {
        // create new XMLHttpRequest
      send: function(headers, callback){
        // setup all variables
        var xhr = new XMLHttpRequest(),
          url = options.url,
          type = options.type,
          async = options.async || true,
          // blob or arraybuffer. Default is blob
          dataType = options.responseType || "blob",
          data = options.data || null,
          username = options.username || null,
          password = options.password || null;
                
          xhr.addEventListener('load', function(){
            var data = {};
            data[options.dataType] = xhr.response;
            // make callback and send data
            callback(xhr.status, xhr.statusText, data, xhr.getAllResponseHeaders());
          });

        xhr.open(type, url, async, username, password);
      
        // setup custom headers
        for (var i in headers ) {
          xhr.setRequestHeader(i, headers[i] );
        }
      
        xhr.responseType = dataType;
        xhr.send(data);
      },
      abort: function(){
        jqXHR.abort();
      }
    };
  }
});


function requestCrop(video, request, callback) {
  data = new FormData();
  data.append('video', video);
  data.append('width', request.width);
  data.append('height', request.height);
  data.append('horizontal', request.horizontal);
  data.append('vertical', request.vertical);
  $.ajax("http://127.0.0.1:5000/crop", {
    contentType: false,
    data: data,
    mimeType: 'video/webm',
    dataType: 'binary',
    cache: false,
    processData: false,
    type: 'POST',
    success: function(response) {
      url = URL.createObjectURL(response);
      callback(url);
    }
  });
}


function requestSub (video, request, callback) {
  data = new FormData();
  data.append('video', video);
  data.append('subtitles', JSON.stringify(request.subtitles));
  data.append('optimize', request.optimize);
  $.ajax("http://127.0.0.1:5000/subtitle", {
    contentType: false,
    data: data,
    mimeType: 'image/gif',
    dataType: 'binary',
    cache: false,
    processData: false,
    type: 'POST',
    success: function(response) {
      url = URL.createObjectURL(response);
      callback(url);
    }
  });
}


function downloadBlob(request, next, callback) {
  var xhr = new XMLHttpRequest();
    xhr.open('GET', request.url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
      if (this.status == 200) {
        var video = new Blob([this.response], {type: 'video/webm'});
        // myBlob is now the blob that the object URL pointed to.
        next(video, request, callback);
      }
    };
    xhr.send();
}


chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  if (request.action == 'crop') {
    downloadBlob(request, requestCrop, callback);
    return true;
  }
  else if (request.action == 'subtitle') {
    downloadBlob(request, requestSub, callback);
    return true;
  }
});