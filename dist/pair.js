$(function() {
  console.log('pair.js loaded');

  class Row {
    constructor($row, i) {
      this.$row = $row;
      this.$checkbox = $row.find('.small-1').find('i');
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
    getAttendance() {
      return this.$checkbox.hasClass('fa-check-square-o');
    }
    handle() {
      return $('<div/>').attr('class','fa fa-navicon sortable-handle')
    }
    updateHTML() {
      if (!this.$row.data('id')) {
        this.$row.find('.small-1').prepend(this.handle());
        this.$desc.find('span.has-tip').remove();
        this.$subject.attr('contenteditable', 'true').before(' - ');
      }
    }
    updateData() {
      if (studentData[this.id]) {
        studentData[this.id].attending = this.getAttendance();
      } else {
        studentData[this.id] = this.getDatum();
      }
      this.$subject.text(studentData[this.id].subject);
      this.$row.data(studentData[this.id]);
      this.$subject.data(studentData[this.id]);
    }
    getDatum() {
      const name = this.getName(),
        subject = this.getSubject();
      return {
        attending: this.getAttendance(),
        id: this.id,
        index: this.index,
        name,
        subject
      };
    }
  }

  function updateStore() {
    localStorage.setItem(STORE_NAME, JSON.stringify(studentData));
  }

  function retrieveStore() {
    studentData = JSON.parse(localStorage.getItem(STORE_NAME));
  }

  function clearStore() {
    if (confirm('Are you sure you want to delete all student pairings?')) {
      localStorage.removeItem(STORE_NAME);
      studentData = {};
    }
  }

  function initStudentHtml() {
    $tbody.detach();
    
    // Format student rows and retrieve data
    $row.each(function(i) {
      const row = new Row($(this), i);
      row.updateHTML();
      row.updateData();
      // subjects.push($(this).data('subject'));
    });

    if (localStorage[STORE_NAME]) {
      $row.detach()
        .sort((a,b) => {
          return $(a).data('index') - $(b).data('index')
        })
        .appendTo($tbody);
    }

    // Update data when editing
    $tbody.on('keydown', 'td.small-6 > small', function() {
      const id = $(this).data('id');
      studentData[id].subject = $(this).text();
      updateStore();
    });

    // Reattach to the DOM
    $students.append($tbody);
  }

  function initControlPanel() {
    const count = countAttendees();

    if (!$('#pair-control-panel').length) {
      var $controlPanel =  $('<div/>', {
        id: 'pair-control-panel',
        class: 'pair-control-panel'
      });

      const makeButton = (text, callback) => {
        $('<button/>')
          .text(text)
          .on('click', callback)
          .appendTo($controlPanel);
      };
      makeButton('Reset form', clearStore);
      makeButton('Sort by attendance', sortStudents('attending'));
      makeButton('Sort by subject', sortStudents('subject'));

      $controlPanel.append(`<ul class="attendee-count">
        <li>Student attendees: <b id="student-count">${count.students}</b></li>
        <li>Coach attendees: <b id="coach-count">${count.coaches}</b></li>
      </ul>`);

      $controlPanel.insertBefore($students);
    } else {
      $('#student-count').html(count.students);
      $('#coach-count').html(count.coaches);
    }
  }

  function subjectIndex(subject) {
    const firstInstance = TUTORIAL_ORDER.find(order => 
      !!subject.toLowerCase().match(order)
    );
    return TUTORIAL_ORDER.indexOf(firstInstance);
  }

  function sortStudents(type) {
    const getData = (a, b) => {
      const d = x => $(x).data(type);
      return { a: d(a), b: d(b) };
    };

    const sortBy = {
      attending: (a, b) => {
        const d = getData(a, b);
        if (d.a === d.b) {
          return 0;
        }
        return d.a ? -1 : 1;
      },
      subject: (a, b) => {
        const d = getData(a, b);
        return subjectIndex(d.a) - subjectIndex(d.b);
      }
    };

    return () => $row.detach()
      .sort(sortBy[type])
      .appendTo($tbody);
  }

  function initSortable() {
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
  }

  function countAttendees() {
    const students = $students.find('.fa-check-square-o').length;
    const coaches = $('table.large-12.columns').eq(1).find('.fa-check-square-o').length;
    return { students, coaches };
  }


  const TUTORIAL_ORDER = ['html','css','js','javascript','project','version control','command line','ruby','python','java','android','php','other'];
  var studentData = {};
  const workshopID = window.location.pathname.match(/\d+/)[0];
  const STORE_NAME = 'codebarOrgPairing' + workshopID;

  // Parse and alter the DOM.
  var $students = $('#attendances');
  // Detach students from the DOM to improve performance
  var $tbody = $students.find('tbody').detach();
  var $row = $tbody.find('tr');

  // Retrieve data from the store
  if (localStorage[STORE_NAME]) {
    retrieveStore();
  }

  initStudentHtml();
  initControlPanel();
  updateStore();
  initSortable();
  console.log(countAttendees());
});
