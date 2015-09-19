// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    bounds: {
      width: 700,
      height: 600
    }
  });
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
    cache: false,
    processData: false,
    type: 'POST',
    success: function(response) {
      console.log("SUCCESS!");
      console.log(callback);
      callback(response);
    }
  });
}


function downloadBlob(request, callback) {
  var xhr = new XMLHttpRequest();
    xhr.open('GET', request.url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function(e) {
      if (this.status == 200) {
        var video = new Blob([this.response], {type: 'video/webm'});
        // myBlob is now the blob that the object URL pointed to.
        requestCrop(video, request, callback);
      }
    };
    xhr.send();
}


chrome.runtime.onMessage.addListener(function(request, sender, callback) {
  if (request.action == 'crop') {
    downloadBlob(request, callback);
    return true;
  }
});