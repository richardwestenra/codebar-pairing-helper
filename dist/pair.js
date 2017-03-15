$(function() {
  console.log('pair.js loaded');

  function updateStore() {
    localStorage.setItem(STORE_NAME, JSON.stringify(studentData));
  }

  function retrieveStore() {
    studentData = JSON.parse(localStorage.getItem(STORE_NAME));
  }

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
      this.$row.find('.small-1').prepend(this.handle());
      this.$desc.find('span.has-tip').remove();
      this.$subject.attr('contenteditable', 'true');
    }
    updateData() {
      if (!studentData[this.id]) {
        studentData[this.id] = this.getDatum();
      } else {
        this.$subject.text(studentData[this.id].subject);
      }
      this.$row.data(studentData[this.id]);
    }
    getDatum() {
      const name = this.getName(),
        subject = this.getSubject();
      return {
        id: this.id,
        index: this.index,
        name,
        subject
      };
    }
  }

  var studentData = {};
  const STORE_NAME = 'codebarOrgPairing';

  // Parse and alter the DOM.
  var $students = $('#attendances');
  // Detach students from the DOM to improve performance
  var $tbody = $students.find('tbody').detach();
  var $row = $tbody.find('tr');

  // Retrieve data from the store
  if (localStorage.codebarOrgPairing) {
    retrieveStore();
  }

  // Get the details of each student
  $row.each(function(i) {
    const row = new Row($(this), i);
    row.updateHTML();
    row.updateData();
  });

  // If localStorage data exists then sort students by previous order
  if (localStorage.codebarOrgPairing) {
    $row.detach()
      .sort((a,b) => $(a).data('index') - $(b).data('index'))
      .appendTo($tbody);
  } else {
  }


  // Update data when editing
  $tbody.on('keydown', 'td.small-6 > small', function() {
    const id = $(this).data('id');
    studentData[id].subject = $(this).text();
    updateStore();
  });

  // Reattach to the DOM
  $students.append($tbody);

  $('<button/>').text('Reset form')
    .on('click', function() {
      if (confirm('Are you sure you want to delete all student pairings?')) {
        localStorage.removeItem(STORE_NAME);
        window.location.reload();
      }
    })
    .insertAfter($students);

  // Update the store with new data
  updateStore();

  var sortable = Sortable.create($tbody[0], {
    draggable: '.attendee',
    handle: '.sortable-handle',
    onUpdate: function(e) {
        $tbody.find('tr').each(function(i) {
        var id = $(this).data('id');
        studentData[id].index = i;
        $(this).data('index', i);
      });
      updateStore();
    }
  });
});
