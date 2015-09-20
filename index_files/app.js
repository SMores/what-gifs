// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var recordRTC;

var options = {
  type: 'video',
  width: 1920,
  height: 1200
};

var startTime;
var videoLength;

// options = {
//   type: 'gif',
//   frameRate: 400,
//   quality: 100,
//   width: 1920,
//   height: 1200
// };

function string2ArrayBuffer(string, callback) {
    var blob = new Blob([string]);
    console.log(blob.size);
    var f = new FileReader();
    f.onload = function(e) {
        callback(e.target.result);
    };
    f.readAsArrayBuffer(blob);
}

function processVideo(video, stream) {
  $('#sharing').css({display: 'block'});
  recordRTC.stopRecording(function(videoWebURL) {
    videoLength = Date.now() - startTime;
    console.log(videoLength);
    $('#record').html('Try Again');
    $('#record').off('click');
    $('#record').click(function() {
      $('#reset').remove();
      video.src = URL.createObjectURL(stream);
      video.controls = false;
      video.loop = false;
      record(video, stream);
    });
    $('#controls').append($('<button id="reset">Pick Another Window</button>'));
    $('#reset').click(function(e) {
      video.scr = '';
      video.controls = false;
      video.loop = false;
      $(this).remove();
      $('#record').html('Record');
      $('#record').off('click');
      $('#record').click(function() {
        record(video, stream);
      });
      selectWindow(e);
    });
    var recordedBlob = recordRTC.getBlob();
    chrome.runtime.sendMessage({
      'action': 'crop',
      'url': videoWebURL,
      'width': 1920,
      'height': 1200,
      'horizontal': 0,
      'vertical': 0,
    }, function(croppedURL) {
      video.src = croppedURL;
      video.controls = true;
      video.loop = true;
      
    });
    
    // $('body').append($('<img/>'));
    // $('img').src = videoWebURL;

    recordRTC.getDataURL(function(dataURL) { });
  });
}

function record(video, stream) {
  startTime = Date.now();
  options.video = video;
  recordRTC = RecordRTC(stream, options);
  recordRTC.startRecording();
  $('#record').html('Stop');
  $('#record').off('click');
  $('#record').click(function () {
    processVideo(video, stream);
  });
}

function gotStream(stream) {
  $('#start').remove();
  console.log("Received local stream");
  var video = document.querySelector("video");
  console.log(stream);
  video.src = URL.createObjectURL(stream);
  stream.onended = function() { console.log("Ended"); };

  $('#controls').append($('<button id="record">Record</button>'));
  $('#record').click(function() {
    record(video, stream);
  });
}

function getUserMediaError() {
  console.log("getUserMedia() failed.");
}

function onAccessApproved(id) {
  if (!id) {
    console.log("Access rejected.");
    return;
  }
  navigator.webkitGetUserMedia({
      audio: false,
      video: { mandatory: { chromeMediaSource: "desktop",
                            chromeMediaSourceId: id,
                            maxWidth: 1920,
                            maxHeight: 1200 } }
  }, gotStream, getUserMediaError);
}

var pending_request_id = null;

$(document).ready(function() {

  function selectWindow(e) {
    pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
        ["screen", "window"], onAccessApproved);
  }

  $('#start').on('click', selectWindow);

  $('#cancel').on('click', function(e) {
    if (pending_request_id !== null) {
      chrome.desktopCapture.cancelChooseDesktopMedia(pending_request_id);
    }
  });

  $('#startFromBackgroundPage')
      .on('click', function(e) {
        chrome.runtime.sendMessage(
            {}, function(response) { console.log(response.farewell); });
      });
});