$(document).ready(function() {
  var i = 0;
  var milliseconds = 15000; // TODO: HOW DO WE GET THIS
  function addSlider() {
    $('#input').append($('<p>\
                            <label for="amount'+i+'">Millisecond range:</label>\
                            <input type="text" id="amount'+
                              i+'" readonly style="border:0; color:#000000;">\
                          </p>'));
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
      max: milliseconds,
      value: i,
      values: [ 0, milliseconds ],
      slide: function( event, ui ) {
        // console.log($(this).prev("p").children("input").attr("id"));
        $( "#"+$(this).prev("p").children("input").attr("id") ).val(ui.values[ 0 ] + 
          " - " + ui.values[ 1 ] );
      }
    });
    $( "#amount"+i ).val($( "#slider-range"+i ).slider( "values", 0 ) +
      " - " + $( "#slider-range"+i ).slider( "values", 1 ) );
    i++;
  };

  addSlider();

  $('#add').click(function() {
    console.log("Added!");
    addSlider();
  });

  $('#check').click(function() {
    // TODO
    // send data to server for ffmpeg
    console.log("Checking all sliders and text:");
    var json = {}
    // TODO GET VIDEO FILENAME
    json.video = 'PLEASE HELP';
    json.subtitles = []
    for (var j = 0; j < i; j++) {
      var sub = {}
      sub.start_time = $("#slider-range"+j).slider("values")[0];
      sub.end_time = $("#slider-range"+j).slider("values")[1];
      sub.text = $("#sub"+j).val();
      json.subtitles.push(sub);
      var str = "";
      str += $("#slider-range"+j).slider("values")[0] + " ";
      str += $("#slider-range"+j).slider("values")[1] + " ";
      str += $("#sub"+j).val();
      console.log(str);
    }
    // json is ready to be sent
    console.log(json);
  });
});