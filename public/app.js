function scrapingstuff(){
  $("#results").text("");
  $.getJSON("/articles", function(data){

    for (var i = 0; i < data.length; i++) {
      // Display the apropos information on the page

      $("#results").prepend("<div class='panel panel-primary'><div class='panel-heading notespanel' data-id='"+data[i]._id+"'>" + data[i].title + "</div><div class='panel-body'><a href='" + data[i].link + "' target='_blank'>" + data[i].link + "</a></div></div>");
      //$("#articles").append("<p data-id='" + data[i]._id + "'>" + data[i].title + "<br />" + data[i].link + "</p>");
    }
  });
}
$(document).on("click", "#scrapebutton", function(){
  //$("#articles").empty();
  $.get("/scrape", function(dataall){
    console.log(dataall);

  });
  scrapingstuff();
});
$(document).on("click", "#enternote", function(){
  $.ajax({
    type: "POST",
    dataType: "json",
    url: "/submit",
    data: {
      title: $("#notetitleinput").val(),
      note: $("#notecontentinput").val()
    }
  }).done(function(data){
    $("#notesbox").append("<p class='dataentry' data-id=" + data._id + "><span class='dataTitle' data-id=" + data._id + ">" + data.title + "</span><span class=deleter>X</span></p>");
    $("#notetitleinput").val("");
    $("#notecontentinput").val("");
  })
})
$(document).on("click", ".deleter", function(){
  var selected = $(this).parent();
  $.ajax({
    type: "GET",
    url: "/delete/" + selected.attr("data-id"),
    success: function(response){
      selected.remove();
      $("#notetitleinput").val("");
      $("#notecontentinput").val("");

    }
  })
})
// Whenever someone clicks a p tag
$(document).on("click", ".notespanel", function() {
  // Empty the notes from the note section
  //$("#notes").empty();
  $("#notesmodal").modal();
  e.preventDefault();
  // Save the id from the p tag
  var thisId = $(this).attr("data-id");

  // Now make an ajax call for the Article
  $.ajax({
    method: "GET",
    url: "/articles/" + thisId
  })
    // With that done, add the note information to the page
    .done(function(data) {
      console.log(data);
      // The title of the article
      $("#notesbox").append("<h2>" + data.title + "</h2>");
      // An input to enter a new title
      $("#notesbox").append("<input id='titleinput' name='title' >");
      // A textarea to add a new note body
      $("#notesbox").append("<textarea id='bodyinput' name='body'></textarea>");
      // A button to submit a new note, with the id of the article saved to it
      $("#notesbox").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");

      // If there's a note in the article
      if (data.note) {
        // Place the title of the note in the title input
        $("#titleinput").val(data.note.title);
        // Place the body of the note in the body textarea
        $("#bodyinput").val(data.note.body);
      }
    });
});