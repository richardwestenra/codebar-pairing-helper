$(function() {
  console.log('pair.js loaded');

  // const ORDER = ['java','python','ruby','version control', 'command line', 'javascript', 'js', 'html']
  var studentData = {};

  // Parse and alter the DOM.
  var $students = $('#attendances');
  // Detach students from the DOM to improve performance
  var $tbody = $students.find('tbody').detach();
  var $row = $tbody.find('tr');

  // Get the details of each student
  $row.each(function(i) {
    var $name = $(this).find('.small-5').find('a');
    var id = $name.attr('href').match(/\d+/)[0];
    var name = $name.html();
    var $desc = $(this).find('.small-6');
    $desc.find('span.has-tip').remove();
    var $subject = $desc.find('small');
    var subject = $subject.text();
    $subject.attr('contenteditable','true').on('keydown', function(){
      console.log($(this).text());
    });
    $(this).find('.small-1').prepend(
      $('<div/>').attr('class','fa fa-navicon sortable-handle')
    );
    studentData[id] = {
      initialOrder: i,
      currentOrder: i,
      name,
      subject
    };
  });

  // Reattach to the DOM
  $students.append($tbody);
  console.log(studentData);

  var sortable = Sortable.create($tbody[0], {
    draggable: '.attendee',
    handle: '.sortable-handle',
    onUpdate: function (evt){
      console.log(evt);
       var item = evt.item; // the current dragged HTMLElement
    }
  });
});
