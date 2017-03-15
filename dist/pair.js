$(function() {
  console.log('pair.js loaded');

  class Row {
    constructor($row, i) {
      this.$row = $row;
      this.$name = $row.find('.small-5').find('a');
      this.$desc = $row.find('.small-6');
      this.$subject = this.$desc.children('small');
      this.index = i;
      this.id = this.getID();
    }
    getID() {
      return this.$name.attr('href').match(/\d+/)[0];
    }
    getName() {
      return this.$name.html().replace(/([\r\n])/gm,'');
    }
    getSubject() {
      return this.$subject.text();
    }
    handle() {
      return $('<div/>').attr('class','fa fa-navicon sortable-handle')
    }
    updateHTML() {
      this.$row.data('id', this.id);
      this.$row.find('.small-1').prepend(this.handle());
      this.$desc.find('span.has-tip').remove();
      this.$subject.attr('contenteditable', 'true').data('id', this.id);
    }
    updateData(data) {
      const name = this.getName(),
        subject = this.getSubject()
      data[this.id] = {
        id: this.id,
        index: this.index,
        name,
        subject
      };
    }
  }

  // const ORDER = ['java','python','ruby','version control', 'command line', 'javascript', 'js', 'html']
  var studentData = {};

  // Parse and alter the DOM.
  var $students = $('#attendances');
  // Detach students from the DOM to improve performance
  var $tbody = $students.find('tbody').detach();
  var $row = $tbody.find('tr');

  // Get the details of each student
  $row.each(function(i) {
    const row = new Row($(this), i);
    row.updateHTML();
    row.updateData(studentData);
  });

  // Update data when editing
  $tbody.on('keydown', 'td.small-6 > small', function() {
    const id = $(this).data('id');
    studentData[id].subject = $(this).text();
    console.log(studentData[id]);
  });

  // Reattach to the DOM
  $students.append($tbody);
  console.log(studentData);

  var sortable = Sortable.create($tbody[0], {
    draggable: '.attendee',
    handle: '.sortable-handle',
    onUpdate: function(e) {
    }
  });
});
