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

      const makeButton = (text, callback) => $('<button/>')
        .text(text)
        .on('click', callback)
        .appendTo($controlPanel);
      makeButton('Reset form', clearStore);
      makeButton('Sort students', sortStudents);
      makeButton('Copy list', copyToClipboard);

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

  function sortStudents() {
    const getData = (type) => x => $(x).data(type);
    const attending = getData('attending');
    const subject = getData('subject');
    const subjInd = x => subjectIndex( subject(x) );

    const sortBy = (a, b) => {
      // Sort by attendance
      if (attending(a) !== attending(b)) {
        return attending(a) ? -1 : 1;
      // Secondarily sort by subject index
      } else if (subjInd(a) !== subjInd(b)) {
        return subjInd(a) - subjInd(b);
      // Thirdly sort by subject alphabetically
      } else {
        return subject(a) < subject(b) ? -1 : 1;
      }
    };

    $row.detach()
      .sort(sortBy)
      .appendTo($tbody);

    updateDataIndexes();
  }

  function updateDataIndexes() {
    $tbody.find('tr').each(function(i) {
      var id = $(this).data('id');
      studentData[id].index = i;
      $(this).data('index', i);
    });
    updateStore();
  }

  function copyToClipboard() {
    // Select text of students column
    const range = document.createRange();
    range.selectNodeContents($students.get(0));
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);

    // Copy to clipboard
    document.execCommand('copy', true, null);

    // Deselect text again
    selection.removeAllRanges();

    // Display a brief message to user
    const buttonText = $(this).text();
    $(this).text('Copied!');
    window.setTimeout(() => $(this).text(buttonText), 3333);
  }

  function initSortable() {
    var sortable = Sortable.create($tbody[0], {
      draggable: '.attendee',
      handle: '.sortable-handle',
      onUpdate: updateDataIndexes
    });
  }

  function countAttendees() {
    const students = $students.find('.fa-check-square-o').length;
    const coaches = $('table.large-12.columns').eq(1).find('.fa-check-square-o').length;
    return { students, coaches };
  }


  const TUTORIAL_ORDER = [
    'i don\'t know, i\'m a complete beginner.',
    'html 1: introducing html',
    'html/css 2: introducing css',
    'html/css 3: beyond the basics',
    'html/css 4: css, layouts and formatting',
    'html/css 5: dive into html5 &amp; css3',
    'html/css 6: advanced html5',
    'html/css/js project',
    'html',
    'css',
    'js: introduction to javascript',
    'js: beginning javascript',
    'js: introduction to jquery',
    'js: http requests, ajax and apis',
    'js: http requests, ajax and apis (part 2)',
    'js: drawing in canvas',
    'js: introduction to testing',
    'js: building your own app',
    'javascript project',
    'javascript',
    'js',
    'introduction to version control',
    'command line',
    'ruby: introduction to ruby',
    'ruby: ruby basics',
    'ruby: ruby basics (part 2)',
    'ruby: object oriented ruby and inheritance',
    'ruby',
    'rails',
    'python',
    'java',
    'other'
  ];
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
