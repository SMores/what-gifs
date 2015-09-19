$(document).ready(function() {
  function addSlider() {
    $( "#slider-range" ).slider({
      range: true,
      min: 0,
      max: 500,
      values: [ 0, 500 ],
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.values[ 0 ] + " - $" + ui.values[ 1 ] );
      }
    });
    $( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
      " - $" + $( "#slider-range" ).slider( "values", 1 ) );
  };
  addSlider();
  $('button').click(function() {
    console.log("clicked!");
    // console.log($( "#amount" ).val( "$" + $( "#slider-range" ).slider( "values", 0 ) +
    //   " - $" + $( "#slider-range" ).slider( "values", 1 )));
    console.log($("#slider-range").slider("values")[0]);
    console.log($("#slider-range").slider("values")[1]);
    console.log($('#sub').val());
  });
});