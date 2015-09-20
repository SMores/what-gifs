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
var i = 0;

// options = {
//   type: 'gif',
//   frameRate: 400,
//   quality: 100,
//   width: 1920,
//   height: 1200
// };

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
      $('#subtitles').css({display: "block"});
      addSlider();
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

function addSlider() {
  $('#input').append($('<p><label for="amount'+i+'">Second range:</label><input type="text" id="amount'+i+'" readonly style="border:0; color:#000000;"></p>'));
  // $('#input').append($(
  //   '<p>\
  //   <label for="amount">Price range:</label>\
  //   <input type="text" id="amount" readonly style="border:0; color:#f6931f; font-weight:bold;">\
  //   </p>'));
  $('#input').append($('<div id="slider-range' + i + '"></div><br>'));
  $('#input').append($('<input id="sub' + i + '" type="text"></div><br><br>'));
  $("#slider-range"+i ).slider({
    range: true,
    min: 0,
    max: videoLength,
    value: i,
    values: [ 0, videoLength ],
    slide: function( event, ui ) {
      var low = ui.values[0] / 1000;
      var high = ui.values[1] / 1000;
      // console.log($(this).prev("p").children("input").attr("id"));
      $( "#"+$(this).prev("p").children("input").attr("id") ).val(low + 
        " - " + high);
    }
  });
  $( "#amount"+i ).val($( "#slider-range"+i ).slider( "values", 0 ) +
    " - " + ($( "#slider-range"+i ).slider( "values", 1 ) / 1000) );
  i++;
}

$(document).ready(function() {

  function selectWindow(e) {
    pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
        ["screen", "window"], onAccessApproved);
  }

  $('#start').on('click', selectWindow);

  $('#add').click(function() {
    console.log("Added!");
    addSlider();
  });

  $('#submit').click(function() {
    console.log("Checking all sliders and text:");
    subtitles = [];
    for (var j = 0; j < i; j++) {
      var sub = {};
      sub.start_time = $("#slider-range"+j).slider("values")[0];
      sub.end_time = $("#slider-range"+j).slider("values")[1];
      sub.text = $("#sub"+j).val();
      subtitles.push(sub);
    }
    chrome.runtime.sendMessage({
      'action': 'subtitle',
      'url': video.src,
      'subtitles': subtitles
    }, function(subbedURL) {
      video.src = subbedURL;
    });
  });
});