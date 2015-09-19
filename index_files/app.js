// Copyright 2013 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var recordRTC;

var options = {
  type: 'video',
  width: 1920,
  height: 1200
};

// options = {
//   type: 'gif',
//   frameRate: 400,
//   quality: 100,
//   width: 1920,
//   height: 1200
// };

function gotStream(stream) {
  $('#start').remove();
  console.log("Received local stream");
  var video = document.querySelector("video");
  video.src = URL.createObjectURL(stream);
  localstream = stream;
  stream.onended = function() { console.log("Ended"); };

  $('#controls').append($('<button id="record">Record</button>'));
  $('#record').click(function() {
    options.video = video;
    recordRTC = RecordRTC(stream, options);
    recordRTC.startRecording();
    $('#record').html('Stop');
    $('#record').off('click');
    $('#record').click(function () {
      $('#sharing').css({display: 'block'});
      recordRTC.stopRecording(function(videoWebURL) {
        var recordedBlob = recordRTC.getBlob();
        chrome.runtime.sendMessage({
          'action': 'crop',
          'url': videoWebURL,
          'width': 1920,
          'height': 1200,
          'horizontal': 0,
          'vertical': 0,
        }, function(response) {
          console.log("SUCCESS!");
          console.log(response);
          video.src = videoWebURL;
          video.controls = true;
          video.loop = true;
        });
        
        // $('body').append($('<img/>'));
        // $('img').src = videoWebURL;

        recordRTC.getDataURL(function(dataURL) { });
      });
    });
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
  $('#start').on('click', function(e) {
    pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
        ["screen", "window"], onAccessApproved);
  });

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