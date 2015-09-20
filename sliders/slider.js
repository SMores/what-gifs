$(document).ready(function() {
  var i = 0;
  var seconds = 500; // TODO: HOW DO WE GET THIS
  function addSlider() {
    $('#input').append($('<div id="slider-range' + i + '"></div><br>'));
    $('#input').append($('<input id="sub' + i + '" type="text"></div><br><br>'));
    $( "#slider-range"+i ).slider({
      range: true,
      min: 0,
      max: seconds,
      values: [ 0, seconds ],
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
      }
    });
    $( "#amount" ).val( "$" + $( "#slider-range"+i ).slider( "values", 0 ) +
      " - $" + $( "#slider-range"+i ).slider( "values", 1 ) );
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
    for (var j = 0; j < i; j++) {
      var str = "";
      str += $("#slider-range"+j).slider("values")[0] + " ";
      str += $("#slider-range"+j).slider("values")[1] + " ";
      str += $("#sub"+j).val();
      console.log(str);
    }
  });
});