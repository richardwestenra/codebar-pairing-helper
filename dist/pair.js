$(function() {
  console.log('pair.js loaded');

  /**
   * Individual student row class
   * Prettifies HTML (removing unnecessary cruft and making it editable)
   * and saves student data to a store object
   */
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
    getColour() {
      const hue = subjectIndex(this.getSubject()) * 10;
      return this.getAttendance() ? `hsl(${hue}, 100%, 93%)` : null;
    }
    handle() {
      return $('<div/>').attr('class','fa fa-navicon sortable-handle')
    }
    updateHTML() {
      this.$row.css('background-color', this.getColour());
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

  /**
   * Copy student data to localStorage
   */
  function updateStore() {
    localStorage.setItem(STORE_NAME, JSON.stringify(studentData));
  }

  /**
   * Retrieve student data from localStorage
   */
  function retrieveStore() {
    studentData = JSON.parse(localStorage.getItem(STORE_NAME));
  }

  /**
   * Clear all student data in localStorage
   */
  function clearStore() {
    if (confirm('Are you sure you want to delete all student pairings?')) {
      localStorage.removeItem(STORE_NAME);
      studentData = {};
    }
  }

  /**
   * Perform student row setup on page load:
   * Format HTML, get data, sort rows, setup input event listeners, etc
   */
  function initStudentHtml() {
    // Detach from the DOM to improve performance
    $tbody.detach();
    
    // Format student rows and retrieve data
    $row.each(function(i) {
      const row = new Row($(this), i);
      row.updateHTML();
      row.updateData();
    });

    // Restore previous sort order if store data exists
    if (localStorage[STORE_NAME]) {
      $row.detach()
        .sort((a,b) => {
          return $(a).data('index') - $(b).data('index')
        })
        .appendTo($tbody);
    }

    // Update data when editing
    $tbody.on('keyup', 'td.small-6 > small', function() {
      const id = $(this).data('id');
      studentData[id].subject = $(this).text();
      updateStore();
    });

    // Reattach to the DOM
    $students.append($tbody);
  }

  /**
   * Setup the control panel HTML: Buttons, HUD, etc.
   */
  function initControlPanel() {
    const count = countAttendees();

    if (!$('#pair-control-panel').length) {
      // If it doesn't exist, create it:
      var $controlPanel =  $('<div/>', {
        id: 'pair-control-panel',
        class: 'pair-control-panel'
      });

      const makeButton = (text, callback) => $('<button/>')
        .text(text)
        .on('click', callback)
        .appendTo($controlPanel);
      makeButton('Reset', clearStore);
      makeButton('Sort students', sortStudents);
      makeButton('Copy list', copyToClipboard);

      // Create attendance counters
      $controlPanel.append(`<ul class="attendee-count">
        <li>Student attendees: <b id="student-count">${count.students}</b></li>
        <li>Coach attendees: <b id="coach-count">${count.coaches}</b></li>
      </ul>`);

      $controlPanel.insertBefore($students);
    } else {
      // If it already exists, update the counters
      $('#student-count').html(count.students);
      $('#coach-count').html(count.coaches);
    }
  }

  /**
   * Get the index (order) of a subject
   * @param  {string} subject - The student's subject to match
   * @return {number} The order of precedence for that subject
   */
  function subjectIndex(subject) {
    const firstInstance = TUTORIAL_ORDER.find(order => 
      !!subject.toLowerCase().match(order)
    );

    // Push unknown subjects to the top of the list
    if (!firstInstance) {
      return TUTORIAL_ORDER.length;
    }

    return TUTORIAL_ORDER.indexOf(firstInstance);
  }

  /**
   * Sort student rows by attendance (Boolean) and subject (string)
   */
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
        return subjInd(b) - subjInd(a);
      // Thirdly sort by subject alphabetically
      } else {
        return subject(b) < subject(a) ? -1 : 1;
      }
    };

    $row.detach()
      .sort(sortBy)
      .appendTo($tbody);

    updateDataIndexes();
  }

  /**
   * When rows have been reordered, recalculate their order indexes,
   * and save this info to the studentData object and update localStorage
   */
  function updateDataIndexes() {
    $tbody.find('tr').each(function(i) {
      const id = $(this).data('id');
      studentData[id].index = i;
      $(this).data('index', i);
    });

    updateStore();
  }

  /**
   * Copy the list of students to the clipboard
   */
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

  /**
   * Initialise Sortable, the third-party drag-and-drop functionality
   */
  function initSortable() {
    Sortable.create($tbody[0], {
      draggable: '.attendee',
      handle: '.sortable-handle',
      onUpdate: updateDataIndexes
    });
  }

  /**
   * Count the number of students and coaches who have been signed in
   * @return {object} The number of attending students & coaches
   */
  function countAttendees() {
    const students = $students.find('.fa-check-square-o').length;
    const coaches = $coaches.find('.fa-check-square-o').length;
    return { students, coaches };
  }


  /**
   * Declare global variables
   */
  const TUTORIAL_ORDER = [
    'i don\'t know, i\'m a complete beginner.',
    'html 1',
    'html/css 2',
    'html/css 3',
    'html/css 4',
    'html/css 5',
    'html/css 6',
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
    'version control',
    'command line',
    'ruby: introduction to ruby',
    'ruby: ruby basics',
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
  var $coaches = $('table.large-12.columns').filter(function() {
    // This is why you use IDs & classes properly, kids 🙄
    return $(this).parent()
      .prev()
      .find('h4')
      .text()
      .match('Coaches');
  });

  // Append styles
  $('head').append( $('<style/>').html(
    `.attendee .small-1 {
      position: relative;
    }
    .attendee .fa-navicon {
      position: absolute;
      left: -22px;
      cursor: move;
      cursor: -webkit-grab;
    }
    .attendee .fa-navicon:active {
      cursor: -webkit-grabbing;
    }
    .sortable-chosen {
      background: lemonchiffon;
    }
    .pair-control-panel button {
      padding: 0.2rem 0.5rem;
      margin-right: 1rem;
    }
    .attendee-count {
      list-style: none;
      margin-left: 0;
    }
    .attendee-count b {
      font-size: 1.4rem;
    }
    /* Remove whitespace next to icons, to make copying text easier */
    .attendee .has-tip {
      float: left;
      margin-right: 0.2em;
    }`
  ));



  /**
   * Initialise application
   */
  if (localStorage[STORE_NAME]) {
    retrieveStore();
  }
  initStudentHtml();
  initControlPanel();
  updateStore();
  initSortable();
});
