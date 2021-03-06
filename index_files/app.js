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

var pending_request_id = null;

// options = {
//   type: 'gif',
//   frameRate: 400,
//   quality: 100,
//   width: 1920,
//   height: 1200
// };

function processVideo(video, stream) {
  $('#record').css({display: "none"});
  $('#record').off('click');
  videoLength = Date.now() - startTime;
  recordRTC.stopRecording(function(videoWebURL) {
    chrome.runtime.sendMessage({
      'action': 'crop',
      'url': videoWebURL,
      'width': 1920,
      'height': 1200,
      'horizontal': 0,
      'vertical': 0,
    }, function(croppedURL) {
      $('#record').html('Try Again');
      $('#record').css({display: 'inline-block'});
      $('#record').click(function() {
        $('#reset').remove();
        video.src = URL.createObjectURL(stream);
        video.controls = false;
        video.loop = false;
        record(video, stream);
      });
      $('#controls').append($('<button id="reset">Pick Another Window</button>'));
      $('#reset').click(function(e) {
        video.scr = false;
        video.controls = false;
        video.loop = false;
        $(this).remove();
        $('#record').remove();
        $('#subtitles').css({display: "none"});
        $('#sharing').css({display: "none"});
        selectWindow(e);
      });
      video.src = croppedURL;
      video.controls = true;
      video.loop = true;
      $('#subtitles').css({display: "block"});
      addSlider();
    });
  });
}

function record(video, stream) {
  startTime = Date.now();
  options.video = video;
  recordRTC = RecordRTC(stream, options);
  recordRTC.startRecording();
  startTime = Date.now();
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

function selectWindow(e) {
  pending_request_id = chrome.desktopCapture.chooseDesktopMedia(
    ["screen", "window"], onAccessApproved);
}

$(document).ready(function() {

  $('#start').on('click', selectWindow);

  $('#add').click(function() {
    console.log("Added!");
    addSlider();
  });

  $('#submit').click(function() {
    subtitles = [];
    optimize = $('#optimize').prop('checked');
    for (var j = 0; j < i; j++) {
      var sub = {};
      sub.start_time = $("#slider-range"+j).slider("values")[0];
      sub.end_time = $("#slider-range"+j).slider("values")[1];
      sub.text = $("#sub"+j).val();
      subtitles.push(sub);
    }
    $('#input').empty();
    $('#subtitles').css({display: 'none'});
    chrome.runtime.sendMessage({
      'action': 'subtitle',
      'url': video.src,
      'subtitles': subtitles,
      'optimize': optimize
    }, function(subbedURL) {
      $('#sharing').css({display: 'block'});
      // video.src = subbedURL;
      $(video).css({display: "none"});
      $img = $('<img width="640">');
      $('body').prepend($img);
      $img.attr({src: subbedURL});
      $('a').attr({href: subbedURL, download: 'screencap.gif'});
    });
  });
});