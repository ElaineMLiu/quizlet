//alert(1);
// This jQuery javascript is sourced at the bottom of the footer.ejs, which is basically al the view files' footers
// 1) This script attaches on-click event to DELETE button with class '.delete-quiz' in index.ejs, and
// 2) it gets the quiz _id  from DELETE button's attribute 'data-id'
// This is more secure than using a get request? Still passing id in URL though?
// 3) Then we use an Ajax request to the server to delete, sending the quiz_id through url
// 4) The ajax request is to /article/quiz_id.  We make a route for it in app.js as app.delete('/article/:id')
// from the customerapp example, we add in the confirmation alert box before delete starts


$(document).ready(function(){
  $('.delete-quiz').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    var confirmation = confirm("Are you sure you want to delete?");//("Really delete "+id+"?");
    if(confirmation){
      $.ajax({
        type: 'DELETE',
        url: '/quizzes/delete/'+id,
        success: function(response){
          //alert('Deleting Quiz');
          window.location.href='/';  //javascript redirect to homepage
        },
        error: function(err){
          console.log(err);
        }
      }); //end ajax
    } //end confirmation

  });//end onclick callback
});

/*
$(document).ready(function(){
  $('.delete-quiz').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    //popup yes,cancel box
    var confirmation = confirm("Are You Sure?");
    if(confirmation){
      //alert(1);
      //make an ajax delete request to server, we'll need to make the delete route in app.js, SERVER
      $.ajax({
        type:'DELETE',
        url: '/quizzes/delete/'+id, //data_id a-tag attribute is the user's ID from the table in mongoDB, this is the atag that is onclicked doing this callback
        //url: '/users/delete/'+$('.deleteUser').data('id') //since all the delete a-tags have same class, this would delete the first one
        success: function(response){
          //alert('Deleting Quiz');
          window.location.href='/';  //javascript redirect to homepage
        },
        error: function(err){
          console.log(err);
        }
      });
*/

/*

function deleteQuiz(){
  //alert(1);

  //popup yes,cancel box
  var confirmation = confirm("Are You Sure?");
  if(confirmation){
    //alert(1);
    //make an ajax delete request to server, we'll need to make the delete route in app.js, SERVER
    $.ajax({
      type:'DELETE',
      url: '/quizzes/delete/'+$(this).data('id'), //data_id a-tag attribute is the user's ID from the table in mongoDB, this is the atag that is onclicked doing this callback
      //url: '/users/delete/'+$('.deleteUser').data('id') //since all the delete a-tags have same class, this would delete the first one
      success: function(response){
        //alert('Deleting Quiz');
        window.location.href='/';  //javascript redirect to homepage
      },
      error: function(err){
        console.log(err);
      }
    });

}
*/

$(document).ready(function(){
  $('.delete-question').on('click', function(e){
    $target = $(e.target);
    const id = $target.attr('data-id');
    const qid = $target.attr('data-qid');
    var confirmation = confirm("Are you sure you want to delete the question?");//("Really delete "+id+"?");
    if(confirmation){
      $.ajax({
        type: 'DELETE',
        url: '/quizzes/questions/delete/'+id,
        success: function(response){
          //alert('Deleting Quiz');
          window.location.href='/quizzes/questions/add/' + qid;  //javascript redirect to homepage
        },
        error: function(err){
          console.log(err);
        }
      }); //end ajax
    } //end confirmation

  });//end onclick callback
});
